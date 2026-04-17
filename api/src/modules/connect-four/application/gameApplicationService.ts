import { randomUUID } from "node:crypto";
import { getAgentById } from "../../../agents/index.js";
import { applyMove, checkWinner, createBoard, isDraw } from "../../../game/engine.js";
import type { Player } from "../../../game/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { GameSocketServer } from "../transport/socket/createSocketServer.js";
import type { ConnectFourStore } from "../infrastructure/connectFourStore.js";
import type { AgentMoveInput, CreateGameInput, Game, MoveInput, MoveRecord } from "../domain/models.js";
import {
  buildUpdatedGame,
  getCurrentAgentId,
  isAgentTurn,
  parseAgentId,
  parseColumn,
  parsePlayerType,
  parseRequiredGameId,
  toMatch,
} from "../domain/selectors.js";

export function createGameApplicationService(
  store: ConnectFourStore,
  getIo: () => GameSocketServer | null,
) {
  return {
    applyMove(input: MoveInput) {
      const gameId = parseRequiredGameId(input.gameId);
      const column = parseColumn(input.column);
      const game = store.getGame(gameId);

      if (!game) {
        throw new AppError("Game not found", 404);
      }

      if (game.status !== "active") {
        throw new AppError("Game already finished", 409);
      }

      const updatedGame = applyTurn(game, column, game.currentPlayer);

      if (updatedGame.status === "finished") {
        store.saveMatch(toMatch(updatedGame));
      }

      store.saveGame(updatedGame);
      publishGameUpdate(updatedGame, store, getIo());

      return updatedGame;
    },

    createGame(input: CreateGameInput) {
      const player1Type = parsePlayerType(input.player1Type);
      const player2Type = parsePlayerType(input.player2Type);
      const player1AgentId = parseAgentId(input.player1AgentId, player1Type);
      const player2AgentId = parseAgentId(input.player2AgentId, player2Type);

      const game: Game = {
        id: randomUUID(),
        board: createBoard(),
        currentPlayer: 1,
        winner: null,
        status: "active",
        moves: [],
        player1Type,
        player2Type,
        ...(player1AgentId ? { player1AgentId } : {}),
        ...(player2AgentId ? { player2AgentId } : {}),
      };

      store.saveGame(game);
      return game;
    },

    getAgentMove(input: AgentMoveInput) {
      const gameId = parseRequiredGameId(input.gameId);
      const game = store.getGame(gameId);

      if (!game) {
        throw new AppError("Game not found", 404);
      }

      if (game.status !== "active") {
        throw new AppError("Game already finished", 409);
      }

      const agentId = getCurrentAgentId(game);

      if (!isAgentTurn(game) || !agentId) {
        throw new AppError("Current player is not an agent", 409);
      }

      const agent = getAgentById(agentId);
      return { move: agent.getMove(game.board, game.currentPlayer) };
    },

    getGame(gameId: string) {
      const game = store.getGame(gameId);

      if (!game) {
        throw new AppError("Game not found", 404);
      }

      return game;
    },
  };
}

function applyTurn(game: Game, column: number, player: Player): Game {
  const moveResult = applyMove(game.board, column, player);
  const winner = checkWinner(moveResult.board);
  const status = winner !== null || isDraw(moveResult.board) ? "finished" : "active";
  const move: MoveRecord = { player, column, board: moveResult.board };

  return buildUpdatedGame(game, moveResult.board, winner, status, move);
}

function publishGameUpdate(game: Game, store: ConnectFourStore, io: GameSocketServer | null) {
  if (!io) {
    return;
  }

  const room = store.findRoomByGameId(game.id);

  if (room) {
    io.to(room.id).emit("game-update", game);
  }
}
