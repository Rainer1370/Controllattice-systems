-- Engineering Exchange: apply to a dedicated Cloudflare D1 database.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS exchange_users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  trust_level INTEGER NOT NULL DEFAULT 0,
  banned_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS exchange_topics (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS exchange_threads (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES exchange_topics(id),
  author_id TEXT NOT NULL REFERENCES exchange_users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','rejected','hidden')),
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS exchange_replies (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES exchange_threads(id),
  parent_id TEXT REFERENCES exchange_replies(id),
  author_id TEXT NOT NULL REFERENCES exchange_users(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','rejected','hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS exchange_reactions (
  user_id TEXT NOT NULL REFERENCES exchange_users(id),
  thread_id TEXT NOT NULL REFERENCES exchange_threads(id),
  kind TEXT NOT NULL CHECK(kind IN ('like')),
  PRIMARY KEY (user_id,thread_id,kind)
);
CREATE TABLE IF NOT EXISTS exchange_moderation_log (
  id TEXT PRIMARY KEY,
  moderator_id TEXT NOT NULL REFERENCES exchange_users(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('thread','reply','user')),
  target_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_exchange_threads_feed ON exchange_threads(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_replies_thread ON exchange_replies(thread_id,status,created_at);
INSERT OR IGNORE INTO exchange_topics (id,slug,title,description) VALUES
 ('controls','controls-automation','Controls & Automation','SCADA, EPICS, commissioning and troubleshooting'),
 ('facilities','scientific-facilities','Scientific Facilities','Accelerators, beamlines, fusion and research infrastructure'),
 ('diagnostics','ai-diagnostics','AI & Diagnostics','Observability, fault analysis and practical AI'),
 ('twins','digital-twins','Digital Twins','Simulation, validation and operational modeling'),
 ('general','general-engineering','General Engineering','Questions, collaboration and field experience');
