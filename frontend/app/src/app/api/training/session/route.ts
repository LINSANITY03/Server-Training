import { authOptions } from "@/lib/auth";
import getApiBase from "@/lib/helper";
import { SessionSchema } from "@/types/training";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const API_BASE_URL = getApiBase();
  const session = await getServerSession(authOptions);
  const payload = await req.json();
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const response = await fetch(`${API_BASE_URL}/api/session/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }

  const data = await response.json();
  const result = SessionSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid scenario:", result.error);
    return NextResponse.json(
      { error: "Invalid scenario response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
