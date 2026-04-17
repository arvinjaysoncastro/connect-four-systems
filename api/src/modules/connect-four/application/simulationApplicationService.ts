import { randomUUID } from "node:crypto";
import { getAgentById, type AgentId } from "../../../agents/index.js";
import { createBoard } from "../../../game/engine.js";
import type { Player } from "../../../game/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { Game, MoveRecord, SimulateInput } from "../domain/models.js";
import { buildUpdatedGame } from "../domain/selectors.js";
import { applyMove, checkWinner, isDraw } from "../../../game/engine.js";

export function createSimulationApplicationService() {
  return {
    simulate(input: SimulateInput) {
      const agentA = parseAgentId(input.agentA, "agentA");
      const agentB = parseAgentId(input.agentB, "agentB");
      const runs = parseRuns(input.runs);

      let aWins = 0;
      let bWins = 0;
      let draws = 0;

      for (let index = 0; index < runs; index += 1) {
        const startingPlayer: Player = index % 2 === 0 ? 1 : 2;
        const player1AgentId: AgentId = startingPlayer === 1 ? agentA : agentB;
        const player2AgentId: AgentId = startingPlayer === 1 ? agentB : agentA;

        const game: Game = {
          id: randomUUID(),
          board: createBoard(),
          currentPlayer: startingPlayer,
          winner: null,
          status: "active",
          moves: [],
          player1Type: "agent",
          player2Type: "agent",
          player1AgentId,
          player2AgentId,
        };

        const finalGame = runAgentTurns(game);

        if (finalGame.winner === null) {
          draws += 1;
          continue;
        }

        const winnerAgentId =
          finalGame.winner === 1 ? finalGame.player1AgentId : finalGame.player2AgentId;

        if (winnerAgentId === agentA) {
          aWins += 1;
        } else if (winnerAgentId === agentB) {
          bWins += 1;
        } else {
          draws += 1;
        }
      }

      return {
        agentA,
        agentB,
        results: {
          A: aWins,
          B: bWins,
          draws,
        },
      };
    },
  };
}

function parseAgentId(value: unknown, label: string): AgentId {
  if (typeof value !== "string") {
    throw new AppError(`Invalid request body: ${label} required`, 400);
  }

  const agent = getAgentById(value as AgentId);

  if (!agent) {
    throw new AppError("Unknown agent id(s)", 400);
  }

  return agent.id;
}

function parseRuns(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError("Invalid request body: agentA, agentB, runs required", 400);
  }

  return value;
}

function runAgentTurns(initialGame: Game): Game {
  let game = initialGame;
  const maxAgentTurns = 42;
  let turns = 0;

  while (game.status === "active" && turns < maxAgentTurns) {
    const nextPlayer = game.currentPlayer;
    const agentId = nextPlayer === 1 ? game.player1AgentId : game.player2AgentId;

    if (!agentId) {
      break;
    }

    const agent = getAgentById(agentId);
    const column = agent.getMove(game.board, nextPlayer);
    const moveResult = applyMove(game.board, column, nextPlayer);
    const winner = checkWinner(moveResult.board);
    const status = winner !== null || isDraw(moveResult.board) ? "finished" : "active";
    const move: MoveRecord = { player: nextPlayer, column, board: moveResult.board };

    game = buildUpdatedGame(game, moveResult.board, winner, status, move);
    turns += 1;
  }

  return game;
}
