/** Native Engineering Exchange API. All identity and authorization live server-side. */
export interface ExchangeEnv {
  EXCHANGE_DB?: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  EXCHANGE_ORIGIN?: string;
  EXCHANGE_ADMIN_SUB?: string;
  EXCHANGE_POSTING_ENABLED?: string;
  EXCHANGE_RATE_SALT?: string;
  EXCHANGE_SETUP_TOKEN?: string;
  RESEND_API_KEY?: string;
  EXCHANGE_EMAIL_FROM?: string;
  EXCHANGE_MODERATION_EMAIL?: string;
}
type Member = {
  id: string;
  display_name: string;
  role: string;
  trusted: number;
  banned: number;
  organization: number;
  csrf: string;
};
const now = () => Math.floor(Date.now() / 1000);
const encoder = new TextEncoder();
function b64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function unb64(value: string) {
  return Uint8Array.from(
    atob(value.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
}
const random = () => b64(crypto.getRandomValues(new Uint8Array(32)));
export const hash = async (value: string) =>
  b64(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(value)),
    ),
  );
const cookie = (name: string, value: string, age: number) =>
  `${name}=${value}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Lax`;
function cookies(request: Request) {
  return Object.fromEntries(
    (request.headers.get("cookie") || "")
      .split(";")
      .map((x) => x.trim().split("=")),
  );
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
function failure(status: number, message: string): never {
  throw Object.assign(new Error(message), { status });
}
function text(value: unknown, min: number, max: number, label: string) {
  if (typeof value !== "string") failure(400, `${label} is required.`);
  const clean = value.trim();
  if (
    clean.length < min ||
    clean.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean)
  )
    failure(400, `${label} must be ${min}–${max} characters.`);
  return clean;
}
function content(value: unknown) {
  const body = text(value, 10, 12000, "Content");
  if ((body.match(/https?:\/\//gi) || []).length > 5)
    failure(400, "Please limit each contribution to five links.");
  return body;
}
function identifier(value: unknown) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(value))
    failure(400, "Invalid identifier.");
  return value;
}
async function input(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    failure(415, "Use application/json.");
  if (Number(request.headers.get("content-length") || 0) > 18000)
    failure(413, "Request too large.");
  const reader = request.body?.getReader();
  if (!reader) failure(400, "Request body required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 18000) {
      await reader.cancel();
      failure(413, "Request too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) failure(400, "JSON object required.");
    return data;
  } catch {
    failure(400, "Invalid JSON.");
  }
}
function origin(env: ExchangeEnv) {
  return env.EXCHANGE_ORIGIN || "https://controllattice.com";
}
function configured(env: ExchangeEnv) {
  return !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.EXCHANGE_DB
  );
}
function csrf(request: Request, user: Member, env: ExchangeEnv) {
  if (
    request.headers.get("origin") !== origin(env) ||
    request.headers.get("x-csrf-token") !== user.csrf
  )
    failure(403, "Security check failed. Refresh the page and try again.");
}
async function member(
  request: Request,
  db: D1Database,
): Promise<Member | null> {
  const token = cookies(request)["__Host-exchange"];
  if (!token) return null;
  return db
    .prepare(
      "SELECT u.id,u.display_name,u.role,u.trusted,u.banned,u.organization,s.csrf FROM exchange_sessions s JOIN exchange_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.deleted_at IS NULL",
    )
    .bind(await hash(token), now())
    .first<Member>();
}
async function limited(
  db: D1Database,
  key: string,
  maximum: number,
  seconds: number,
) {
  const bucket = Math.floor(now() / seconds);
  const result = await db
    .prepare(
      "INSERT INTO exchange_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(`${key}:${bucket}`, (bucket + 1) * seconds)
    .first<{ count: number }>();
  if (!result || result.count > maximum)
    failure(429, "Too many requests. Please wait and try again.");
}
async function writable(
  request: Request,
  env: ExchangeEnv,
  user: Member | null,
) {
  if (!user) failure(401, "Sign in with Google first.");
  if (user.banned) failure(403, "This account cannot contribute.");
  csrf(request, user, env);
  if (env.EXCHANGE_POSTING_ENABLED !== "true")
    failure(503, "Posting is awaiting sign-in and moderation verification.");
  await limited(env.EXCHANGE_DB!, `write:${user.id}`, 12, 600);
  return user;
}
function privileged(user: Member | null) {
  if (!user || user.banned || !["admin", "moderator"].includes(user.role))
    failure(403, "Administrator or moderator access required.");
  return user;
}
function table(kind: string) {
  if (kind === "thread") return "exchange_threads";
  if (kind === "reply") return "exchange_replies";
  failure(400, "Invalid contribution type.");
}
const categories = [
  [
    "controls",
    "Controls & Automation",
    "SCADA, EPICS, commissioning and troubleshooting",
  ],
  [
    "facilities",
    "Scientific Facilities",
    "Accelerators, beamlines, fusion and research infrastructure",
  ],
  [
    "diagnostics",
    "AI & Diagnostics",
    "Observability, fault analysis and practical AI",
  ],
  ["twins", "Digital Twins", "Simulation, validation and operational modeling"],
  [
    "general",
    "General Engineering",
    "Questions, collaboration and field experience",
  ],
];
const starters = [
  [
    "detection-is-not-diagnosis",
    "controls",
    "Detection Is Not Diagnosis",
    "What evidence helps engineers distinguish symptoms from root causes in complex systems? Share a practical example, the measurements that changed your interpretation, and how you checked your conclusion. Please keep confidential facility and customer details out of the discussion.",
  ],
  [
    "useful-digital-twins",
    "twins",
    "Digital Twins That Operators Actually Use",
    "What makes a digital twin useful beyond a simulation demonstration? Which operator decisions should it support, how do you validate its predictions, and what keeps it useful when the real machine changes?",
  ],
  [
    "accelerators-and-fusion",
    "facilities",
    "Accelerator Controls and Fusion Machines",
    "Where can experience from accelerator controls and scientific facilities help emerging fusion projects? Consider commissioning, timing, machine protection, diagnostics and the handover from engineering to operations. Where do the differences matter most?",
  ],
];
// Explicit privileged seed operation, separate from schema migrations and public reads.
async function seed(db: D1Database) {
  const stmts = [
    db
      .prepare(
        "INSERT OR IGNORE INTO exchange_users (id,display_name,role,trusted,banned,organization,created_at) VALUES ('control-lattice','Control Lattice Systems','member',0,0,1,?)",
      )
      .bind(now()),
    ...categories.map((c) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO exchange_topics (id,title,description) VALUES (?,?,?)",
        )
        .bind(...c),
    ),
    ...starters.map(([id, topic, title, body]) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO exchange_threads (id,topic_id,author_id,title,body,status,pinned,locked,starter,created_at,updated_at) VALUES (?,?,'control-lattice',?,?,'published',0,0,1,?,?)",
        )
        .bind(id, topic, title, body, now(), now()),
    ),
  ];
  await db.batch(stmts);
}

