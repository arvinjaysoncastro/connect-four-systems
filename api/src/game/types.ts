export type Player = 1 | 2;

export type Cell = 0 | Player;

export type Board = Cell[][];

export interface MoveResult {
  board: Board;
  row: number;
  col: number;
  player: Player;
}

export interface GameResult {
  winner: Player | null;
  isDraw: boolean;
}

export interface Agent {
  name: string;
  selectMove(board: Board, player: Player): number | null;
}