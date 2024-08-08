import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "~/lib/auth";

export const loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate("google", request, {
		successRedirect: "/documents",
		failureRedirect: "/login",
	});
};
