import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Placeholder endpoint for monthly ESG entry.
  // Replace this with real persistence logic as needed.
  console.log("Monthly data received:", body);

  return NextResponse.json({ success: true });
}
