import http from "http";
import { env } from "./config/env.js";
import { createApp } from "./app/createApp.js";
import { createConnectFourServices } from "./modules/connect-four/application/createConnectFourServices.js";
import { createSocketServer } from "./modules/connect-four/transport/socket/createSocketServer.js";

export function startServer() {
  const services = createConnectFourServices();
  const app = createApp(services);
  const server = http.createServer(app);
  const io = createSocketServer(server, env.corsOrigin);

  services.attachSocketServer(io);

  server.listen(env.port, () => {
    console.log(`Server running on ${env.port} (HTTP + Socket.IO)`);
  });

  return { app, io, server, services };
}
