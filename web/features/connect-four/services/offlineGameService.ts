import {
  createPlaceholderBoard,
  getDropRow,
  getWinningCells,
  isColumnFull,
} from "@/features/connect-four/domain/gameLogic";
import {
  AgentId,
  Board,
  Game,
  Move,
  Player,
  PlayerType,
} from "@/features/connect-four/domain/types";
import {
  AgentMoveRequestDto,
  AgentMoveResponseDto,
  CreateGameRequestDto,
  MoveRequestDto,
} from "@/features/connect-four/domain/dto";

const STORAGE_KEY = "offline-game";

function createStorageKey(): string {
  return STORAGE_KEY;
}

function getNextPlayer(player: Player): Player {
  return player === 1 ? 2 : 1;
}

function isBoardComplete(board: Board): boolean {
  return board[0].every((cell) => cell !== 0);
}

function saveOfflineGame(game: Game): void {
  try {
    window.localStorage.setItem(createStorageKey(), JSON.stringify(game));
  } catch {
    // Silent if storage is unavailable.
  }
}

function loadOfflineGameFromStorage(): Game | null {
  try {
    const raw = window.localStorage.getItem(createStorageKey());

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Game | null;

    if (!parsed || typeof parsed.id !== "string" || !Array.isArray(parsed.board)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function createGameId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `offline-${crypto.randomUUID()}`;
  }

  return `offline-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function buildGame(params: CreateGameRequestDto): Game {
  const player1Type = params.player1Type ?? "human";
  const player2Type = params.player2Type ?? "agent";
  const player1AgentId = params.player1AgentId ?? "random";
  const player2AgentId = params.player2AgentId ?? "random";

  return {
    id: createGameId(),
    board: createPlaceholderBoard(),
    currentPlayer: 1,
    winner: null,
    status: "active",
    moves: [],
    player1Type,
    player2Type,
    player1AgentId,
    player2AgentId,
  };
}

function buildNextGame(game: Game, column: number): Game {
  if (game.status === "finished") {
    throw new Error("Cannot apply move to finished game.");
  }

  if (isColumnFull(game.board, column)) {
    throw new Error("Column is full.");
  }

  const nextBoard = game.board.map((row) => [...row] as typeof row);
  const row = getDropRow(nextBoard, column);

  if (nextBoard[row][column] !== 0) {
    throw new Error("Invalid move.");
  }

  nextBoard[row][column] = game.currentPlayer;

  const winner = getWinningCells(nextBoard).length ? game.currentPlayer : null;
  const nextMoves: Move[] = [
    ...(game.moves ?? []),
    { player: game.currentPlayer, column },
  ];
  const status = winner ? "finished" : isBoardComplete(nextBoard) ? "finished" : "active";

  return {
    ...game,
    board: nextBoard,
    winner,
    status,
    currentPlayer: winner ? game.currentPlayer : getNextPlayer(game.currentPlayer),
    moves: nextMoves,
  };
}

function chooseRandomMove(columns: number[]): number {
  return columns[Math.floor(Math.random() * columns.length)];
}

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function scoreMove(board: Board, row: number, col: number, player: Player): number {
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

function findWinningMove(game: Game, player: Player, availableColumns: number[]): number | null {
  for (const column of availableColumns) {
    const nextBoard = game.board.map((row) => [...row] as typeof row);
    const row = getDropRow(nextBoard, column);
    nextBoard[row][column] = player;

    if (getWinningCells(nextBoard).length > 0) {
      return column;
    }
  }

  return null;
}

function selectOfflineMove(game: Game, agentId: AgentId): number {
  const availableColumns = game.board[0]
    .map((cell, column) => (cell === 0 ? column : -1))
    .filter((column) => column >= 0);

  if (availableColumns.length === 0) {
    throw new Error("No available moves.");
  }

  const currentPlayer = game.currentPlayer;
  const opponentPlayer = getNextPlayer(currentPlayer);
  const agent = agentId ?? (currentPlayer === 1 ? game.player1AgentId : game.player2AgentId) ?? "random";

  if (agent === "greedy" || agent === "minimax-lite" || agent === "custom-heuristic") {
    const winningMove = findWinningMove(game, currentPlayer, availableColumns);
    if (winningMove !== null) {
      return winningMove;
    }
  }

  if (agent === "defensive" || agent === "greedy" || agent === "minimax-lite" || agent === "custom-heuristic") {
    const blockMove = findWinningMove(game, opponentPlayer, availableColumns);
    if (blockMove !== null) {
      return blockMove;
    }
  }

  if (agent === "custom-heuristic") {
    const losingMoves: number[] = [];

    for (const column of availableColumns) {
      const nextPosition = buildNextGame(game, column);
      const nextValidMoves = nextPosition.board[0]
        .map((cell, nextColumn) => (cell === 0 ? nextColumn : -1))
        .filter((nextColumn) => nextColumn >= 0);

      const opponentCanWin = nextValidMoves.some((nextColumn) => {
        const opponentMove = buildNextGame(nextPosition, nextColumn);
        return opponentMove.winner === opponentPlayer;
      });

      if (opponentCanWin) {
        losingMoves.push(column);
      }
    }

    const candidateMoves = losingMoves.length === availableColumns.length
      ? availableColumns
      : availableColumns.filter((column) => !losingMoves.includes(column));

    let bestColumn = candidateMoves[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const column of candidateMoves) {
      const nextPosition = buildNextGame(game, column);
      const row = getDropRow(game.board.map((row) => [...row] as typeof row), column);
      const score = scoreMove(nextPosition.board, row, column, currentPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestColumn = column;
      }
    }

    return bestColumn;
  }

  return chooseRandomMove(availableColumns);
}

export async function createGame(params: CreateGameRequestDto): Promise<Game> {
  const game = buildGame(params);
  saveOfflineGame(game);
  return game;
}

export async function applyMove(params: MoveRequestDto): Promise<Game> {
  const persistedGame = load();

  if (!persistedGame || persistedGame.id !== params.gameId) {
    throw new Error("Offline game not found.");
  }

  const nextGame = buildNextGame(persistedGame, params.column);
  saveOfflineGame(nextGame);
  return nextGame;
}

export async function requestAgentMove(
  params: AgentMoveRequestDto,
): Promise<AgentMoveResponseDto> {
  const persistedGame = load();

  if (!persistedGame || persistedGame.id !== params.gameId) {
    throw new Error("Offline game not found.");
  }

  const move = selectOfflineMove(persistedGame, params.agentId ?? "random");
  return { move };
}

export function load(): Game | null {
  return loadOfflineGameFromStorage();
}

export function save(game: Game): void {
  saveOfflineGame(game);
}

export function clear(): void {
  try {
    window.localStorage.removeItem(createStorageKey());
  } catch {
    // Silent if storage is unavailable.
  }
}

export const offlineGameService = {
  createGame,
  applyMove,
  requestAgentMove,
  load,
  save,
  clear,
};
