import type { Request, Response } from "express";
import { createBoard } from "../../../../../game/engine.js";

export function createSystemController() {
  return {
    root(_request: Request, response: Response) {
      response.send("API running");
    },
    test(_request: Request, response: Response) {
      response.json(createBoard());
    },
    health(_request: Request, response: Response) {
      response.sendStatus(200);
    },
  };
}
