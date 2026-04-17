import { getValidMoves } from "../game/engine.js";
import type { Agent, Board, Player } from "../game/types.js";

export const name = "random-agent";

export function getRandomMove(board: Board): number {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    throw new Error("No valid moves available.");
  }

  const randomIndex = Math.floor(Math.random() * validMoves.length);
  const selectedColumn = validMoves[randomIndex];

  if (selectedColumn === undefined) {
    throw new Error("Failed to select a valid move.");
  }

  return selectedColumn;
}

export function selectMove(board: Board, _player: Player): number {
  return getRandomMove(board);
}

export const agent: Agent = {
  name,
  selectMove,
};