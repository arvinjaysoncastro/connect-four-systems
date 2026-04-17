import { connectFourEnv } from "@/features/connect-four/config/env";

type ErrorPayload = { error?: string } | null;

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${connectFourEnv.apiBaseUrl}${path}`, init);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorPayload;
    throw new Error(payload?.error ?? `Request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}