export async function verifyGoogleToken(
  token: string,
  clientId: string,
  nonce: string,
  fetcher: typeof fetch = fetch,
) {
  const parts = token.split(".");
  if (parts.length !== 3) failure(401, "Invalid Google identity token.");
  let header: any, payload: any;
  try {
    header = JSON.parse(new TextDecoder().decode(unb64(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(unb64(parts[1])));
  } catch {
    failure(401, "Invalid Google identity token.");
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string")
    failure(401, "Invalid Google signing algorithm.");
  const response = await fetcher("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok)
    failure(503, "Google identity verification is temporarily unavailable.");
  const keys = (await response.json()) as {
    keys: (JsonWebKey & { kid: string })[];
  };
  const jwk = keys.keys.find((k) => k.kid === header.kid);
  if (!jwk) failure(401, "Unknown Google signing key.");
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  if (
    !(await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      unb64(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    ))
  )
    failure(401, "Invalid Google signature.");
  if (
    !["https://accounts.google.com", "accounts.google.com"].includes(
      payload.iss,
    ) ||
    payload.aud !== clientId ||
    (payload.azp && payload.azp !== clientId) ||
    typeof payload.exp !== "number" ||
    payload.exp <= now() ||
    typeof payload.iat !== "number" ||
    payload.iat > now() + 60 ||
    payload.nonce !== nonce ||
    typeof payload.sub !== "string" ||
    !payload.sub ||
    payload.email_verified !== true
  )
    failure(401, "Google identity claims failed verification.");
  return payload as { sub: string };
}
async function oauthRoute(request: Request, env: ExchangeEnv, path: string) {
  const db = env.EXCHANGE_DB!;
  const url = new URL(request.url);
  if (!configured(env))
    return json({ error: "Google sign-in has not been configured yet." }, 503);
  const redirect = origin(env) + "/api/exchange/auth/callback";
  if (path === "/auth/start") {
    if (request.method !== "GET") failure(405, "Method not allowed.");
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    await limited(
      db,
      "oauth:" +
        (await hash(
          (env.EXCHANGE_RATE_SALT || env.GOOGLE_CLIENT_SECRET!) + ip,
        )),
      20,
      600,
    );
    const state = random(),
      nonce = random(),
      verifier = random();
    await db
      .prepare(
        "INSERT INTO exchange_oauth (state_hash,nonce,verifier,expires_at) VALUES (?,?,?,?)",
      )
      .bind(await hash(state), nonce, verifier, now() + 600)
      .run();
    const target = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    target.search = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirect,
      response_type: "code",
      scope: "openid email",
      state,
      nonce,
      code_challenge: await hash(verifier),
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: target.href,
        "Set-Cookie": cookie("__Host-exchange-oauth", state, 600),
        "Cache-Control": "no-store",
      },
    });
  }
  if (path === "/auth/callback") {
    if (request.method !== "GET") failure(405, "Method not allowed.");
    const state = url.searchParams.get("state");
    if (!state || cookies(request)["__Host-exchange-oauth"] !== state)
      failure(401, "Sign-in state did not match. Please start again.");
    const tx = await db
      .prepare(
        "DELETE FROM exchange_oauth WHERE state_hash=? AND expires_at>? RETURNING nonce,verifier",
      )
      .bind(await hash(state), now())
      .first<{ nonce: string; verifier: string }>();
    if (!tx || !url.searchParams.get("code"))
      failure(401, "Sign-in expired or was cancelled.");
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        code: url.searchParams.get("code")!,
        grant_type: "authorization_code",
        redirect_uri: redirect,
        code_verifier: tx.verifier,
      }),
    });
    if (!response.ok) failure(401, "Google sign-in could not be completed.");
    const token = (await response.json()) as { id_token: string };
    const identity = await verifyGoogleToken(
      token.id_token,
      env.GOOGLE_CLIENT_ID!,
      tx.nonce,
    );
    let user = await db
      .prepare(
        "SELECT id,banned,deleted_at FROM exchange_users WHERE google_sub=?",
      )
      .bind(identity.sub)
      .first<{ id: string; banned: number; deleted_at: number | null }>();
    if (user?.banned || user?.deleted_at)
      failure(403, "This account is unavailable.");
    if (!user) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          "INSERT INTO exchange_users (id,google_sub,display_name,role,trusted,banned,organization,created_at) VALUES (?,?,'New member','member',0,0,0,?) ON CONFLICT(google_sub) DO NOTHING",
        )
        .bind(id, identity.sub, now())
        .run();
      user = await db
        .prepare(
          "SELECT id,banned,deleted_at FROM exchange_users WHERE google_sub=?",
        )
        .bind(identity.sub)
        .first();
    }
    if (!user) failure(500, "Account creation failed.");
    if (env.EXCHANGE_ADMIN_SUB && identity.sub === env.EXCHANGE_ADMIN_SUB)
      await db
        .prepare(
          "UPDATE exchange_users SET role='admin' WHERE id=? AND google_sub=? AND banned=0 AND deleted_at IS NULL",
        )
        .bind(user.id, identity.sub)
        .run();
    const session = random();
    await db
      .prepare(
        "INSERT INTO exchange_sessions (token_hash,user_id,csrf,expires_at) VALUES (?,?,?,?)",
      )
      .bind(await hash(session), user.id, random(), now() + 604800)
      .run();
    const headers = new Headers({
      Location: origin(env) + "/discussions?welcome=1",
      "Cache-Control": "no-store",
    });
    headers.append("Set-Cookie", cookie("__Host-exchange", session, 604800));
    headers.append("Set-Cookie", cookie("__Host-exchange-oauth", "", 0));
    return new Response(null, { status: 302, headers });
  }
  failure(404, "Route not found.");
}

