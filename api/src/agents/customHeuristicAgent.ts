import { applyMove, checkWinner, getValidMoves } from "../game/engine.js";
import type { Agent, Board, Player } from "../game/types.js";

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export const name = "custom-heuristic-agent";

export function getCustomHeuristicMove(board: Board, player: Player): number {
  const validMoves = getPrioritizedValidMoves(board);

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

  const losingMoves: number[] = [];

  for (const column of validMoves) {
    const nextPosition = applyMove(board, column, player);
    const nextValidMoves = getValidMoves(nextPosition.board);
    const opponentCanWin = nextValidMoves.some((nextColumn) => {
      const opponentMove = applyMove(nextPosition.board, nextColumn, opponent);
      return checkWinner(opponentMove.board) === opponent;
    });

    if (opponentCanWin) {
      losingMoves.push(column);
    }
  }

  const candidateMoves = losingMoves.length === validMoves.length
    ? validMoves
    : validMoves.filter((column) => !losingMoves.includes(column));

  let bestColumn = candidateMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const column of candidateMoves) {
    const move = applyMove(board, column, player);
    const score = scoreMove(move.board, move.row, move.col, player);

    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }

  if (bestColumn === undefined) {
    throw new Error("Failed to select a heuristic move.");
  }

  return bestColumn;
}

export function selectMove(board: Board, player: Player): number {
  return getCustomHeuristicMove(board, player);
}

export const agent: Agent = {
  name,
  selectMove,
};

function getPrioritizedValidMoves(board: Board): number[] {
  const validMoves = new Set(getValidMoves(board));
  const columnCount = board[0]?.length ?? 0;
  const center = (columnCount - 1) / 2;

  return Array.from({ length: columnCount }, (_, column) => column)
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center))
    .filter((column) => validMoves.has(column));
}

function scoreMove(
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
