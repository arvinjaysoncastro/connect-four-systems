export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Board = Cell[][];
export type GameStatus = "active" | "finished";

export type Move = {
  player: Player;
  column: number;
  board?: Board;
};

export type Game = {
  id: string;
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  status: GameStatus;
  moves?: Move[];
  player1Type?: PlayerType;
  player2Type?: PlayerType;
  player1AgentId?: AgentId;
  player2AgentId?: AgentId;
};

export type ActiveToken = {
  col: number;
  row: number;
  player: Player;
  currentY: number;
  targetY: number;
  durationMs: number;
  status: "preview" | "falling";
};

export type PlayerType = "human" | "agent";
export type PlayMode = "auto" | "short" | "custom";
export type StatusTone = "amber" | "emerald" | "rose" | "sky" | "slate";
export type AgentId =
  | "random"
  | "greedy"
  | "defensive"
  | "minimax-lite"
  | "custom-heuristic";

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
  moves: Move[];
  createdAt: string;
};

export type SimulationResults = {
  A: number;
  B: number;
  draws: number;
};

export type TokenMetrics = {
  startY: number;
  targetY: number;
  durationMs: number;
};
