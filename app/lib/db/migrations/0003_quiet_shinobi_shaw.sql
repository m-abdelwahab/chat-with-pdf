ALTER TABLE "users" DROP CONSTRAINT "users_vector_db_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "vector_db_id";--> statement-breakpoint
ALTER TABLE "vector_databases" ADD CONSTRAINT "vector_databases_user_id_unique" UNIQUE("user_id");