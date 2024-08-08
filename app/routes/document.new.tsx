import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { FileUpload } from "~/components/icons/file-upload";
import { Button } from "~/components/ui/button";

import { DropZone } from "~/components/ui/dropzone";
import { FileTrigger } from "~/components/ui/file-trigger";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export default function Upload() {
	const upload = useMutation({
		mutationFn: async (file: File) => {
			const res = await fetch("/api/document/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filename: file.name }),
			});

			if (!res.ok) {
				throw new Error("An error occurred while uploading the file");
			}

			const data = await res.json();

			return data;
		},
		onSuccess: async (data) => {
			const uploadRes = await fetch(data.url, {
				method: "PUT",
				body: file,
			});

			if (!uploadRes.ok) {
				throw new Error("An error occurred while uploading the file");
			}
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const ingest = useMutation({
		mutationFn: async ({
			filename,
			title,
		}: {
			filename: string;
			title: string;
		}) => {
			// API call to the ingest endpoint at /document/ingest
			const res = await fetch("/api/document/vectorize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filename, title }),
			});

			if (!res.ok) {
				throw new Error("An error occurred while ingesting the file");
			}

			const data = await res.json();

			return data;
		},
	});

	const [file, setFile] = useState<File | undefined>();

	const handleSubmit = async (file) => {
		if (file) {
			upload.mutate(file, {
				onSuccess: (data, variables, context) => {
					ingest.mutate({
						filename: data.filename,
						title: data.title,
					});
				},
			});
		}
	};

	// on DropZone drop, upload the file. hide the file trigger. show the file name and a loading spinner
	return (
		<main className="flex flex-col container mx-auto mt-12">
			<div className="w-full px-4 md:p-10">
				<Heading size="3xl" className="text-muted-high-contrast mb-5">
					Upload document
				</Heading>
				<DropZone className="w-full gap-y-5 min-h-[50vh] flex items-center justify-center p-10">
					<FileTrigger
						allowsMultiple={false}
						acceptedFileTypes={[".pdf"]}
						onSelect={async (files) => {
							if (files && files.length > 0) {
								setFile(files[0]);
								await handleSubmit(files[0]);
							}
						}}
					>
						<FileUpload className="size-10" />
						<Button size="lg" variant="ghost">
							Drag & drop or choose file to upload
						</Button>
						<Text size="xs"> Maximum PDF file size is 50mb</Text>
					</FileTrigger>
					{file && <p>{file.name}</p>}
				</DropZone>
				{upload.isPending && <p>Uploading...</p>}
				{upload.isSuccess && <p>File uploaded successfully</p>}
			</div>
		</main>
	);
}
