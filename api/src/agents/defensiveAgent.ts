import { applyMove, checkWinner, getValidMoves } from "../game/engine.js";
import type { Agent, Board, Player } from "../game/types.js";

export const name = "defensive-agent";

export function getDefensiveMove(board: Board, player: Player): number {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    throw new Error("No valid moves available.");
  }

  for (const column of validMoves) {
    const move = applyMove(board, column, player);

    if (checkWinner(move.board) === player) {
      return column;
    }
  }

  const opponent = player === 1 ? 2 : 1;

  for (const column of validMoves) {
    const move = applyMove(board, column, opponent);

    if (checkWinner(move.board) === opponent) {
      return column;
    }
  }

  const fallbackMove = validMoves[0];

  if (fallbackMove === undefined) {
    throw new Error("Failed to select a defensive move.");
  }

  return fallbackMove;
}

export function selectMove(board: Board, player: Player): number {
  return getDefensiveMove(board, player);
}

export const agent: Agent = {
  name,
  selectMove,
};