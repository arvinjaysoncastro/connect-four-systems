import { requireConnectFourApiBaseUrl } from "@/features/connect-four/config/env";
import { io, Socket } from "socket.io-client";

export type GameSocket = Socket;

export function createGameSocket(): GameSocket {
  return io(requireConnectFourApiBaseUrl(), { transports: ["websocket"] });
}
