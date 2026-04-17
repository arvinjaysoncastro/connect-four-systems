import { Router } from "express";
import type { ConnectFourServices } from "../../application/createConnectFourServices.js";
import { createGameController } from "./controllers/gameController.js";
import { createMatchController } from "./controllers/matchController.js";
import { createRoomController } from "./controllers/roomController.js";
import { createSimulationController } from "./controllers/simulationController.js";
import { createSystemController } from "./controllers/systemController.js";

export function createConnectFourRoutes(services: ConnectFourServices) {
  const router = Router();
  const gameController = createGameController(services);
  const matchController = createMatchController(services);
  const roomController = createRoomController(services);
  const simulationController = createSimulationController(services);
  const systemController = createSystemController();

  router.get("/", systemController.root);
  router.get("/test", systemController.test);
  router.get("/health", systemController.health);

  router.post("/game", gameController.createGame);
  router.get("/game/:id", gameController.getGame);
  router.post("/move", gameController.applyMove);
  router.post("/agent-move", gameController.getAgentMove);

  router.get("/matches", matchController.listMatches);
  router.get("/matches/:id", matchController.getMatch);
  router.delete("/matches", matchController.clearMatches);
  router.delete("/matches/:id", matchController.deleteMatch);

  router.post("/simulate", simulationController.simulate);

  router.post("/room", roomController.createRoom);
  router.post("/room/join", roomController.joinRoom);
  router.get("/room/:id", roomController.getRoom);

  return router;
}
