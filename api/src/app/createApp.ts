import express from "express";
import cors from "cors";
import type { ConnectFourServices } from "../modules/connect-four/application/createConnectFourServices.js";
import { createConnectFourRoutes } from "../modules/connect-four/transport/http/routes.js";
import { errorHandler } from "../shared/middleware/errorHandler.js";
import { notFoundHandler } from "../shared/middleware/notFoundHandler.js";
import { env } from "../config/env.js";

export function createApp(services: ConnectFourServices) {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(createConnectFourRoutes(services));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
