import type { AgentId } from "../../../agents/index.js";
import type { Board, Player } from "../../../game/types.js";

export type GameStatus = "active" | "finished";
export type PlayerType = "human" | "agent";

export type MoveRecord = {
  player: Player;
  column: number;
  board: Board;
};

export type Game = {
  id: string;
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  status: GameStatus;
  moves: MoveRecord[];
  player1Type: PlayerType;
  player2Type: PlayerType;
  player1AgentId?: AgentId;
  player2AgentId?: AgentId;
};

export type Match = {
  id: string;
  name?: string;
  players: {
    player1Type: PlayerType;
    player2Type: PlayerType;
    player1AgentId?: AgentId;
    player2AgentId?: AgentId;
  };
  winner: Player | null;
  moves: MoveRecord[];
  createdAt: string;
};

export type RoomPlayer = {
  id: string;
  name?: string;
};

export type Room = {
  id: string;
  name?: string;
  players: RoomPlayer[];
  game: Game | null;
};

export type CreateGameInput = {
  player1Type?: unknown;
  player2Type?: unknown;
  player1AgentId?: unknown;
  player2AgentId?: unknown;
};

export type MoveInput = {
  gameId?: unknown;
  column?: unknown;
};

export type AgentMoveInput = {
  gameId?: unknown;
  agentId?: unknown;
};

export type SimulateInput = {
  agentA?: unknown;
  agentB?: unknown;
  runs?: unknown;
};

export type CreateRoomInput = {
  name?: unknown;
};

export type JoinRoomInput = {
  roomId?: unknown;
  playerName?: unknown;
};
