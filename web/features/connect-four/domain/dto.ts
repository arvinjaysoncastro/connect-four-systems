import { AgentId, Game, Match, PlayerType, Room, SimulationResults } from "@/features/connect-four/domain/types";

export type CreateGameRequestDto = {
  player1Type?: PlayerType;
  player2Type?: PlayerType;
  player1AgentId?: AgentId;
  player2AgentId?: AgentId;
};

export type MoveRequestDto = {
  gameId: string;
  column: number;
};

export type AgentMoveRequestDto = {
  gameId: string;
  agentId?: AgentId;
};

export type AgentMoveResponseDto = {
  move?: number;
};

export type CreateRoomRequestDto = {
  name?: string;
};

export type JoinRoomRequestDto = {
  roomId: string;
  playerName?: string;
};

export type SimulateRequestDto = {
  agentA: AgentId;
  agentB: AgentId;
  runs: number;
};

export type SimulateResponseDto = {
  agentA: AgentId;
  agentB: AgentId;
  results: SimulationResults;
};

export type DeleteResponseDto = {
  deleted: boolean;
};

export type GameDto = Game;
export type RoomDto = Room;
export type MatchDto = Match;
