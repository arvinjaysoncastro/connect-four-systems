import { Server } from "socket.io";
import type { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

export function createSocketServer(server: HTTPServer, corsOrigin: string) {
  const io = new Server(server, {
    cors: { origin: corsOrigin },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
    });
  });

  return io;
}

export type GameSocketServer = SocketIOServer;