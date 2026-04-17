import { BOARD_COLUMNS, BOARD_ROWS } from "@/features/connect-four/domain/constants";
import { ActiveToken, Board, Cell, Move } from "@/features/connect-four/domain/types";

export function createPlaceholderBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array<Cell>(BOARD_COLUMNS).fill(0));
}

export function getReplayBoard(moves: Move[], step: number): Board {
  const empty = createPlaceholderBoard();

  for (let i = 0; i < step && i < moves.length; i += 1) {
    const { player, column } = moves[i];

    for (let row = empty.length - 1; row >= 0; row -= 1) {
      if (empty[row][column] === 0) {
        empty[row][column] = player;
        break;
      }
    }
  }

  return empty;
}

export function getWinningCells(board: Board): Array<{ row: number; col: number }> {
  const directions: Array<{ rowDelta: number; colDelta: number }> = [
    { rowDelta: 0, colDelta: 1 },
    { rowDelta: 1, colDelta: 0 },
    { rowDelta: 1, colDelta: 1 },
    { rowDelta: 1, colDelta: -1 },
  ];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const player = board[row][col];

      if (player === 0) {
        continue;
      }

      for (const { rowDelta, colDelta } of directions) {
        const cells = [{ row, col }];
        let isLine = true;

        for (let offset = 1; offset < 4; offset += 1) {
          const nextRow = row + rowDelta * offset;
          const nextCol = col + colDelta * offset;

          if (
            nextRow < 0 ||
            nextRow >= board.length ||
            nextCol < 0 ||
            nextCol >= board[row].length ||
            board[nextRow][nextCol] !== player
          ) {
            isLine = false;
            break;
          }

          cells.push({ row: nextRow, col: nextCol });
        }

        if (isLine) {
          return cells;
        }
      }
    }
  }

  return [];
}

export function getDropRow(board: Board, column: number): number {
  for (let row = board.length - 1; row >= 0; row -= 1) {
    if (board[row][column] === 0) {
      return row;
    }
  }

  return 0;
}

export function isColumnFull(board: Board | undefined | null, column: number): boolean {
  if (
    !board ||
    !Array.isArray(board) ||
    board.length === 0 ||
    column < 0 ||
    !Array.isArray(board[0]) ||
    column >= board[0].length
  ) {
    return true;
  }

  return board[0][column] !== 0;
}

export function shouldHideBoardToken(
  activeToken: ActiveToken | null,
  rowIndex: number,
  columnIndex: number,
): boolean {
  return (
    activeToken !== null &&
    activeToken.status === "falling" &&
    activeToken.row === rowIndex &&
    activeToken.col === columnIndex
  );
}

export function getDisplayBoard(board: Board, activeToken: ActiveToken | null): Board {
  return board.map((row, rowIndex) =>
    row.map((cell, columnIndex) =>
      shouldHideBoardToken(activeToken, rowIndex, columnIndex) ? 0 : cell,
    ),
  );
}
