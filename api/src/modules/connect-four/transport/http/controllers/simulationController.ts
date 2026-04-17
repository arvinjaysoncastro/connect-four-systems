import type { Request, Response } from "express";
import type { ConnectFourServices } from "../../../application/createConnectFourServices.js";

export function createSimulationController(services: ConnectFourServices) {
  return {
    simulate(request: Request, response: Response) {
      response.json(services.simulationService.simulate(request.body ?? {}));
    },
  };
}
