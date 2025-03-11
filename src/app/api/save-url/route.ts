import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Define URL validation schema
const urlSchema = z.string().url();

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        urlSchema.parse(url); // Validate URL format

        // Normalize URL (Remove query params)
        const normalizedUrl = new URL(url);
        normalizedUrl.search = ""; // Remove tracking params

        // Check if URL already exists
        const existingUrl = await db
            .select()
            .from(groupUrls)
            .where(eq(groupUrls.url, normalizedUrl.toString()));

        if (existingUrl.length > 0) {
            return NextResponse.json({ message: "URL already exists" }, { status: 409 });
        }

        // Save the URL
        await db.insert(groupUrls).values({ url: normalizedUrl.toString() });

        return NextResponse.json({ message: "✅ URL saved successfully!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
    }
}
