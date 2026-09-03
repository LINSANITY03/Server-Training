import { CreateSession } from "@/types/training";

export async function getTrainingConfig() {
  const response = await fetch("/api/training/config");

  if (!response.ok) {
    throw new Error("Failed to fetch training configuration");
  }

  return response.json();
}

export async function getAllergy() {
  const response = await fetch("/api/training/allergy");

  if (!response.ok) {
    throw new Error("Failed to fetch allergy");
  }

  return response.json();
}

export async function createSession(payload: CreateSession) {
  const response = await fetch("/api/training/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }

  return response.json();
}

export async function getConversationTurns(sessionUuid: string) {
  const response = await fetch(`/api/training/session/${sessionUuid}/messages`);

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  return response.json();
}

export async function sendMessage(sessionUuid: string, content: string) {
  const response = await fetch(
    `/api/training/session/${sessionUuid}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function getToken() {
  const response = await fetch(
    `/api/auth/token/`,{
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch token");
  }

  return response.json();
}
