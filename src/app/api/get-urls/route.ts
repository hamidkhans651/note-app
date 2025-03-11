import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls } from "@/drizzle/schema";

export async function GET() {
  const urls = await db.select().from(groupUrls);
  return NextResponse.json(urls, { status: 200 });
}
