import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { authenticator } from "~/lib/auth";

export const meta: MetaFunction = () => {
	return [
		{ title: "Chat ith PDF" },
		{
			name: "description",
			content: "Chat with your PDF documents",
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.isAuthenticated(request, {
		successRedirect: "/documents",
	});
}

export default function Index() {
	return (
		<div className="font-sans p-4">
			<h1 className="text-3xl">Welcome to Chat with PDF</h1>
		</div>
	);
}
