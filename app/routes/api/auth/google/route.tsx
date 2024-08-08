import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "~/lib/auth";

export const loader = () => redirect("/login");

export const action = ({ request }: ActionFunctionArgs) => {
	return authenticator.authenticate("google", request);
};
