import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";
import { Miniflare } from "miniflare";
let mf, db, exchange, hash, verifyGoogleToken, env;
const base = "https://controllattice.com";
const seconds = () => Math.floor(Date.now() / 1000);
async function call(
  path,
  {
    user,
    method = "GET",
    data,
    csrf = true,
    origin = base,
    posting = true,
  } = {},
) {
  const headers = {};
  if (user) headers.cookie = `__Host-exchange=${user}-session`;
  if (csrf && user) headers["x-csrf-token"] = user + "-csrf";
  if (method !== "GET") headers.origin = origin;
  if (data !== undefined) headers["content-type"] = "application/json";
  return exchange(
    new Request(base + "/api/exchange" + path, {
      method,
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
    { ...env, EXCHANGE_POSTING_ENABLED: posting ? "true" : "false" },
  );
}
async function result(path, options) {
  const r = await call(path, options);
  return { status: r.status, data: await r.json(), response: r };
}
before(async () => {
  await mkdir(".test-build", { recursive: true });
  await build({
    entryPoints: ["worker/exchange.ts"],
    outfile: ".test-build/exchange.mjs",
    bundle: true,
    platform: "node",
    format: "esm",
  });
  ({ exchange, hash, verifyGoogleToken } = await import(
    "../.test-build/exchange.mjs?" + Date.now()
  ));
  mf = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("test")}}',
    compatibilityDate: "2026-04-01",
    d1Databases: ["EXCHANGE_DB"],
  });
  db = await mf.getD1Database("EXCHANGE_DB");
  let migration = await readFile("drizzle/0000_cultured_mandroid.sql", "utf8");
  for (const sql of migration.split("--> statement-breakpoint"))
    if (sql.trim()) await db.prepare(sql).run();
  env = {
    EXCHANGE_DB: db,
    EXCHANGE_ORIGIN: base,
    EXCHANGE_POSTING_ENABLED: "true",
    EXCHANGE_SETUP_TOKEN: "test-setup-only",
  };
  for (const [id, role, trusted] of [
    ["admin", "admin", 1],
    ["alice", "member", 0],
    ["bob", "member", 1],
  ]) {
    await db
      .prepare(
        "INSERT INTO exchange_users (id,google_sub,display_name,role,trusted,banned,organization,created_at) VALUES (?,?,?,?,?,0,0,?)",
      )
      .bind(id, id + "-google", id, role, trusted, seconds())
      .run();
    await db
      .prepare(
        "INSERT INTO exchange_sessions (token_hash,user_id,csrf,expires_at) VALUES (?,?,?,?)",
      )
      .bind(await hash(id + "-session"), id, id + "-csrf", seconds() + 3600)
      .run();
  }
  const response = await exchange(
    new Request(base + "/api/exchange/setup", {
      method: "POST",
      headers: { authorization: "Bearer test-setup-only" },
    }),
    env,
  );
  assert.equal(response.status, 200);
});
after(async () => {
  await mf?.dispose();
});
test("anonymous browse, seed labels, search, categories and no email", async () => {
  const feed = await result("/threads");
  assert.equal(feed.status, 200);
  assert.equal(feed.data.threads.length, 3);
  assert.ok(
    feed.data.threads.every(
      (t) => t.starter && t.display_name === "Control Lattice Systems",
    ),
  );
  assert.equal(JSON.stringify(feed.data).includes("google_sub"), false);
  assert.equal((await result("/topics")).data.topics.length, 5);
  assert.equal((await result("/threads?q=Diagnosis")).data.threads.length, 1);
  assert.equal(
    (await result("/threads?category=twins")).data.threads.length,
    1,
  );
  assert.equal((await result("/admin")).status, 403);
  assert.equal((await result("/session")).data.user, null);
});
test("closed release gate, authentication, CSRF and impersonation checks", async () => {
  assert.equal(
    (await result("/threads", { method: "POST", data: {} })).status,
    401,
  );
  assert.equal(
    (
      await result("/threads", {
        user: "alice",
        method: "POST",
        data: {},
        posting: false,
      })
    ).status,
    503,
  );
  assert.equal(
    (
      await result("/threads", {
        user: "alice",
        method: "POST",
        data: {},
        csrf: false,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await result("/threads", {
        user: "alice",
        method: "POST",
        data: {},
        origin: "https://evil.example",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await result("/admin", {
        user: "alice",
        method: "POST",
        data: { action: "seed", role: "admin" },
      })
    ).status,
    403,
  );
  assert.equal((await result("/auth/start")).status, 503);
  assert.equal(
    (
      await result("/profile", {
        user: "alice",
        method: "PATCH",
        data: { display_name: "Administrator", role: "admin" },
      })
    ).status,
    400,
  );
});
let aliceThread, bobReply, child;
test("new-member thread approval and real persistent storage", async () => {
  const created = await result("/threads", {
    user: "alice",
    method: "POST",
    data: {
      topic_id: "controls",
      title: "Testing operator evidence",
      body: "Useful technical evidence from a test fixture.",
      role: "admin",
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.status, "pending");
  aliceThread = created.data.id;
  assert.equal((await result("/threads/" + aliceThread)).status, 404);
  assert.equal(
    (await result("/threads/" + aliceThread, { user: "alice" })).status,
    200,
  );
  assert.equal(
    (
      await db
        .prepare("SELECT role FROM exchange_users WHERE id=?")
        .bind("alice")
        .first()
    ).role,
    "member",
  );
  assert.equal(
    (
      await result("/admin", {
        user: "admin",
        method: "POST",
        data: { kind: "thread", id: aliceThread, action: "publish" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await result("/threads/" + aliceThread)).data.thread.status,
    "published",
  );
  assert.equal(
    (
      await db
        .prepare("SELECT body FROM exchange_threads WHERE id=?")
        .bind(aliceThread)
        .first()
    ).body,
    "Useful technical evidence from a test fixture.",
  );
});
test("trusted replies, threaded replies, pending visibility and invalid parents", async () => {
  assert.equal((await db.prepare("SELECT trusted FROM exchange_users WHERE id='alice'").first()).trusted, 1);
  const direct = await result("/threads/detection-is-not-diagnosis/replies", {user:"alice", method:"POST", data:{body:"My first contribution was approved, so this reply is public."}});
  assert.equal(direct.data.status, "published");
  // Administrators can require review again for an established member.
  await result("/admin", {user:"admin", method:"POST", data:{kind:"user",id:"alice",action:"untrust"}});

  const reply = await result("/threads/" + aliceThread + "/replies", {
    user: "bob",
    method: "POST",
    data: { body: "First validate the timestamp and the independent sensor." },
  });
  assert.equal(reply.data.status, "published");
  bobReply = reply.data.id;
  const nested = await result("/threads/" + aliceThread + "/replies", {
    user: "alice",
    method: "POST",
    data: {
      body: "I would also compare the command and readback.",
      parent_id: bobReply,
    },
  });
  assert.equal(nested.data.status, "pending");
  child = nested.data.id;
  assert.ok((await result("/threads/" + aliceThread, {user:"alice"})).data.replies.some(r => r.id === child && r.status === "pending"));
  const pendingAlert = await db.prepare("SELECT action FROM exchange_moderation_log WHERE target_id=? AND action='notification_pending'").bind(child).first();
  assert.ok(pendingAlert);
  assert.equal(
    (await result("/threads/" + aliceThread)).data.replies.length,
    1,
  );
  assert.equal(
    (
      await result("/threads/" + aliceThread + "/replies", {
        user: "bob",
        method: "POST",
        data: { body: "Another useful test comment.", parent_id: "missing" },
      })
    ).status,
    400,
  );
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "reply", id: child, action: "publish" },
  });
  assert.equal(
    (await result("/threads/" + aliceThread)).data.replies.length,
    2,
  );
});
test("reactions are idempotent, reports restricted and moderation audited", async () => {
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await result("/threads/" + aliceThread + "/reaction", {
          user: "bob",
          method: "POST",
          data: { liked: true },
        })
      ).status,
      200,
    );
  assert.equal(
    (await result("/threads/" + aliceThread)).data.thread.reactions,
    1,
  );
  assert.equal(
    (
      await result("/reports", {
        user: "bob",
        method: "POST",
        data: {
          kind: "thread",
          id: aliceThread,
          reason: "Test fixture report for moderation.",
        },
      })
    ).status,
    200,
  );
  const queue = (await result("/admin", { user: "admin" })).data;
  assert.equal(queue.reports.length, 1);
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "report", id: queue.reports[0].id, action: "resolve" },
  });
  assert.equal(
    (await result("/admin", { user: "admin" })).data.reports.length,
    0,
  );
  assert.ok(
    (
      await db
        .prepare("SELECT COUNT(*) AS n FROM exchange_moderation_log")
        .first()
    ).n >= 3,
  );
});
test("ownership, locks, bans and edits returning to review", async () => {
  assert.equal(
    (
      await result("/threads/" + aliceThread, {
        user: "bob",
        method: "PATCH",
        data: { title: "Changed title", body: "Unauthorized ownership edit." },
      })
    ).status,
    403,
  );
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "thread", id: aliceThread, action: "lock" },
  });
  assert.equal(
    (
      await result("/threads/" + aliceThread + "/replies", {
        user: "bob",
        method: "POST",
        data: { body: "Locked discussion should reject this." },
      })
    ).status,
    403,
  );
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "thread", id: aliceThread, action: "unlock" },
  });
  const edited = await result("/threads/" + aliceThread, {
    user: "alice",
    method: "PATCH",
    data: {
      title: "Updated operator evidence",
      body: "Revised evidence for review by moderators.",
    },
  });
  assert.equal(edited.data.status, "pending");
  assert.equal((await result("/threads/" + aliceThread)).status, 404);
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "thread", id: aliceThread, action: "publish" },
  });
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "user", id: "bob", action: "ban" },
  });
  assert.equal(
    (
      await result("/threads/" + aliceThread + "/reaction", {
        user: "bob",
        method: "POST",
        data: { liked: false },
      })
    ).status,
    403,
  );
  await result("/admin", {
    user: "admin",
    method: "POST",
    data: { kind: "user", id: "bob", action: "unban" },
  });
});
test("validation and bounded rate limits", async () => {
  assert.equal(
    (
      await result("/threads", {
        user: "bob",
        method: "POST",
        data: {
          topic_id: "nonsense",
          title: "Invalid topic",
          body: "Invalid topic fixture.",
        },
      })
    ).status,
    400,
  );
  let last;
  for (let i = 0; i < 15; i++)
    last = await result("/threads", {
      user: "bob",
      method: "POST",
      data: { topic_id: "general", title: "short", body: "too short" },
    });
  assert.equal(last.status, 429);
});
test("session expiry, sign-out, account export and deletion", async () => {
  assert.ok(
    (await result("/account/export", { user: "alice" })).data.threads.length,
  );
  const deleted = await result("/account", {
    user: "alice",
    method: "DELETE",
    data: { confirm: "DELETE" },
  });
  assert.equal(deleted.status, 200);
  assert.equal((await result("/session", { user: "alice" })).data.user, null);
  assert.equal(
    (
      await db
        .prepare("SELECT google_sub FROM exchange_users WHERE id=?")
        .bind("alice")
        .first()
    ).google_sub,
    null,
  );
  await db
    .prepare("UPDATE exchange_sessions SET expires_at=? WHERE user_id=?")
    .bind(seconds() - 1, "bob")
    .run();
  assert.equal((await result("/session", { user: "bob" })).data.user, null);
  const out = await result("/logout", {
    user: "admin",
    method: "POST",
    data: {},
  });
  assert.equal(out.status, 200);
  assert.match(
    out.response.headers.get("set-cookie"),
    /HttpOnly; Secure; SameSite=Lax/,
  );
  assert.equal((await result("/admin", { user: "admin" })).status, 403);
});
test("Google JWT cryptographic verification rejects forged claims", async () => {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  jwk.kid = "test-key";
  const certs = async () => new Response(JSON.stringify({ keys: [jwk] }));
  const encode = (x) => Buffer.from(JSON.stringify(x)).toString("base64url");
  const header = encode({ alg: "RS256", kid: "test-key" });
  const claims = {
    iss: "https://accounts.google.com",
    aud: "client",
    sub: "verified-subject",
    email_verified: true,
    nonce: "nonce",
    iat: seconds(),
    exp: seconds() + 300,
  };
  async function token(p) {
    const data = header + "." + encode(p);
    return (
      data +
      "." +
      Buffer.from(
        await crypto.subtle.sign(
          "RSASSA-PKCS1-v1_5",
          pair.privateKey,
          new TextEncoder().encode(data),
        ),
      ).toString("base64url")
    );
  }
  assert.equal(
    (await verifyGoogleToken(await token(claims), "client", "nonce", certs))
      .sub,
    "verified-subject",
  );
  for (const changed of [
    { aud: "evil" },
    { iss: "https://evil.example" },
    { exp: seconds() - 1 },
    { nonce: "wrong" },
    { email_verified: false },
  ])
    await assert.rejects(() =>
      token({ ...claims, ...changed }).then((t) =>
        verifyGoogleToken(t, "client", "nonce", certs),
      ),
    );
  const valid = await token(claims);
  await assert.rejects(() =>
    verifyGoogleToken(valid.slice(0, -4) + "xxxx", "client", "nonce", certs),
  );
});

