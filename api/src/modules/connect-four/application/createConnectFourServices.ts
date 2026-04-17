import type { GameSocketServer } from "../transport/socket/createSocketServer.js";
import { createMatchApplicationService } from "./matchApplicationService.js";
import { createGameApplicationService } from "./gameApplicationService.js";
import { createRoomApplicationService } from "./roomApplicationService.js";
import { createSimulationApplicationService } from "./simulationApplicationService.js";
import { createConnectFourStore } from "../infrastructure/connectFourStore.js";

export function createConnectFourServices() {
  const store = createConnectFourStore();
  let io: GameSocketServer | null = null;

  return {
    attachSocketServer(nextIo: GameSocketServer) {
      io = nextIo;
    },
    gameService: createGameApplicationService(store, () => io),
    matchService: createMatchApplicationService(store),
    roomService: createRoomApplicationService(store),
    simulationService: createSimulationApplicationService(),
  };
}

export type ConnectFourServices = ReturnType<typeof createConnectFourServices>;
