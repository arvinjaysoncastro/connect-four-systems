import type { Request, Response } from "express";
import type { ConnectFourServices } from "../../../application/createConnectFourServices.js";

export function createRoomController(services: ConnectFourServices) {
  return {
    createRoom(request: Request, response: Response) {
      response.json(services.roomService.createRoom(request.body ?? {}));
    },
    getRoom(request: Request, response: Response) {
      response.json(services.roomService.getRoom(request.params.id));
    },
    joinRoom(request: Request, response: Response) {
      response.json(services.roomService.joinRoom(request.body ?? {}));
    },
  };
}
