import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { authenticator } from "~/lib/auth";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { LangChainAdapter, type Message } from "ai";
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { vectorDatabases } from "~/lib/db/schema";
import { createNeonApiClient } from "~/lib/vector";
import { NeonPostgres } from "@langchain/community/vectorstores/neon";

export const action = async ({ context, request }: ActionFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);

	if (!user) {
		return json({
			error: "Unauthorized",
		});
	}

	const {
		messages,
		documentId,
	}: {
		messages: Message[];
		documentId: string;
	} = await request.json();

	// get the user's last message

	const { content: prompt } = messages[messages.length - 1];

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

	const result = await vectorStore.similaritySearch(prompt, 2, {
		documentId,
	});
	console.log(result);
	const model = new ChatOpenAI({
		model: "gpt-3.5-turbo-0125",
		temperature: 0,
	});

	const allMessages = messages.map((message) =>
		message.role === "user"
			? new HumanMessage(message.content)
			: new AIMessage(message.content),
	);

	const systemMessage = new SystemMessage(
		`You are a helpful assistant, here's some extra additional context that you can use to answer questions. Only use this information if it's relevant:
		
		${result.map((r) => r.pageContent).join(" ")}`,
	);

	console.log(systemMessage);

	allMessages.push(systemMessage);

	const stream = await model.stream(allMessages);

	return LangChainAdapter.toDataStreamResponse(stream);
};
