import {
  CreateRoomRequestDto,
  JoinRoomRequestDto,
  RoomDto,
} from "@/features/connect-four/domain/dto";
import { requestJson } from "@/features/connect-four/services/httpClient";

export async function createRoomRequest(params: CreateRoomRequestDto): Promise<RoomDto> {
  return requestJson<RoomDto>("/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function joinRoomRequest(params: JoinRoomRequestDto): Promise<RoomDto> {
  return requestJson<RoomDto>("/room/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getRoomRequest(roomId: string): Promise<RoomDto> {
  return requestJson<RoomDto>(`/room/${roomId}`);
}
