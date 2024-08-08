ALTER TABLE "users" ADD COLUMN "vector_db_id" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_vector_db_id_unique" UNIQUE("vector_db_id");