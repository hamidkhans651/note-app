import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Get all groups
export async function GET() {
  try {
    const allGroups = await db.select().from(groups);
    return NextResponse.json(allGroups, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch groups" }, { status: 500 });
  }
}

// Create a new group
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    
    if (!name) {
      return NextResponse.json({ message: "Group name is required" }, { status: 400 });
    }
    
    // Check if group already exists
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, name));
      
    if (existingGroup.length > 0) {
      return NextResponse.json({ message: "Group already exists" }, { status: 409 });
    }
    
    // Create new group
    const result = await db.insert(groups).values({ 
      name, 
      description: description || null 
    }).returning();
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create group" }, { status: 500 });
  }
} 