import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "app/lib/vector/schema.ts",
	out: "app/lib/vector/migrations",
	dialect: "postgresql",
});
