import { authOptions } from "@/lib/auth";
import getApiBase from "@/lib/helper";
import { AllergyConfigSchema } from "@/types/training";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const API_BASE_URL = getApiBase();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/api/allergytag/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await response.json();

  const result = AllergyConfigSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid allergy:", result.error);
    return NextResponse.json(
      { error: "Invalid allergy configuration response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
