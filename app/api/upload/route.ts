import {NextResponse} from "next/server";
import {handleUpload, HandleUploadBody} from "@vercel/blob/client";
import {auth} from "@clerk/nextjs/server";
import {MAX_FILE_SIZE} from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse | undefined> {
    const body = (await request.json()) as HandleUploadBody;

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const jsonResponse = await handleUpload({
            token: process.env.BLOB_READ_WRITE_TOKEN!,
            body,
            request,
            onBeforeGenerateToken: async () => {
                return {
                    allowedContentTypes: [
                        'application/pdf',
                        'image/jpeg',
                        'image/png',
                        'image/webp'
                    ],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId })
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded successfully:', blob.url);
                const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
                console.log('User ID from payload:', payload?.userId);
            }
        });

        return NextResponse.json(jsonResponse);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        const status = message.includes('Unauthorized') ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}