export async function deliverModerationNotifications(env: ExchangeEnv) {
  const db = env.EXCHANGE_DB;
  if (!db || !env.RESEND_API_KEY || !env.EXCHANGE_EMAIL_FROM || !env.EXCHANGE_MODERATION_EMAIL) return;
  const queued = await db.prepare("SELECT id,target_type,target_id FROM exchange_moderation_log WHERE action='notification_pending' ORDER BY created_at LIMIT 5").all<{id:string;target_type:string;target_id:string}>();
  for (const item of queued.results) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json", "Idempotency-Key": item.id },
        body: JSON.stringify({ from: env.EXCHANGE_EMAIL_FROM, to: [env.EXCHANGE_MODERATION_EMAIL], subject: "Engineering Exchange: new member contribution awaiting approval", text: "A new member has submitted a " + item.target_type + ". It remains private until you approve it. Review the moderation queue: " + env.EXCHANGE_ORIGIN + "/discussions/admin\nContribution: " + item.target_id }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Email delivery failed");
      await db.prepare("UPDATE exchange_moderation_log SET action='notification_sent' WHERE id=? AND action='notification_pending'").bind(item.id).run();
    } catch { console.error("Moderation email remains queued for retry"); }
  }
}
function notification(db: D1Database, kind: string, id: string) {
  return db.prepare("INSERT INTO exchange_moderation_log (id,moderator_id,target_type,target_id,action,reason,created_at) VALUES (?,NULL,?,?,'notification_pending','New member approval requested',?)").bind("notification-" + id, kind, id, now());
}

