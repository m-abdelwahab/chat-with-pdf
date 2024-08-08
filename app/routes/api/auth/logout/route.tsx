import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "~/lib/auth";

export async function action({ request }: ActionFunctionArgs) {
	await authenticator.logout(request, { redirectTo: "/login" });
}
