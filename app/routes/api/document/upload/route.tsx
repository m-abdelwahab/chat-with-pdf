import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "~/lib/object-storage";
import { authenticator } from "~/lib/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);

	if (!user) {
		return json({
			error: "Unauthorized",
		});
	}

	const { filename }: { filename: string } = await request.json();

	try {
		const key = `${filename.split(".").slice(0, -1).join(".")}-${user.userId}.${filename.split(".").pop()}`; // e.g "file-usr_oahdfhj.pdf"

		const url = await getSignedUrl(
			S3,
			new PutObjectCommand({
				Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
				Key: key,
			}),
			{
				expiresIn: 600, // 10 minutes
			},
		);
		return json({
			url,
			title: filename,
			filename: key,
		});
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
