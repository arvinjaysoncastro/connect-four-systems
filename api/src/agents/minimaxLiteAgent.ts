import { applyMove, checkWinner, getValidMoves } from "../game/engine.js";
import type { Agent, Board, Player } from "../game/types.js";

const WIN_SCORE = 100;
const LOSS_SCORE = -100;
const NEUTRAL_SCORE = 0;

export const name = "minimax-lite-agent";

export function getMinimaxLiteMove(board: Board, player: Player): number {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    throw new Error("No valid moves available.");
  }

  const opponent = player === 1 ? 2 : 1;
  let bestMove = validMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const column of validMoves) {
    const playerMove = applyMove(board, column, player);

    if (checkWinner(playerMove.board) === player) {
      return column;
    }

    const score = scoreMove(playerMove.board, opponent);

    if (score > bestScore) {
      bestScore = score;
      bestMove = column;
    }
  }

  if (bestMove === undefined) {
    throw new Error("Failed to select a minimax-lite move.");
  }

  return bestMove;
}

export function selectMove(board: Board, player: Player): number {
  return getMinimaxLiteMove(board, player);
}

export const agent: Agent = {
  name,
  selectMove,
};

function scoreMove(board: Board, opponent: Player): number {
  const opponentMoves = getValidMoves(board);

  for (const column of opponentMoves) {
    const opponentMove = applyMove(board, column, opponent);

    if (checkWinner(opponentMove.board) === opponent) {
      return LOSS_SCORE;
    }
  }

  return opponentMoves.length > 0 ? NEUTRAL_SCORE : WIN_SCORE;
}