test('OAuth state, PKCE, verified account creation, cookie flags and replay', async () => {
  const oauthEnv={...env,GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret',EXCHANGE_ADMIN_SUB:'owner-verified-sub'};
  const start=await exchange(new Request(base+'/api/exchange/auth/start'),oauthEnv);
  assert.equal(start.status,302);
  const target=new URL(start.headers.get('location'));
  assert.equal(target.searchParams.get('code_challenge_method'),'S256');
  assert.equal(target.searchParams.get('scope'),'openid email');
  const state=target.searchParams.get('state'),nonce=target.searchParams.get('nonce');
  const callback=base+'/api/exchange/auth/callback?state='+state+'&code=test-code';
  assert.equal((await exchange(new Request(callback),oauthEnv)).status,401);
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='callback-key';
  const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const signed=encode({alg:'RS256',kid:jwk.kid})+'.'+encode({iss:'https://accounts.google.com',aud:'test-client',sub:'owner-verified-sub',nonce,email_verified:true,iat:seconds(),exp:seconds()+300,role:'admin'});
  const token=signed+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(signed))).toString('base64url');
  const original=globalThis.fetch;
  globalThis.fetch=async(url,options)=>{if(url==='https://oauth2.googleapis.com/token'){assert.ok(options.body.get('code_verifier'));assert.equal(options.body.get('redirect_uri'),base+'/api/exchange/auth/callback');return new Response(JSON.stringify({id_token:token}));}return new Response(JSON.stringify({keys:[jwk]}));};
  try {
    const signedIn=await exchange(new Request(callback,{headers:{cookie:'__Host-exchange-oauth='+state}}),oauthEnv);
    assert.equal(signedIn.status,302);
    const sessionCookie=signedIn.headers.getSetCookie().find(c=>c.startsWith('__Host-exchange='));
    assert.match(sessionCookie,/HttpOnly; Secure; SameSite=Lax/);
    const session=await exchange(new Request(base+'/api/exchange/session',{headers:{cookie:sessionCookie.split(';')[0]}}),oauthEnv);
    const user=(await session.json()).user;
    assert.equal(user.role,'admin');assert.equal(user.display_name,'New member');
    assert.equal((await exchange(new Request(callback,{headers:{cookie:'__Host-exchange-oauth='+state}}),oauthEnv)).status,401);
  } finally {globalThis.fetch=original;}
});

