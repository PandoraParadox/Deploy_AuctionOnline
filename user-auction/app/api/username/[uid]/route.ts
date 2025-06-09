import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
        return NextResponse.json({ error: "UID missing" }, { status: 400 });
    }

    const user = await admin.auth().getUser(uid);
    return NextResponse.json({ name: user.displayName, email: user.email });
}
