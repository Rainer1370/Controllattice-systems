"use client";
import { useEffect, useState, type FormEvent } from "react";
type Item = {
  id: string;
  topic_id: string;
  thread_id?: string;
  parent_id?: string | null;
  title?: string;
  body: string;
  status: string;
  author_id: string;
  display_name: string;
  organization: number;
  starter: number;
  pinned: number;
  locked: number;
  created_at: number;
  reactions: number;
  reply_count: number;
};
type User = {
  id: string;
  display_name: string;
  role: string;
  csrf: string;
  banned: boolean;
};
const labels: Record<string, string> = {
  controls: "Controls & Automation",
  facilities: "Scientific Facilities",
  diagnostics: "AI & Diagnostics",
  twins: "Digital Twins",
  general: "General Engineering",
};
const date = (seconds: number) => new Date(seconds * 1000).toLocaleDateString();
export default function ExchangeClient({ admin = false }: { admin?: boolean }) {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [signIn, setSignIn] = useState(false),
    [enabled, setEnabled] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [threads, setThreads] = useState<Item[]>([]),
    [category, setCategory] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Item | null>(null),
    [replies, setReplies] = useState<Item[]>([]),
    [liked, setLiked] = useState(false),
    [name, setName] = useState(""),
    [parent, setParent] = useState<string | null>(null),
    [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [replyBody, setReplyBody] = useState(""),
    [edit, setEdit] = useState<Item | null>(null),
    [editTitle, setEditTitle] = useState(""),
    [editBody, setEditBody] = useState(""),
    [report, setReport] = useState<{ kind: string; id: string } | null>(null),
    [reason, setReason] = useState(""),
    [queue, setQueue] = useState<any>(null),
    [mine, setMine] = useState<any>(null),
    [offset, setOffset] = useState(0),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false);
  async function api(
    path: string,
    method = "GET",
    data?: unknown,
  ): Promise<any> {
    const r = await fetch("/api/exchange" + path, {
      method,
      headers: {
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(method !== "GET" ? { "X-CSRF-Token": user?.csrf || "" } : {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    const result = (await r.json()) as any;
    if (!r.ok) throw new Error(result.error || "Request failed.");
    return result;
  }
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function session() {
    const data = await api("/session");
    setUser(data.user);
    setName(data.user?.display_name || "");
    setSignIn(data.signInAvailable);
    setEnabled(data.postingEnabled);
    setReady(true);
  }
  async function loadFeed(at = offset) {
    const data = await api(
      "/threads?" +
        new URLSearchParams({ category, q: query, offset: String(at) }),
    );
    setThreads(data.threads);
    setMore(data.hasMore);
  }
  async function open(id: string) {
    const data = await api("/threads/" + id);
    setSelected(data.thread);
    setReplies(data.replies);
    setLiked(data.liked);
    setParent(null);
    try {
      const draft = JSON.parse(sessionStorage.getItem("exchange-reply-draft") || "null");
      setReplyBody(draft?.thread === id ? draft.body : "");
      if (draft?.thread === id) setParent(draft.parent || null);
    } catch { setReplyBody(""); }
    window.history.replaceState(
      null,
      "",
      "/discussions?thread=" + encodeURIComponent(id),
    );
  }
  useEffect(() => {
    if (selected) document.getElementById("selected-discussion")?.scrollIntoView({ block: "start" });
  }, [selected]);
  async function moderation() {
    setQueue(await api("/admin"));
  }
  useEffect(() => {
    (async () => {
      try {
        await session();
        if (!admin) {
          let draftThread: string | null = null;
          try { draftThread = JSON.parse(sessionStorage.getItem("exchange-reply-draft") || "null")?.thread || null; } catch {}
          const id = new URLSearchParams(window.location.search).get("thread") || draftThread;
          if (id) await open(id);
          await loadFeed(0);
        }
      } catch (e) {
        setError((e as Error).message);
        setReady(true);
      }
    })();
  }, []);
  useEffect(() => {
    if (admin && user && ["admin", "moderator"].includes(user.role))
      action(moderation);
  }, [user?.role]);
  async function submitThread(event: FormEvent) {
    event.preventDefault();
    await action(async () => {
      const data = await api("/threads", "POST", {
        topic_id: category || "general",
        title,
        body,
        website: "",
      });
      setTitle("");
      setBody("");
      setNotice(
        data.status === "pending"
          ? "Submitted for moderation. It will appear publicly after approval."
          : "Your discussion is published.",
      );
      await loadFeed(0);
    });
  }
  async function submitReply(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      sessionStorage.setItem("exchange-reply-draft", JSON.stringify({ thread: selected!.id, parent, body: replyBody }));
      window.location.assign("/api/exchange/auth/start");
      return;
    }
    if (user.display_name === "New member") {
      setError("Choose a public display name in My public profile and data above, then submit your reply.");
      return;
    }
    await action(async () => {
      const data = await api("/threads/" + selected!.id + "/replies", "POST", {
        body: replyBody,
        parent_id: parent,
        website: "",
      });
      sessionStorage.removeItem("exchange-reply-draft");
      setNotice(
        data.status === "pending"
          ? "Your reply is saved and visible to you. It will become public after approval."
          : "Reply published.",
      );
      await open(selected!.id);
    });
  }
  async function mod(kind: string, id: string, operation: string) {
    await action(async () => {
      await api("/admin", "POST", { kind, id, action: operation });
      await moderation();
      setNotice("Moderation action saved.");
    });
  }
  const canPost =
    enabled && !!user && !user.banned && user.display_name !== "New member";
  function ownerControls(item: Item, kind: string) {
    return (
      <div className="exchange-inline">
        {canPost && item.status === "published" && (
          <button
            type="button"
            onClick={() => {
              setReport({ kind, id: item.id });
              setReason("");
            }}
          >
            Report
          </button>
        )}
        {canPost && user?.id === item.author_id && (
          <>
            <button
              type="button"
              onClick={() => {
                setEdit(item);
                setEditBody(item.body);
                setEditTitle(item.title || "");
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() =>
                action(async () => {
                  await api(
                    "/" +
                      (kind === "thread" ? "threads" : "replies") +
                      "/" +
                      item.id,
                    "DELETE",
                  );
                  setNotice("Contribution removed.");
                  if (selected) {
                    await open(selected.id);
                    await loadFeed();
                  }
                })
              }
            >
              Remove my contribution
            </button>
          </>
        )}
        {user && ["admin", "moderator"].includes(user.role) && (
          <button type="button" onClick={() => mod(kind, item.id, "hide")}>
            Hide as moderator
          </button>
        )}
      </div>
    );
  }
  function replyList(parentId: string | null, depth = 0): React.ReactNode {
    if (depth > 20) return null;
    return replies
      .filter((r) => (r.parent_id || null) === parentId)
      .map((r) => (
        <article
          className="exchange-reply"
          key={r.id}
          style={{ marginLeft: depth ? 12 : 0 }}
        >
          <div className="exchange-meta">
            <strong>{r.display_name}</strong>
            <span>
              {date(r.created_at)} ·{" "}
              {r.status === "pending" ? "Awaiting approval · visible to you and moderators" : r.status === "published" ? "Reply" : r.status}
            </span>
          </div>
          <p className="exchange-body">{r.body}</p>
          <div className="exchange-inline">
            {canPost && !selected?.locked && r.status === "published" && (
              <button
                onClick={() => {
                  setParent(r.id);
                  document.getElementById("reply-content")?.focus();
                }}
              >
                Reply to {r.display_name}
              </button>
            )}
            {ownerControls(r, "reply")}
          </div>
          {replyList(r.id, depth + 1)}
        </article>
      ));
  }
  return (
    <div className="exchange-app" aria-busy={busy}>
      <div className="exchange-account">
        <div>
          <strong>
            {user
              ? `Welcome, ${user.display_name}`
              : "Read freely. Sign in to contribute."}
          </strong>
          <p>
            {enabled
              ? "Your first contribution is reviewed before publication; you can see it while it is pending."
              : "Read discussions or write a reply below. Submissions open after administrator setup is verified."}
          </p>
        </div>
        <div className="exchange-inline">
          {!user ? (
            <a
              className={"button " + (!signIn ? "exchange-disabled" : "")}
              aria-disabled={!signIn}
              href={signIn ? "/api/exchange/auth/start" : undefined}
            >
              {signIn ? "Sign in with Google" : "Google sign-in coming soon"}
            </a>
          ) : (
            <>
              <button
                className="button ghost"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    await api("/logout", "POST", {});
                    setUser(null);
                    setQueue(null);
                    setMine(null);
                    setNotice("Signed out.");
                  })
                }
              >
                Sign out
              </button>
              {["admin", "moderator"].includes(user.role) && (
                <a href="/discussions/admin">Moderation →</a>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="exchange-message error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="exchange-message" role="status">
          {notice}
        </p>
      )}
      {!ready && <p role="status">Loading community…</p>}
      {user && (
        <details className="exchange-panel">
          <summary>My public profile and data</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action(async () => {
                await api("/profile", "PATCH", { display_name: name });
                await session();
                setNotice("Public display name saved.");
              });
            }}
          >
            <label>
              Public display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={60}
                required
              />
            </label>
            <p>
              Your Google email is never shown or stored in the community
              database.
            </p>
            <button className="button" disabled={busy || user.banned}>
              Save name
            </button>
          </form>
          <div className="exchange-inline">
            <button
              onClick={() => action(async () => setMine(await api("/mine")))}
            >
              My contributions
            </button>
            <a
              href="/api/exchange/account/export"
              download="engineering-exchange-data.json"
            >
              Export my data
            </a>
            <button onClick={() => setConfirmDelete(true)}>
              Delete my account and contributions
            </button>
          </div>
          {mine && (
            <div>
              <h3>My contributions</h3>
              {[...mine.threads, ...mine.replies].map((x: any) => (
                <p key={x.id}>
                  <button
                    onClick={() => action(() => open(x.thread_id || x.id))}
                  >
                    {x.title || x.body.slice(0, 100)}
                  </button>{" "}
                  · {x.status}
                </p>
              ))}
            </div>
          )}
        </details>
      )}
      {confirmDelete && (
        <form
          className="exchange-panel"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              await api("/account", "DELETE", { confirm: "DELETE" });
              setUser(null);
              setMine(null);
              setConfirmDelete(false);
              setNotice("Account and contributions removed.");
              await loadFeed(0);
            });
          }}
        >
          <h3>Delete your account?</h3>
          <p>
            This permanently removes your Google association, public profile,
            sessions and contribution text. Moderation records and backup
            retention are explained in our privacy notice.
          </p>
          <button className="button" disabled={busy}>
            Confirm account deletion
          </button>
          <button type="button" onClick={() => setConfirmDelete(false)}>
            Cancel
          </button>
        </form>
      )}
      {admin ? (
        <>
          {!user || !["admin", "moderator"].includes(user.role) ? (
            <p className="exchange-panel">
              Sign in with an authorized administrator or moderator account to
              view the queue.
            </p>
          ) : (
            queue && (
              <>
                <div className="exchange-stats">
                  {Object.entries(queue.stats).map(([k, v]) => (
                    <div key={k}>
                      <strong>{String(v)}</strong>
                      <span>{k}</span>
                    </div>
                  ))}
                </div>
                <p>{queue.notifications?.configured ? "Moderation email alerts are configured." : "Moderation email alerts need a sender and API key."} {queue.notifications?.pending || 0} alerts awaiting delivery.</p>
                <button onClick={() => action(async () => { await api("/admin", "POST", { action: "retry-notifications" }); await moderation(); })}>Retry queued email alerts</button>
                <h2>Pending contributions</h2>
                {queue.threads.length + queue.replies.length === 0 && (
                  <p>No contributions are awaiting approval.</p>
                )}
                {[
                  ["thread", queue.threads],
                  ["reply", queue.replies],
                ].map(([kind, items]: any) => (
                  <div key={kind}>
                    {items.map((item: Item) => (
                      <article className="exchange-panel" key={item.id}>
                        <small>
                          {kind} · {item.display_name}
                        </small>
                        <h3>{item.title}</h3>
                        <p className="exchange-body">{item.body}</p>
                        <div className="exchange-inline">
                          <button onClick={() => mod(kind, item.id, "publish")}>
                            Approve
                          </button>
                          <button onClick={() => mod(kind, item.id, "reject")}>
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              action(() => open(item.thread_id || item.id))
                            }
                          >
                            View context
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
                <h2>Reported content</h2>
                {queue.reports.length === 0 && <p>No open reports.</p>}
                {queue.reports.map((r: any) => (
                  <article className="exchange-panel" key={r.id}>
                    <p>
                      {r.target_type} · {r.target_id}
                    </p>
                    <p>{r.reason}</p>
                    <button
                      onClick={() => mod(r.target_type, r.target_id, "hide")}
                    >
                      Hide contribution
                    </button>
                    <button onClick={() => mod("report", r.id, "resolve")}>
                      Resolve report
                    </button>
                  </article>
                ))}
                {user.role === "admin" && (
                  <>
                    <h2>Members</h2>
                    {queue.users.map((u: any) => (
                      <article className="exchange-panel" key={u.id}>
                        <strong>{u.display_name}</strong>
                        <p>
                          {u.role} · {u.trusted ? "Trusted" : "Review required"}{" "}
                          · {u.banned ? "Banned" : "Active"}
                        </p>
                        {u.id !== user.id && u.role !== "admin" && (
                          <div className="exchange-inline">
                            <button
                              onClick={() =>
                                mod(
                                  "user",
                                  u.id,
                                  u.trusted ? "untrust" : "trust",
                                )
                              }
                            >
                              {u.trusted
                                ? "Require review"
                                : "Allow direct posting"}
                            </button>
                            <button
                              onClick={() =>
                                mod("user", u.id, u.banned ? "unban" : "ban")
                              }
                            >
                              {u.banned ? "Unban" : "Ban"}
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                    <button
                      onClick={() =>
                        action(async () => {
                          await api("/admin", "POST", { action: "cleanup" });
                          setNotice(
                            "Expired sessions and rate-limit records cleaned.",
                          );
                        })
                      }
                    >
                      Clean expired records
                    </button>
                  </>
                )}
              </>
            )
          )}
        </>
      ) : (
        <>
          <form
            className="exchange-filter"
            onSubmit={(e) => {
              e.preventDefault();
              setOffset(0);
              action(() => loadFeed(0));
            }}
          >
            <label>
              Topic
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All engineering topics</option>
                {Object.entries(labels).map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search discussions
              <input
                type="search"
                placeholder="Fault diagnosis, EPICS, commissioning…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={120}
              />
            </label>
            <button className="button" disabled={busy}>
              Search
            </button>
          </form>
          <div className="exchange-topics">
            {Object.entries(labels).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={category === id}
                onClick={() => {
                  setCategory(id);
                  setQuery("");
                  setOffset(0);
                  action(async () => {
                    const data = await api("/threads?category=" + id);
                    setThreads(data.threads);
                    setMore(data.hasMore);
                  });
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="exchange-heading">
            <h2>Recent discussions</h2>
            <a href="#new-discussion">Start a discussion ↓</a>
          </div>
          {threads.length === 0 && ready && !error && (
            <p>No discussions match yet. Try another topic or search.</p>
          )}
          <div className="exchange-feed">
            {threads.map((t) => (
              <a
                className="exchange-panel exchange-card"
                key={t.id}
                href={"/discussions?thread=" + encodeURIComponent(t.id)}
                onClick={(event) => {
                  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  action(() => open(t.id));
                }}
              >
                <div className="exchange-meta">
                  <span>
                    {labels[t.topic_id]}
                    {t.pinned ? " · Pinned" : ""}
                    {t.locked ? " · Locked" : ""}
                  </span>
                  <span>
                    {t.starter
                      ? "Control Lattice discussion starter"
                      : date(t.created_at)}
                  </span>
                </div>
                <h3>
                  <span className="exchange-title">{t.title}</span>
                </h3>
                <p>
                  {t.body.slice(0, 220)}
                  {t.body.length > 220 ? "…" : ""}
                </p>
                <div className="exchange-meta">
                  <span>{t.display_name}</span>
                  <span>
                    {t.reply_count} replies · {t.reactions} appreciations
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="exchange-inline">
            {offset > 0 && (
              <button
                onClick={() => {
                  const at = Math.max(0, offset - 20);
                  setOffset(at);
                  action(() => loadFeed(at));
                }}
              >
                Previous page
              </button>
            )}
            {more && (
              <button
                onClick={() => {
                  const at = offset + 20;
                  setOffset(at);
                  action(() => loadFeed(at));
                }}
              >
                Next page
              </button>
            )}
          </div>
          <section id="new-discussion" className="exchange-panel">
            <h2>Start a discussion</h2>
            <p>
              {canPost
                ? "Share a focused question or an engineering lesson."
                : "Sign-in and posting will open after the security checks are complete."}
            </p>
            <form onSubmit={submitThread}>
              <fieldset disabled={!canPost || busy}>
                <label>
                  Topic
                  <select
                    value={category || "general"}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {Object.entries(labels).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Discussion title
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    minLength={8}
                    maxLength={180}
                    required
                  />
                </label>
                <label>
                  Your question or contribution
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    minLength={10}
                    maxLength={12000}
                    required
                    rows={6}
                  />
                </label>
                <p>
                  Keep credentials, proprietary designs and restricted facility
                  information private.{" "}
                  <a href="/discussions/privacy">Guidelines and privacy →</a>
                </p>
                <button className="button">Submit discussion</button>
              </fieldset>
            </form>
          </section>
        </>
      )}
      {selected && (
        <section
          id="selected-discussion" className="exchange-detail exchange-panel"
          aria-label="Selected discussion"
        >
          <button
            onClick={() => {
              setSelected(null);
              window.history.replaceState(null, "", "/discussions");
            }}
          >
            Close discussion
          </button>
          <div className="exchange-meta">
            <span>
              {labels[selected.topic_id]} · {selected.status}
            </span>
            <span>
              {selected.starter
                ? "Control Lattice discussion starter"
                : date(selected.created_at)}
            </span>
          </div>
          <h2>{selected.title}</h2>
          <p className="exchange-body">{selected.body}</p>
          <p>By {selected.display_name}</p>
          {ownerControls(selected, "thread")}
          <div className="exchange-inline">
            <button
              disabled={!canPost || busy}
              aria-pressed={liked}
              onClick={() =>
                action(async () => {
                  await api("/threads/" + selected.id + "/reaction", "POST", {
                    liked: !liked,
                  });
                  await open(selected.id);
                })
              }
            >
              {liked ? "Appreciated" : "Appreciate"} · {selected.reactions}
            </button>
            {user && ["admin", "moderator"].includes(user.role) && (
              <>
                <button
                  onClick={() =>
                    mod(
                      "thread",
                      selected.id,
                      selected.pinned ? "unpin" : "pin",
                    )
                  }
                >
                  {selected.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() =>
                    mod(
                      "thread",
                      selected.id,
                      selected.locked ? "unlock" : "lock",
                    )
                  }
                >
                  {selected.locked ? "Unlock" : "Lock"}
                </button>
              </>
            )}
          </div>
          <h3>Replies</h3>
          {replies.length === 0 && <p>No published replies yet.</p>}
          {replyList(null)}
          <form onSubmit={submitReply}>
            <fieldset
              disabled={
                !!user?.banned ||
                busy ||
                !!selected.locked ||
                selected.status !== "published"
              }
            >
              <label>
                {parent ? "Reply to a comment" : "Reply to the discussion"}
                <textarea
                  id="reply-content"
                  rows={4}
                  value={replyBody}
                  onChange={(e) => {
                    setReplyBody(e.target.value);
                    try { sessionStorage.setItem("exchange-reply-draft", JSON.stringify({ thread: selected.id, parent, body: e.target.value })); } catch {}
                  }}
                  minLength={10}
                  maxLength={12000}
                  required
                />
              </label>
              {parent && (
                <button type="button" onClick={() => setParent(null)}>
                  Reply to discussion instead
                </button>
              )}
              <button className="button" disabled={!enabled || (!user && !signIn)}>
                {user ? "Submit reply" : "Sign in with Google to submit"}
              </button>
            </fieldset>
            {selected.locked ? (
              <p>This discussion is locked.</p>
            ) : (
              <p>Your first comment is visible to you immediately and becomes public after approval. Once approved, future contributions can appear directly.{!enabled && " You can write a draft now; submissions are paused while administrator and email setup are completed."}</p>
            )}
          </form>
        </section>
      )}
      {edit && (
        <form
          className="exchange-panel"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              await api(
                "/" + (edit.title ? "threads" : "replies") + "/" + edit.id,
                "PATCH",
                { title: editTitle, body: editBody },
              );
              setEdit(null);
              setNotice("Edit submitted for moderation.");
              if (selected) await open(selected.id);
              await loadFeed();
            });
          }}
        >
          <h3>Edit your contribution</h3>
          {edit.title && (
            <label>
              Title
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                minLength={8}
                maxLength={180}
                required
              />
            </label>
          )}
          <label>
            Content
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              minLength={10}
              maxLength={12000}
              required
              rows={6}
            />
          </label>
          <p>Edits return to moderation before publication.</p>
          <button className="button" disabled={busy}>
            Submit edit
          </button>
          <button type="button" onClick={() => setEdit(null)}>
            Cancel
          </button>
        </form>
      )}
      {report && (
        <form
          className="exchange-panel"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              await api("/reports", "POST", { ...report, reason });
              setReport(null);
              setNotice("Report sent to moderators.");
            });
          }}
        >
          <h3>Report inappropriate content</h3>
          <label>
            Reason
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              maxLength={1000}
              required
            />
          </label>
          <button className="button" disabled={busy}>
            Send report
          </button>
          <button type="button" onClick={() => setReport(null)}>
            Cancel
          </button>
        </form>
      )}
      <p className="exchange-bottom">
        <a href="/discussions/privacy">
          Community guidelines, privacy and data deletion
        </a>{" "}
        ·{" "}
        <a href="/contact?interest=Research%20or%20engineering%20collaboration">
          Private collaboration inquiry
        </a>
      </p>
    </div>
  );
}
