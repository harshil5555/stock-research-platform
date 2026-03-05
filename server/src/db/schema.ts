import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const todoStatusEnum = pgEnum("todo_status", [
  "pending",
  "in_progress",
  "done",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "article",
  "video",
  "podcast",
  "report",
  "tweet",
  "other",
]);

export const decisionStatusEnum = pgEnum("decision_status", [
  "researching",
  "considering",
  "bought",
  "passed",
  "sold",
  "watching",
]);

export const commentEntityTypeEnum = pgEnum("comment_entity_type", [
  "source",
  "stock",
  "todo",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Todos table
export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: todoStatusEnum("status").default("pending").notNull(),
    priority: integer("priority").default(0).notNull(),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id),
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("todos_status_idx").on(table.status)]
);

// Sources table
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url"),
  sourceType: sourceTypeEnum("source_type").default("article").notNull(),
  summary: text("summary"),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Source-Todos junction table
export const sourceTodos = pgTable(
  "source_todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    todoId: uuid("todo_id")
      .references(() => todos.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("source_todos_unique_idx").on(table.sourceId, table.todoId),
  ]
);

// Stocks table
export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticker: varchar("ticker", { length: 20 }).notNull().unique(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    sector: varchar("sector", { length: 100 }),
    notes: text("notes"),
    decisionStatus: decisionStatusEnum("decision_status")
      .default("researching")
      .notNull(),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("stocks_ticker_idx").on(table.ticker)]
);

// Source-Stocks junction table
export const sourceStocks = pgTable(
  "source_stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    stockId: uuid("stock_id")
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("source_stocks_unique_idx").on(table.sourceId, table.stockId),
  ]
);

// Attachments table
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  storedName: varchar("stored_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Analyses table (one per user per stock)
export const analyses = pgTable(
  "analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stockId: uuid("stock_id")
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    thesis: text("thesis"),
    bullCase: text("bull_case"),
    bearCase: text("bear_case"),
    notes: text("notes"),
    targetPrice: varchar("target_price", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("analyses_stock_user_unique_idx").on(
      table.stockId,
      table.userId
    ),
  ]
);

// Decisions table (append-only history)
export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stockId: uuid("stock_id")
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    status: decisionStatusEnum("status").notNull(),
    reasoning: text("reasoning"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("decisions_stock_idx").on(table.stockId)]
);

// Comments table (polymorphic)
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: commentEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    parentId: uuid("parent_id"),
    body: text("body").notNull(),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("comments_entity_idx").on(table.entityType, table.entityId),
  ]
);

// Refresh tokens table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Type exports
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type Decision = typeof decisions.$inferSelect;
export type Comment = typeof comments.$inferSelect;
