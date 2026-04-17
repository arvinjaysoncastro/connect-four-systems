import { randomUUID } from "node:crypto";
import { createBoard } from "../../../game/engine.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { ConnectFourStore } from "../infrastructure/connectFourStore.js";
import type { CreateRoomInput, Game, JoinRoomInput, Room, RoomPlayer } from "../domain/models.js";

export function createRoomApplicationService(store: ConnectFourStore) {
  return {
    createRoom(input: CreateRoomInput) {
      const name = typeof input.name === "string" ? input.name : undefined;
      const room: Room = { id: randomUUID(), name, players: [], game: null };
      store.saveRoom(room);
      return room;
    },

    getRoom(roomId: string) {
      const room = store.getRoom(roomId);

      if (!room) {
        throw new AppError("Room not found", 404);
      }

      if (room.game) {
        const freshGame = store.getGame(room.game.id);
        if (freshGame) {
          room.game = freshGame;
          store.saveRoom(room);
        }
      }

      return room;
    },

    joinRoom(input: JoinRoomInput) {
      if (typeof input.roomId !== "string") {
        throw new AppError("roomId required", 400);
      }

      const room = store.getRoom(input.roomId);

      if (!room) {
        throw new AppError("Room not found", 404);
      }

      if (room.players.length >= 2) {
        throw new AppError("Room is full", 409);
      }

      const player: RoomPlayer = {
        id: randomUUID(),
        name: typeof input.playerName === "string" ? input.playerName : undefined,
      };

      room.players.push(player);

      if (room.players.length === 2 && room.game === null) {
        const game: Game = {
          id: randomUUID(),
          board: createBoard(),
          currentPlayer: 1,
          winner: null,
          status: "active",
          moves: [],
          player1Type: "human",
          player2Type: "human",
        };

        room.game = game;
        store.saveGame(game);
      }

      store.saveRoom(room);
      return room;
    },
  };
}
