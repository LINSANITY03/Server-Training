import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getApiBase from "@/lib/helper";
import { TrainingConfigSchema } from "@/types/training";

export async function GET() {
  const session = await getServerSession(authOptions);
  const API_BASE_URL = getApiBase();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/api/scenario/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await response.json();

  const result = TrainingConfigSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid training config:", result.error);
    return NextResponse.json(
      { error: "Invalid training configuration response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
