import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validate URL format
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// URL Schema validation
const urlSchema = z.string().refine(isValidUrl, {
  message: "Invalid URL format",
});

export async function POST(req: Request) {
  try {
    const { url, title, description } = await req.json();
    urlSchema.parse(url); // Validate URL format

    // Check if the URL already exists in the database
    const existingUrl = await db
      .select()
      .from(groupUrls)
      .where(eq(groupUrls.url, url));

    if (existingUrl.length > 0) {
      // If the URL already exists, return a conflict response
      return NextResponse.json({ message: "URL already exists" }, { status: 409 });
    }

    // Save the URL along with the title and description, keeping the full URL format
    await db.insert(groupUrls).values({ url, title, description });

    return NextResponse.json({ message: "✅ URL saved successfully!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
  }
}
