import {
  AgentMoveRequestDto,
  AgentMoveResponseDto,
  CreateGameRequestDto,
  GameDto,
  MoveRequestDto,
} from "@/features/connect-four/domain/dto";
import { requestJson } from "@/features/connect-four/services/httpClient";

export async function createGameRequest(params: CreateGameRequestDto): Promise<GameDto> {
  const body: CreateGameRequestDto = {
    player1Type: params.player1Type,
    player2Type: params.player2Type,
    ...(params.player1Type === "agent" && params.player1AgentId
      ? { player1AgentId: params.player1AgentId }
      : {}),
    ...(params.player2Type === "agent" && params.player2AgentId
      ? { player2AgentId: params.player2AgentId }
      : {}),
  };

  return requestJson<GameDto>("/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getGameRequest(gameId: string): Promise<GameDto> {
  return requestJson<GameDto>(`/game/${gameId}`);
}

export async function applyMoveRequest(params: MoveRequestDto): Promise<GameDto> {
  return requestJson<GameDto>("/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function requestAgentMove(
  params: AgentMoveRequestDto,
): Promise<AgentMoveResponseDto> {
  return requestJson<AgentMoveResponseDto>("/agent-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
