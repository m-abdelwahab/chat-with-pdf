import { json, redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { extractText, getDocumentProxy } from "unpdf";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "~/lib/object-storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { authenticator } from "~/lib/auth";
import { db } from "~/lib/db";
import { documents, vectorDatabases } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNeonApiClient } from "~/lib/vector";
import { generateId } from "~/lib/db/utils/generate-id";

// vectorize document using langchain
// request validation using Zod

// check that user is authenticated, validate request body, generate embeddings and store them in associated vector store for the user, create document
export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const user = await authenticator.isAuthenticated(request);

		if (!user) {
			return json({
				error: "Unauthorized",
			});
		}

		const {
			filename,
			title,
		}: { filename: string; title: string; fileSize: number } =
			await request.json();

		// get user's project ID, and get the connection string

		const vectorDb = await db
			.select()
			.from(vectorDatabases)
			.where(eq(vectorDatabases.userId, user.id));

		const neonApiClient = createNeonApiClient(process.env.NEON_API_KEY);

		const { data, error } = await neonApiClient.GET(
			"/projects/{project_id}/connection_uri",
			{
				params: {
					path: {
						project_id: vectorDb[0].vectorDbId,
					},
					query: {
						role_name: "neondb_owner",
						database_name: "neondb",
					},
				},
			},
		);

		if (error) {
			return json({
				error: error,
			});
		}

		const embeddings = new OpenAIEmbeddings({
			apiKey: process.env.OPENAI_API_KEY,
			dimensions: 1536,
			model: "text-embedding-3-small",
		});

		const vectorStore = await NeonPostgres.initialize(embeddings, {
			connectionString: data.uri,
			tableName: "embeddings",
			columns: {
				contentColumnName: "content",
				metadataColumnName: "metadata",
				vectorColumnName: "embedding",
			},
		});

		const url = await getSignedUrl(
			S3,
			new GetObjectCommand({
				Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
				Key: filename,
			}),
			{
				expiresIn: 600,
			},
		);

		const buffer = await fetch(url).then((res) => res.arrayBuffer());

		const pdf = await getDocumentProxy(new Uint8Array(buffer));
		// Extract text from PDF
		const { text } = await extractText(pdf, { mergePages: true });

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 100,
		});

		const documentId = generateId({ object: "document" });

		const docOutput = await splitter.splitDocuments([
			new Document({ pageContent: text, metadata: { documentId } }),
		]);
		console.log(docOutput);
		// add ids and make it the same length as the docOutput
		const result = await vectorStore.addDocuments(docOutput);
		console.log(result);
		const document = await db
			.insert(documents)
			.values({
				documentId: documentId,
				userId: user.id,
				title: title,
				fileName: filename,
				fileSize: `0`,
			})
			.returning();

		return json({ document });
	} catch (error) {
		return json({
			error: error.message,
		});
	}
};
