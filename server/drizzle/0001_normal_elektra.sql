CREATE TABLE "todo_stocks" (
	"todo_id" uuid NOT NULL,
	"stock_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "due_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "todo_stocks" ADD CONSTRAINT "todo_stocks_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_stocks" ADD CONSTRAINT "todo_stocks_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "todo_stocks_unique_idx" ON "todo_stocks" USING btree ("todo_id","stock_id");