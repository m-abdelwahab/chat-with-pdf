CREATE TABLE IF NOT EXISTS "vector_databases" (
	"id" serial PRIMARY KEY NOT NULL,
	"vector_db_id" varchar(256) NOT NULL,
	"user_id" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vector_databases_vector_db_id_unique" UNIQUE("vector_db_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vector_databases" ADD CONSTRAINT "vector_databases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vector_db_id_idx" ON "vector_databases" USING btree ("vector_db_id");