import { json, type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Heading } from "~/components/ui/heading";
import { authenticator } from "~/lib/auth";
import { db } from "~/lib/db";
import { documents } from "~/lib/db/schema";

// get user's documents and list them
export async function loader({ request }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request);

	if (!user) {
		return redirect("/login");
	}

	const allDocuments = await db
		.select()
		.from(documents)
		.where(eq(documents.userId, user.id));

	return json({ allDocuments });
}

// Page for listing all documents
export default function Documents() {
	const { allDocuments } = useLoaderData<typeof loader>();

	return (
		<div className="p-6 my-12 container mx-auto">
			<Heading size="3xl" className="text-muted-high-contrast mb-5">
				Documents
			</Heading>
			<div className="flex flex-col gap-5">
				{allDocuments.map((document) => {
					return (
						<Link
							to={`/documents/${document.documentId}/chat`}
							key={document.documentId}
						>
							{document.title}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
