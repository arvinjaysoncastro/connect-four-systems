function getApiBaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    return undefined;
  }

  try {
    new URL(value);
    return value;
  } catch {
    return undefined;
  }
}

export function getConnectFourApiBaseUrl(): string | undefined {
  return getApiBaseUrl();
}

export function requireConnectFourApiBaseUrl(): string {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error("Missing or invalid NEXT_PUBLIC_API_BASE_URL environment variable.");
  }

  return apiBaseUrl;
}