export async function exchange(
  request: Request,
  env: ExchangeEnv,
): Promise<Response> {
  try {
    return await route(request, env);
  } catch (error) {
    const e = error as Error & { status?: number };
    if (!e.status) console.error("Exchange operation failed", e.name);
    return json(
      {
        error: e.status
          ? e.message
          : "The community service is temporarily unavailable.",
      },
      e.status || 503,
    );
  }
}
async function route(request: Request, env: ExchangeEnv): Promise<Response> {
  const path = new URL(request.url).pathname.replace(/^\/api\/exchange/, "");
  const url = new URL(request.url);
  const db = env.EXCHANGE_DB;
  if (!db) failure(503, "The community database is not connected yet.");
  if (path === "/setup" && request.method === "POST") {
    if (
      !env.EXCHANGE_SETUP_TOKEN ||
      request.headers.get("authorization") !==
        "Bearer " + env.EXCHANGE_SETUP_TOKEN
    )
      failure(403, "Setup authorization required.");
    await seed(db);
    return json({ ok: true });
  }
  if (path.startsWith("/auth/")) return oauthRoute(request, env, path);
  const user = await member(request, db);
  if (path === "/session" && request.method === "GET")
    return json({
      user: user
        ? {
            id: user.id,
            display_name: user.display_name,
            role: user.role,
            banned: !!user.banned,
            trusted: !!user.trusted,
            csrf: user.csrf,
          }
        : null,
      signInAvailable: configured(env),
      postingEnabled: env.EXCHANGE_POSTING_ENABLED === "true",
    });
  if (path === "/logout" && request.method === "POST") {
    if (!user) failure(401, "Not signed in.");
    csrf(request, user, env);
    await db
      .prepare("DELETE FROM exchange_sessions WHERE token_hash=?")
      .bind(await hash(cookies(request)["__Host-exchange"]))
      .run();
    const response = json({ ok: true });
    response.headers.set("Set-Cookie", cookie("__Host-exchange", "", 0));
    return response;
  }
  if (path === "/topics" && request.method === "GET")
    return json({
      topics: (
        await db
          .prepare(
            "SELECT id,title,description FROM exchange_topics ORDER BY id",
          )
          .all()
      ).results,
    });
  if (path === "/threads" && request.method === "GET") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
    const category = (url.searchParams.get("category") || "").slice(0, 80);
    const offset = Math.min(
      10000,
      Math.floor(Math.max(0, Number(url.searchParams.get("offset")) || 0)),
    );
    const rows = await db
      .prepare(
        "SELECT t.*,u.display_name,u.organization,(SELECT COUNT(*) FROM exchange_replies r WHERE r.thread_id=t.id AND r.status='published') AS reply_count,(SELECT COUNT(*) FROM exchange_reactions r WHERE r.thread_id=t.id) AS reactions FROM exchange_threads t JOIN exchange_users u ON u.id=t.author_id WHERE t.status='published' AND (?='' OR t.topic_id=?) AND (?='' OR instr(lower(t.title||' '||t.body),lower(?))>0) ORDER BY t.pinned DESC,t.created_at DESC LIMIT 21 OFFSET ?",
      )
      .bind(category, category, q, q, offset)
      .all();
    return json({
      threads: rows.results.slice(0, 20),
      hasMore: rows.results.length > 20,
    });
  }
  const detail = path.match(/^\/threads\/([a-zA-Z0-9_-]+)$/);
  if (detail && request.method === "GET") {
    const thread = await db
      .prepare(
        "SELECT t.*,u.display_name,u.organization,(SELECT COUNT(*) FROM exchange_reactions x WHERE x.thread_id=t.id) AS reactions FROM exchange_threads t JOIN exchange_users u ON u.id=t.author_id WHERE t.id=? AND (t.status='published' OR t.author_id=? OR ? IN ('admin','moderator'))",
      )
      .bind(detail[1], user?.id || "", user?.role || "")
      .first();
    if (!thread) failure(404, "Discussion not found.");
    const replies = await db
      .prepare(
        "SELECT r.*,u.display_name,u.organization FROM exchange_replies r JOIN exchange_users u ON u.id=r.author_id WHERE r.thread_id=? AND (r.status='published' OR r.author_id=? OR ? IN ('admin','moderator')) ORDER BY r.created_at LIMIT 500",
      )
      .bind(detail[1], user?.id || "", user?.role || "")
      .all();
    const liked = user
      ? !!(await db
          .prepare(
            "SELECT user_id FROM exchange_reactions WHERE thread_id=? AND user_id=?",
          )
          .bind(detail[1], user.id)
          .first())
      : false;
    return json({ thread, replies: replies.results, liked });
  }
  if (path === "/profile" && request.method === "PATCH") {
    if (!user || user.banned) failure(401, "Sign in first.");
    csrf(request, user, env);
    await limited(db, `profile:${user.id}`, 10, 600);
    const data = await input(request);
    const name = text(data.display_name, 2, 60, "Public display name");
    if (/control\s*lattice|administrator|moderator/i.test(name))
      failure(400, "Please choose a personal display name.");
    await db
      .prepare(
        "UPDATE exchange_users SET display_name=? WHERE id=? AND organization=0",
      )
      .bind(name, user.id)
      .run();
    return json({ ok: true });
  }
  if (path === "/mine" && request.method === "GET") {
    if (!user) failure(401, "Sign in first.");
    return json({
      threads: (
        await db
          .prepare(
            "SELECT id,title,status,created_at FROM exchange_threads WHERE author_id=? ORDER BY created_at DESC LIMIT 100",
          )
          .bind(user.id)
          .all()
      ).results,
      replies: (
        await db
          .prepare(
            "SELECT id,thread_id,body,status,created_at FROM exchange_replies WHERE author_id=? ORDER BY created_at DESC LIMIT 100",
          )
          .bind(user.id)
          .all()
      ).results,
    });
  }
  if (path === "/account/export" && request.method === "GET") {
    if (!user) failure(401, "Sign in first.");
    return json({
      profile: { display_name: user.display_name },
      threads: (
        await db
          .prepare(
            "SELECT id,title,body,status,created_at FROM exchange_threads WHERE author_id=?",
          )
          .bind(user.id)
          .all()
      ).results,
      replies: (
        await db
          .prepare(
            "SELECT id,thread_id,parent_id,body,status,created_at FROM exchange_replies WHERE author_id=?",
          )
          .bind(user.id)
          .all()
      ).results,
    });
  }
  if (path === "/account" && request.method === "DELETE") {
    if (!user) failure(401, "Sign in first.");
    csrf(request, user, env);
    const data = await input(request);
    if (data.confirm !== "DELETE") failure(400, "Confirm account deletion.");
    await db.batch([
      db
        .prepare(
          "UPDATE exchange_threads SET title='Deleted contribution',body='[deleted]',status='hidden',updated_at=? WHERE author_id=?",
        )
        .bind(now(), user.id),
      db
        .prepare(
          "UPDATE exchange_replies SET body='[deleted]',status='hidden',updated_at=? WHERE author_id=?",
        )
        .bind(now(), user.id),
      db
        .prepare("DELETE FROM exchange_reactions WHERE user_id=?")
        .bind(user.id),
      db.prepare("DELETE FROM exchange_reports WHERE user_id=?").bind(user.id),
      db.prepare("DELETE FROM exchange_sessions WHERE user_id=?").bind(user.id),
      db
        .prepare(
          "UPDATE exchange_users SET google_sub=NULL,display_name='Deleted member',role='member',trusted=0,deleted_at=? WHERE id=?",
        )
        .bind(now(), user.id),
    ]);
    const response = json({ ok: true });
    response.headers.set("Set-Cookie", cookie("__Host-exchange", "", 0));
    return response;
  }
  if (path === "/account/identity" && request.method === "GET") {
    if (!user || user.banned) failure(401, "Sign in first.");
    const identity = await db.prepare("SELECT google_sub FROM exchange_users WHERE id=?").bind(user.id).first();
    return json(identity);
  }
  if (path === "/admin/backup" && request.method === "GET") {
    const actor = privileged(user);
    if (actor.role !== "admin") failure(403, "Administrator required.");
    const tables = ["exchange_users", "exchange_topics", "exchange_threads", "exchange_replies", "exchange_reactions", "exchange_reports", "exchange_moderation_log"];
    const results = await db.batch(tables.map(name => db.prepare(`SELECT * FROM ${name}`)));
    const backup = json({ exported_at: now(), tables: Object.fromEntries(tables.map((name, i) => [name, results[i].results])) });
    backup.headers.set("Content-Disposition", 'attachment; filename="engineering-exchange-backup.json"');
    return backup;
  }
  if (path === "/admin" && request.method === "GET") {
    privileged(user);
    return json({
      notifications: {
        configured: !!(env.RESEND_API_KEY && env.EXCHANGE_EMAIL_FROM && env.EXCHANGE_MODERATION_EMAIL),
        pending: (await db.prepare("SELECT COUNT(*) AS n FROM exchange_moderation_log WHERE action='notification_pending'").first<{n:number}>())?.n || 0,
      },
      threads: (
        await db
          .prepare(
            "SELECT t.*,u.display_name FROM exchange_threads t JOIN exchange_users u ON u.id=t.author_id WHERE t.status='pending' ORDER BY t.created_at LIMIT 100",
          )
          .all()
      ).results,
      replies: (
        await db
          .prepare(
            "SELECT r.*,u.display_name FROM exchange_replies r JOIN exchange_users u ON u.id=r.author_id WHERE r.status='pending' ORDER BY r.created_at LIMIT 100",
          )
          .all()
      ).results,
      reports: (
        await db
          .prepare(
            "SELECT * FROM exchange_reports WHERE status='open' ORDER BY created_at LIMIT 100",
          )
          .all()
      ).results,
      users: (
        await db
          .prepare(
            "SELECT id,display_name,role,trusted,banned FROM exchange_users WHERE organization=0 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 100",
          )
          .all()
      ).results,
      stats: await db
        .prepare(
          "SELECT (SELECT COUNT(*) FROM exchange_users WHERE organization=0 AND deleted_at IS NULL) AS members,(SELECT COUNT(*) FROM exchange_threads WHERE status='published') AS threads,(SELECT COUNT(*) FROM exchange_replies WHERE status='published') AS replies,(SELECT COUNT(*) FROM exchange_threads WHERE status='pending')+(SELECT COUNT(*) FROM exchange_replies WHERE status='pending') AS pending",
        )
        .first(),
    });
  }
  if (path === "/admin" && request.method === "POST") {
    const actor = privileged(user);
    csrf(request, actor, env);
    await limited(db, `admin:${actor.id}`, 60, 600);
    const data = await input(request);
    if (data.action === "retry-notifications") {
      await deliverModerationNotifications(env);
      return json({ ok: true });
    }
    if (data.action === "seed") {
      if (actor.role !== "admin") failure(403, "Administrator required.");
      await seed(db);
      return json({ ok: true });
    }
    if (data.action === "cleanup") {
      if (actor.role !== "admin") failure(403, "Administrator required.");
      await db.batch([
        db
          .prepare("DELETE FROM exchange_sessions WHERE expires_at<?")
          .bind(now()),
        db.prepare("DELETE FROM exchange_oauth WHERE expires_at<?").bind(now()),
        db
          .prepare("DELETE FROM exchange_limits WHERE expires_at<?")
          .bind(now()),
      ]);
      return json({ ok: true });
    }
    const id = identifier(data.id);
    const kind = data.kind;
    const action = data.action;
    const reason =
      typeof data.reason === "string"
        ? text(data.reason, 1, 1000, "Reason")
        : "Community moderation";
    let stmt: D1PreparedStatement;
    if (["publish", "reject", "hide"].includes(action)) {
      const name = table(kind);
      if (
        !(await db
          .prepare(`SELECT id FROM ${name} WHERE id=?`)
          .bind(id)
          .first())
      )
        failure(404, "Contribution not found.");
      if (
        kind === "reply" &&
        action === "publish" &&
        !(await db
          .prepare(
            "SELECT r.id FROM exchange_replies r JOIN exchange_threads t ON t.id=r.thread_id WHERE r.id=? AND t.status='published' AND (r.parent_id IS NULL OR EXISTS (SELECT 1 FROM exchange_replies p WHERE p.id=r.parent_id AND p.thread_id=r.thread_id AND p.status='published'))",
          )
          .bind(id)
          .first())
      )
        failure(409, "Publish the thread and parent reply first.");
      stmt = db
        .prepare(`UPDATE ${name} SET status=?,updated_at=? WHERE id=?`)
        .bind(
          { publish: "published", reject: "rejected", hide: "hidden" }[
            action as "publish"
          ],
          now(),
          id,
        );
    } else if (
      ["pin", "unpin", "lock", "unlock"].includes(action) &&
      kind === "thread"
    ) {
      stmt = db
        .prepare(
          `UPDATE exchange_threads SET ${action.includes("pin") ? "pinned" : "locked"}=?,updated_at=? WHERE id=?`,
        )
        .bind(["pin", "lock"].includes(action) ? 1 : 0, now(), id);
    } else if (
      ["ban", "unban", "trust", "untrust"].includes(action) &&
      kind === "user"
    ) {
      if (actor.role !== "admin") failure(403, "Administrator required.");
      if (id === actor.id)
        failure(400, "Cannot change your own trust or ban status.");
      const target = await db
        .prepare(
          "SELECT role,organization FROM exchange_users WHERE id=? AND deleted_at IS NULL",
        )
        .bind(id)
        .first<{ role: string; organization: number }>();
      if (!target || target.organization || target.role === "admin")
        failure(403, "This account cannot be changed here.");
      stmt = db
        .prepare(
          `UPDATE exchange_users SET ${action.includes("ban") ? "banned" : "trusted"}=? WHERE id=?`,
        )
        .bind(["ban", "trust"].includes(action) ? 1 : 0, id);
    } else if (action === "resolve" && kind === "report")
      stmt = db
        .prepare("UPDATE exchange_reports SET status='resolved' WHERE id=?")
        .bind(id);
    else failure(400, "Unsupported moderation action.");
    await db.batch([
      stmt,
      ...(action === "publish" ? [db.prepare(`UPDATE exchange_users SET trusted=1 WHERE id=(SELECT author_id FROM ${table(kind)} WHERE id=?) AND banned=0 AND deleted_at IS NULL`).bind(id)] : []),
      db
        .prepare(
          "INSERT INTO exchange_moderation_log (id,moderator_id,target_type,target_id,action,reason,created_at) VALUES (?,?,?,?,?,?,?)",
        )
        .bind(crypto.randomUUID(), actor.id, kind, id, action, reason, now()),
    ]);
    return json({ ok: true });
  }
  const actor = await writable(request, env, user);
  if (actor.display_name === "New member")
    failure(400, "Choose your public display name first.");
  if (path === "/threads" && request.method === "POST") {
    const data = await input(request);
    if (data.website) failure(400, "Submission rejected.");
    const topic = identifier(data.topic_id);
    if (
      !(await db
        .prepare("SELECT id FROM exchange_topics WHERE id=?")
        .bind(topic)
        .first())
    )
      failure(400, "Choose a valid topic.");
    const id = crypto.randomUUID();
    const title = text(data.title, 8, 180, "Title");
    const body = content(data.body);
    const status =
      actor.trusted || ["admin", "moderator"].includes(actor.role)
        ? "published"
        : "pending";
    await limited(db, `thread:${actor.id}`, 3, 3600);
    const insertion = db
      .prepare(
        "INSERT INTO exchange_threads (id,topic_id,author_id,title,body,status,pinned,locked,starter,created_at,updated_at) VALUES (?,?,?,?,?,?,0,0,0,?,?)",
      )
      .bind(id, topic, actor.id, title, body, status, now(), now());
    await db.batch([insertion, ...(status === "pending" ? [notification(db, "thread", id)] : [])]);
    return json({ id, status }, 201);
  }
  const reply = path.match(/^\/threads\/([a-zA-Z0-9_-]+)\/replies$/);
  if (reply && request.method === "POST") {
    const data = await input(request);
    if (data.website) failure(400, "Submission rejected.");
    const thread = await db
      .prepare(
        "SELECT id,locked FROM exchange_threads WHERE id=? AND status='published'",
      )
      .bind(reply[1])
      .first<{ id: string; locked: number }>();
    if (!thread) failure(404, "Discussion not found.");
    if (thread.locked) failure(403, "This discussion is locked.");
    const parent = data.parent_id ? identifier(data.parent_id) : null;
    if (
      parent &&
      !(await db
        .prepare(
          "SELECT id FROM exchange_replies WHERE id=? AND thread_id=? AND status='published'",
        )
        .bind(parent, thread.id)
        .first())
    )
      failure(400, "Invalid parent reply.");
    if (parent) {
      const ancestry = await db.prepare("WITH RECURSIVE ancestors(id,parent_id,depth) AS (SELECT id,parent_id,1 FROM exchange_replies WHERE id=? UNION ALL SELECT r.id,r.parent_id,a.depth+1 FROM exchange_replies r JOIN ancestors a ON r.id=a.parent_id WHERE a.depth<6) SELECT MAX(depth) AS depth FROM ancestors").bind(parent).first<{depth:number}>();
      if (ancestry && ancestry.depth >= 5) failure(400, "Please reply to the discussion rather than nesting more than five levels.");
    }

    if (
      (await db
        .prepare("SELECT COUNT(*) AS n FROM exchange_replies WHERE thread_id=?")
        .bind(thread.id)
        .first<{ n: number }>())!.n >= 500
    )
      failure(
        409,
        "This discussion has reached its reply limit. Start a follow-up thread.",
      );
    const id = crypto.randomUUID(),
      status =
        actor.trusted || ["admin", "moderator"].includes(actor.role)
          ? "published"
          : "pending";
    const insertion = db
      .prepare(
        "INSERT INTO exchange_replies (id,thread_id,parent_id,author_id,body,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
      )
      .bind(
        id,
        thread.id,
        parent,
        actor.id,
        content(data.body),
        status,
        now(),
        now(),
      );
    await db.batch([insertion, ...(status === "pending" ? [notification(db, "reply", id)] : [])]);
    return json({ id, status }, 201);
  }
  const react = path.match(/^\/threads\/([a-zA-Z0-9_-]+)\/reaction$/);
  if (react && request.method === "POST") {
    if (
      !(await db
        .prepare(
          "SELECT id FROM exchange_threads WHERE id=? AND status='published'",
        )
        .bind(react[1])
        .first())
    )
      failure(404, "Discussion not found.");
    const data = await input(request);
    if (typeof data.liked !== "boolean")
      failure(400, "Reaction must be true or false.");
    await db
      .prepare(
        data.liked
          ? "INSERT OR IGNORE INTO exchange_reactions (user_id,thread_id) VALUES (?,?)"
          : "DELETE FROM exchange_reactions WHERE user_id=? AND thread_id=?",
      )
      .bind(actor.id, react[1])
      .run();
    return json({ ok: true });
  }
  const edit = path.match(/^\/(threads|replies)\/([a-zA-Z0-9_-]+)$/);
  if (edit && ["PATCH", "DELETE"].includes(request.method)) {
    const name =
      edit[1] === "threads" ? "exchange_threads" : "exchange_replies";
    const item = await db
      .prepare(`SELECT author_id,status FROM ${name} WHERE id=?`)
      .bind(edit[2])
      .first<{ author_id: string; status: string }>();
    if (!item) failure(404, "Contribution not found.");
    if (item.author_id !== actor.id)
      failure(403, "You can edit only your own contributions.");
    if (
      name === "exchange_replies" &&
      (await db
        .prepare(
          "SELECT t.id FROM exchange_threads t JOIN exchange_replies r ON r.thread_id=t.id WHERE r.id=? AND t.locked=1",
        )
        .bind(edit[2])
        .first())
    )
      failure(403, "Discussion locked; contact a moderator for changes.");
    if (
      name === "exchange_threads" &&
      (await db
        .prepare("SELECT id FROM exchange_threads WHERE id=? AND locked=1")
        .bind(edit[2])
        .first())
    )
      failure(403, "Discussion locked; contact a moderator for changes.");
    if (request.method === "DELETE") {
      await db
        .prepare(
          `UPDATE ${name} SET body='[deleted]',status='hidden',updated_at=? ${name === "exchange_threads" ? ",title='Deleted contribution'" : ""} WHERE id=? AND author_id=?`,
        )
        .bind(now(), edit[2], actor.id)
        .run();
      return json({ ok: true });
    }
    const data = await input(request);
    if (["rejected", "hidden"].includes(item.status))
      failure(403, "Removed content cannot be republished.");
    const body = content(data.body);
    if (name === "exchange_threads")
      await db
        .prepare(
          "UPDATE exchange_threads SET title=?,body=?,status='pending',updated_at=? WHERE id=? AND author_id=?",
        )
        .bind(text(data.title, 8, 180, "Title"), body, now(), edit[2], actor.id)
        .run();
    else
      await db
        .prepare(
          "UPDATE exchange_replies SET body=?,status='pending',updated_at=? WHERE id=? AND author_id=?",
        )
        .bind(body, now(), edit[2], actor.id)
        .run();
    return json({ ok: true, status: "pending" });
  }
  if (path === "/reports" && request.method === "POST") {
    const data = await input(request);
    const name = table(data.kind);
    const id = identifier(data.id);
    if (
      !(await db
        .prepare(`SELECT id FROM ${name} WHERE id=? AND status='published'`)
        .bind(id)
        .first())
    )
      failure(404, "Contribution not found.");
    await limited(db, `report:${actor.id}`, 5, 3600);
    await db
      .prepare(
        "INSERT OR IGNORE INTO exchange_reports (id,user_id,target_type,target_id,reason,status,created_at) VALUES (?,?,?,?,?,'open',?)",
      )
      .bind(
        crypto.randomUUID(),
        actor.id,
        data.kind,
        id,
        text(data.reason, 10, 1000, "Report reason"),
        now(),
      )
      .run();
    return json({ ok: true });
  }
  failure(404, "Route not found.");
}
