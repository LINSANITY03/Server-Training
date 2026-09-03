import { authOptions } from "@/lib/auth";
import getApiBase from "@/lib/helper";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    uuid: string;
  }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uuid } = await context.params;
  const API_BASE_URL = getApiBase();

  const response = await fetch(
    `${API_BASE_URL}/api/session/${uuid}/messages/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uuid } = await context.params;
  const payload = await req.json();
  const API_BASE_URL = getApiBase();

  const response = await fetch(
    `${API_BASE_URL}/api/session/${uuid}/messages/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  return NextResponse.json(data, {
    status: response.status,
  });
}
