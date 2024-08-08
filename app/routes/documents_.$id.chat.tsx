import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { documents } from "~/lib/db/schema";
import { S3 } from "~/lib/object-storage";
import { useChat } from "ai/react";
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const documentId = params.id as string;

	const document = await db
		.select()
		.from(documents)
		.where(eq(documents.documentId, documentId));

	const url = await getSignedUrl(
		S3,
		new GetObjectCommand({
			Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: document[0].fileName,
		}),
		{
			expiresIn: 600,
		},
	);

	return json({
		documentId,
		url,
	});
};

export default function DocumentChat() {
	const { documentId, url } = useLoaderData<typeof loader>();

	const { messages, input, handleInputChange, handleSubmit } = useChat({
		body: { documentId },
		api: "/api/document/chat",
	});

	return (
		<div>
			<div>
				<h1>Document: {documentId}</h1>

				<div className="flex items-center h-screen">
					<iframe src={url} width="100%" height="100%" title="Document" />
					<div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
						{messages.length > 0
							? messages.map((m) => (
									<div key={m.id} className="whitespace-pre-wrap">
										{m.role === "user" ? "User: " : "AI: "}
										{m.content}
									</div>
								))
							: null}

						<form onSubmit={handleSubmit}>
							<input
								className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
								value={input}
								placeholder="Say something..."
								onChange={handleInputChange}
							/>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
