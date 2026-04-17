import type { Board, Cell, MoveResult, Player } from "./types.js";

export const ROW_COUNT = 8;
export const COLUMN_COUNT = 8;
export const CONNECT_LENGTH = 4;

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function createBoard(): Board {
  return Array.from({ length: ROW_COUNT }, () =>
    Array<Cell>(COLUMN_COUNT).fill(0),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getValidMoves(board: Board): number[] {
  return Array.from({ length: COLUMN_COUNT }, (_, col) => col).filter(
    (col) => getNextOpenRow(board, col) !== null,
  );
}

export function applyMove(
  board: Board,
  col: number,
  player: Player,
): MoveResult {
  assertValidColumn(col);

  const row = getNextOpenRow(board, col);

  if (row === null) {
    throw new Error(`Column ${col} is full.`);
  }

  const nextBoard = cloneBoard(board);
  nextBoard[row][col] = player;

  return {
    board: nextBoard,
    row,
    col,
    player,
  };
}

export function checkWinner(board: Board): Player | null {
  for (let row = 0; row < ROW_COUNT; row += 1) {
    for (let col = 0; col < COLUMN_COUNT; col += 1) {
      const cell = board[row][col];

      if (cell === 0) {
        continue;
      }

      for (const [rowDelta, colDelta] of DIRECTIONS) {
        if (hasConnectFourFromCell(board, row, col, rowDelta, colDelta, cell)) {
          return cell;
        }
      }
    }
  }

  return null;
}

export function isDraw(board: Board): boolean {
  return checkWinner(board) === null && getValidMoves(board).length === 0;
}

export function getNextOpenRow(board: Board, col: number): number | null {
  assertValidColumn(col);

  for (let row = ROW_COUNT - 1; row >= 0; row -= 1) {
    if (board[row][col] === 0) {
      return row;
    }
  }

  return null;
}

export function isWinningMove(board: Board, col: number, player: Player): boolean {
  const { board: nextBoard } = applyMove(board, col, player);
  return checkWinner(nextBoard) === player;
}

function hasConnectFourFromCell(
  board: Board,
  startRow: number,
  startCol: number,
  rowDelta: number,
  colDelta: number,
  player: Player,
): boolean {
  for (let offset = 1; offset < CONNECT_LENGTH; offset += 1) {
    const row = startRow + rowDelta * offset;
    const col = startCol + colDelta * offset;

    if (!isInBounds(row, col) || board[row][col] !== player) {
      return false;
    }
  }

  return true;
}

function assertValidColumn(col: number): void {
  if (!Number.isInteger(col) || col < 0 || col >= COLUMN_COUNT) {
    throw new RangeError(
      `Column index must be an integer between 0 and ${COLUMN_COUNT - 1}.`,
    );
  }
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROW_COUNT && col >= 0 && col < COLUMN_COUNT;
}
