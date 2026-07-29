export default function getApiBase() {
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (baseurl){
      return baseurl
  }

  return 'http://locahost:8000'
}

export async function getAuthToken() {
  const response = await fetch("/api/auth/token");

  if (!response.ok) {
    throw new Error("Failed to get auth token");
  }
  const data = await response.json();
  return data;
}