import type { Request, Response } from "express";
import type { ConnectFourServices } from "../../../application/createConnectFourServices.js";

export function createGameController(services: ConnectFourServices) {
  return {
    applyMove(request: Request, response: Response) {
      const game = services.gameService.applyMove(request.body ?? {});
      response.json(game);
    },
    createGame(request: Request, response: Response) {
      const game = services.gameService.createGame(request.body ?? {});
      response.json(game);
    },
    getAgentMove(request: Request, response: Response) {
      const move = services.gameService.getAgentMove(request.body ?? {});
      response.json(move);
    },
    getGame(request: Request, response: Response) {
      const game = services.gameService.getGame(request.params.id);
      response.json(game);
    },
  };
}
