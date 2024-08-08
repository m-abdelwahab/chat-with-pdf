import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import "./styles/globals.css";
import { Navbar } from "./components/layout/navbar";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "./lib/auth";
import { json } from "@remix-run/cloudflare";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);
	return json({ user });
};

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<Navbar />
			<QueryClientProvider client={queryClient}>
				<body className="bg-muted-app text-muted-base transition-colors">
					{children}
					<ScrollRestoration />
					<Scripts />
				</body>
			</QueryClientProvider>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