test("moderation email failures remain queued and retries use idempotency", async () => {
  const {deliverModerationNotifications} = await import("../.test-build/exchange.mjs");
  const queuedBefore = await db.prepare("SELECT COUNT(*) AS n FROM exchange_moderation_log WHERE action='notification_pending'").first();
  assert.ok(queuedBefore.n > 0);
  const previous = globalThis.fetch;
  const mailEnv = {...env,RESEND_API_KEY:"test-only",EXCHANGE_EMAIL_FROM:"Exchange <test@example.com>",EXCHANGE_MODERATION_EMAIL:"admin@example.com"};
  try {
    globalThis.fetch = async () => new Response("unavailable", {status:503});
    await deliverModerationNotifications(mailEnv);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM exchange_moderation_log WHERE action='notification_pending'").first()).n, queuedBefore.n);
    let sent = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(url,"https://api.resend.com/emails");
      assert.ok(options.headers["Idempotency-Key"].startsWith("notification-"));
      const body=JSON.parse(options.body);
      assert.deepEqual(body.to,["admin@example.com"]);
      assert.match(body.text,/discussions\/admin/);
      assert.equal(Object.hasOwn(body,"html"),false);
      sent++; return new Response('{"id":"test"}',{status:200});
    };
    await deliverModerationNotifications(mailEnv);
    assert.equal(sent, Math.min(5,queuedBefore.n));
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM exchange_moderation_log WHERE action='notification_pending'").first()).n,queuedBefore.n-sent);
  } finally { globalThis.fetch=previous; }
});
