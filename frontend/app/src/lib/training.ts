import {
  CreateSession
} from "@/types/training";

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
