import type { Request, Response } from "express";
import type { ConnectFourServices } from "../../../application/createConnectFourServices.js";

export function createMatchController(services: ConnectFourServices) {
  return {
    clearMatches(_request: Request, response: Response) {
      response.json(services.matchService.clearMatches());
    },
    deleteMatch(request: Request, response: Response) {
      response.json(services.matchService.deleteMatch(request.params.id));
    },
    getMatch(request: Request, response: Response) {
      response.json(services.matchService.getMatch(request.params.id));
    },
    listMatches(_request: Request, response: Response) {
      response.json(services.matchService.listMatches());
    },
  };
}
