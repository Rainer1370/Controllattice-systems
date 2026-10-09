import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const users = sqliteTable("exchange_users", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("member"),
  trusted: integer("trusted").notNull().default(0),
  banned: integer("banned").notNull().default(0),
  organization: integer("organization").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  deletedAt: integer("deleted_at"),
});
export const topics = sqliteTable("exchange_topics", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});
export const threads = sqliteTable(
  "exchange_threads",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    pinned: integer("pinned").notNull().default(0),
    locked: integer("locked").notNull().default(0),
    starter: integer("starter").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("exchange_feed").on(t.status, t.pinned, t.createdAt),
    index("exchange_category").on(t.topicId, t.status, t.createdAt),
    index("exchange_thread_author").on(t.authorId),
  ],
);
export const replies = sqliteTable(
  "exchange_replies",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id),
    parentId: text("parent_id"),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("exchange_replies_feed").on(t.threadId, t.status, t.createdAt),
    index("exchange_reply_author").on(t.authorId),
  ],
);
export const reactions = sqliteTable(
  "exchange_reactions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.threadId] })],
);
export const reports = sqliteTable(
  "exchange_reports",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("open"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("exchange_reports_queue").on(t.status, t.createdAt),
    uniqueIndex("exchange_report_once").on(t.userId, t.targetType, t.targetId),
  ],
);
export const moderation = sqliteTable("exchange_moderation_log", {
  id: text("id").primaryKey(),
  moderatorId: text("moderator_id").references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at").notNull(),
});
export const sessions = sqliteTable(
  "exchange_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    csrf: text("csrf").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [
    index("exchange_session_user").on(t.userId),
    index("exchange_session_expiry").on(t.expiresAt),
  ],
);
export const oauth = sqliteTable("exchange_oauth", {
  stateHash: text("state_hash").primaryKey(),
  nonce: text("nonce").notNull(),
  verifier: text("verifier").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const limits = sqliteTable("exchange_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
