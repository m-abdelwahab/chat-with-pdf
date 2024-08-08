import { Form, Link } from "@remix-run/react";
import { Plus } from "../icons/plus";
import { Button } from "../ui/button";
import { Button as ReactAriaButton } from "react-aria-components";

import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/root";
import { Menu, MenuContent, MenuItem } from "../ui/menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Navbar = () => {
	const data = useLoaderData<typeof loader>();

	const user = data.user;

	return (
		<nav className="bg-muted-app text-muted-base px-4 pb-5 pt-7 ring-1 ring-zinc-950/5 dark:ring-white/5">
			<div className="mx-auto flex items-center justify-between px-2 sm:px-4 lg:max-w-7xl">
				<div className="flex items-center gap-2 sm:gap-4">
					<a aria-label="Home" href="/">
						<svg
							className="h-6 "
							fill="currentColor"
							viewBox="0 0 34 28"
							role="img"
							aria-label="Catalyst Logo"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M9.3311 0.166016L8.90235 0.408763L0.902352 13.7418L0.902344 14.2563L8.90234 27.5903L8.97771 27.6867L8.97871 27.6877L9.3321 27.834H25.3321L25.6857 26.9805L22.3527 23.6465L21.9991 23.5H12.2742L6.25596 14L12.2733 4.49902H21.9981L22.3517 4.35257L25.6847 1.01957L25.3311 0.166016H9.3311Z"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M27.836 5.07617L24.6 8.31317L24.5312 8.93422L27.7398 13.9997L24.5312 19.0651L24.6001 19.6862L27.8361 22.9222L28.6184 22.8259L33.7604 14.2569L33.7604 13.7424L28.6184 5.17242L27.836 5.07617Z"
							/>
						</svg>
					</a>
					{user && (
						<Link className="ml-8 text-sm/6 font-medium " to="/documents">
							Documents
						</Link>
					)}
				</div>
				{user && (
					<div className="flex items-center gap-4 sm:gap-8">
						<Form action="/document/new">
							<Button size="sm" className="font-medium" type="submit">
								New Document
								<Plus className="w-4 h-4 ml-2" />
							</Button>
						</Form>

						<Menu>
							<ReactAriaButton aria-label="Menu">
								<Avatar>
									<AvatarImage src={user.avatarUrl ?? undefined} />
									<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
								</Avatar>
							</ReactAriaButton>
							<MenuContent>
								<MenuItem>
									<Form action="/api/auth/logout" method="POST">
										<ReactAriaButton type="submit">Logout</ReactAriaButton>
									</Form>
								</MenuItem>
							</MenuContent>
						</Menu>
					</div>
				)}
			</div>
		</nav>
	);
};
