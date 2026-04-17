import { applyMove, getValidMoves } from "../game/engine.js";
import type { Agent, Board, Player } from "../game/types.js";

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export const name = "greedy-agent";

export function getGreedyMove(board: Board, player: Player): number {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    throw new Error("No valid moves available.");
  }

  let bestColumn = validMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const column of validMoves) {
    const move = applyMove(board, column, player);
    const score = scoreBoard(move.board, move.row, move.col, player);

    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }

  if (bestColumn === undefined) {
    throw new Error("Failed to select a greedy move.");
  }

  return bestColumn;
}

export function selectMove(board: Board, player: Player): number {
  return getGreedyMove(board, player);
}

export const agent: Agent = {
  name,
  selectMove,
};

function scoreBoard(
  board: Board,
  row: number,
  col: number,
  player: Player,
): number {
  let longestChain = 0;

  for (const [rowDelta, colDelta] of DIRECTIONS) {
    const chainLength = getChainLength(board, row, col, rowDelta, colDelta, player);
    longestChain = Math.max(longestChain, chainLength);
  }

  return longestChain;
}

function getChainLength(
  board: Board,
  row: number,
  col: number,
  rowDelta: number,
  colDelta: number,
  player: Player,
): number {
  return (
    1 +
    countDirection(board, row, col, rowDelta, colDelta, player) +
    countDirection(board, row, col, -rowDelta, -colDelta, player)
  );
}

function countDirection(
  board: Board,
  startRow: number,
  startCol: number,
  rowDelta: number,
  colDelta: number,
  player: Player,
): number {
  let chainLength = 0;
  let row = startRow + rowDelta;
  let col = startCol + colDelta;

  while (isInBounds(board, row, col) && board[row][col] === player) {
    chainLength += 1;
    row += rowDelta;
    col += colDelta;
  }

  return chainLength;
}

function isInBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}