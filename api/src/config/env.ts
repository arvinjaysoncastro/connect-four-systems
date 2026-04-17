function getPort(): number {
  const value = process.env.PORT ?? "3001"; // fallback for local
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("Invalid PORT");
  }

  return port;
}

export const env = {
  corsOrigin: process.env.CORS_ORIGIN?.trim() || "*",
  port: getPort()
} as const;