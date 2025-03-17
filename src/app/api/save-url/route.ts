import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { groupUrls } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Define a custom URL validation function
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Define URL validation schema
const urlSchema = z.string().refine(isValidUrl, {
  message: 'Invalid URL format',
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    urlSchema.parse(url); // Validate URL format

    // Check if URL already exists
    const existingUrl = await db
      .select()
      .from(groupUrls)
      .where(eq(groupUrls.url, url));

    if (existingUrl.length > 0) {
      return NextResponse.json({ message: 'URL already exists' }, { status: 409 });
    }

    // Save the URL without removing query parameters
    await db.insert(groupUrls).values({ url });

    return NextResponse.json({ message: '✅ URL saved successfully!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid URL format' }, { status: 400 });
  }
}
