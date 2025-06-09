
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: { filename: string } }) {
    const { filename } = await context.params;
    if (!filename) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    try {
        const imageUrl = `http://localhost:5000/uploads/${filename}`;
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        return new NextResponse(imageBuffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "image/png",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}