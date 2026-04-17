import type { AgentId } from "../../../agents/index.js";
import type { Player } from "../../../game/types.js";
import type { Game, Match, MoveRecord, PlayerType } from "./models.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getAgentById } from "../../../agents/index.js";

export function getNextPlayer(player: Player): Player {
  return player === 1 ? 2 : 1;
}

export function parsePlayerType(playerType: unknown): PlayerType {
  if (playerType === undefined) {
    return "human";
  }

  if (playerType === "human" || playerType === "agent") {
    return playerType;
  }

  throw new AppError('Player type must be "human" or "agent".', 400);
}

export function parseAgentId(agentId: unknown, playerType: PlayerType): AgentId | undefined {
  if (agentId === undefined) {
    return undefined;
  }

  if (typeof agentId !== "string") {
    throw new AppError("Agent id must be a string.", 400);
  }

  if (playerType !== "agent") {
    throw new AppError("Agent id can only be provided for agent players.", 400);
  }

  const resolvedAgent = getAgentById(agentId as AgentId);

  if (!resolvedAgent) {
    throw new AppError(`Unknown agent id: ${agentId}`, 400);
  }

  return resolvedAgent.id;
}

export function parseRequiredGameId(gameId: unknown): string {
  if (typeof gameId !== "string") {
    throw new AppError("gameId required", 400);
  }

  return gameId;
}

export function parseColumn(column: unknown): number {
  if (typeof column !== "number" || !Number.isInteger(column)) {
    throw new AppError("Invalid request body", 400);
  }

  return column;
}

export function toMatch(game: Game): Match {
  return {
    id: game.id,
    players: {
      player1Type: game.player1Type,
      player2Type: game.player2Type,
      ...(game.player1AgentId ? { player1AgentId: game.player1AgentId } : {}),
      ...(game.player2AgentId ? { player2AgentId: game.player2AgentId } : {}),
    },
    winner: game.winner,
    moves: game.moves,
    createdAt: new Date().toISOString(),
  };
}

export function isAgentTurn(game: Game): boolean {
  return (
    (game.currentPlayer === 1 && game.player1Type === "agent" && !!game.player1AgentId) ||
    (game.currentPlayer === 2 && game.player2Type === "agent" && !!game.player2AgentId)
  );
}

export function getCurrentAgentId(game: Game): AgentId | undefined {
  return game.currentPlayer === 1 ? game.player1AgentId : game.player2AgentId;
}

export function buildUpdatedGame(
  game: Game,
  board: Game["board"],
  winner: Player | null,
  status: Game["status"],
  move: MoveRecord,
): Game {
  return {
    ...game,
    board,
    currentPlayer: status === "active" ? getNextPlayer(game.currentPlayer) : game.currentPlayer,
    moves: [...game.moves, move],
    status,
    winner,
  };
}
