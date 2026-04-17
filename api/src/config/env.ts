function parsePort(value: string | undefined): number {
  const port = Number.parseInt(value ?? "3001", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return port;
}

export const env = {
  corsOrigin: process.env.CORS_ORIGIN?.trim() || "*",
  port: parsePort(process.env.PORT),
} as const;
