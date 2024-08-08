import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { GoogleStrategy } from "remix-auth-google";
import { users, vectorDatabases, type User } from "./db/schema";
import { db } from "./db";
import { generateId } from "./db/utils/generate-id";
import { getErrorMessage } from "./utils/get-error-message";
import { neon } from "@neondatabase/serverless";
import { createNeonApiClient } from "./vector";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "_session",
		sameSite: "lax",
		path: "/",
		httpOnly: true, // for security reasons, make this cookie http only
		secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
		secure: process.env.NODE_ENV === "production", // enable this in prod only
	},
});

export const authenticator = new Authenticator<User>(sessionStorage);

// TODO: add error handling where there is a redicrect to an error page with login
const googleStrategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
	},
	async ({ profile }) => {
		const email = profile.emails[0].value;

		try {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
			});

			if (!user) {
				const neonApiClient = createNeonApiClient(process.env.NEON_API_KEY);

				const { data, error } = await neonApiClient.POST("/projects", {
					body: {
						project: {},
					},
				});

				if (error) {
					throw new Error(`Failed to create Neon project, ${error}`);
				}

				const vectorDbId = data?.project.id;

				const vectorDbConnectionUri = data.connection_uris[0]?.connection_uri;

				const sql = neon(vectorDbConnectionUri);

				await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

				const vectorDb = drizzle(sql);

				await migrate(vectorDb, {
					migrationsFolder: "app/lib/vector/migrations",
				});

				const newUser = await db
					.insert(users)
					.values({
						email,
						name: profile.displayName,
						avatarUrl: profile.photos[0].value,
						userId: generateId({ object: "user" }),
					})
					.onConflictDoNothing()
					.returning();

				await db.insert(vectorDatabases).values({
					vectorDbId,
					userId: newUser[0].id,
				});

				return newUser[0];
			}

			return user;
		} catch (error) {
			console.error("User creation error:", error);
			throw new Error(getErrorMessage(error));
		}
	},
);

authenticator.use(googleStrategy);
