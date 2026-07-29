import { AllergyConfigSchema, TrainingConfigSchema } from "@/types/training";
import getApiBase, { getAuthToken } from "./helper";
import { JWT } from "next-auth/jwt";

export async function getTrainingConfig() {
  const API_BASE_URL = getApiBase();
  const token: JWT = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/sessionscenario/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch training configuration");
  }

  const data = await response.json();

  const result = TrainingConfigSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid training config:", result.error);
    throw new Error("Invalid training configuration response");
  }

  return result.data;
}

export async function getAllergy() {
  const API_BASE_URL = getApiBase();
  const token: JWT = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/allergytag/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch allergies");
  }

  const data = await response.json();

  const result = AllergyConfigSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid allergy:", result.error);
    throw new Error("Invalid allergy response");
  }

  return result.data;
}
