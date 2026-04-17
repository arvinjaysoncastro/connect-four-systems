import { getRandomMove } from "./randomAgent.js";
import { getGreedyMove } from "./greedyAgent.js";
import { getDefensiveMove } from "./defensiveAgent.js";
import { getMinimaxLiteMove } from "./minimaxLiteAgent.js";
import { getCustomHeuristicMove } from "./customHeuristicAgent.js";
import type { Board, Player } from "../game/types.js";

export type AgentMove = (board: Board, player: Player) => number;

export type AgentId =
  | "random"
  | "greedy"
  | "defensive"
  | "minimax-lite"
  | "custom-heuristic";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  getMove: AgentMove;
}

export const agentRegistry: Record<AgentId, AgentDefinition> = {
  random: {
    id: "random",
    name: "Random",
    description: "Chooses a random valid column.",
    getMove: (board, _player) => getRandomMove(board),
  },
  greedy: {
    id: "greedy",
    name: "Greedy",
    description: "Chooses the move that creates the strongest immediate line.",
    getMove: (board, player) => getGreedyMove(board, player),
  },
  defensive: {
    id: "defensive",
    name: "Defensive",
    description: "Looks for wins first, then blocks the opponent's winning move.",
    getMove: (board, player) => getDefensiveMove(board, player),
  },
  "minimax-lite": {
    id: "minimax-lite",
    name: "Minimax Lite",
    description: "Uses a shallow minimax-style lookahead to avoid immediate losses.",
    getMove: (board, player) => getMinimaxLiteMove(board, player),
  },
  "custom-heuristic": {
    id: "custom-heuristic",
    name: "Custom Heuristic",
    description: "Placeholder for a domain-specific heuristic strategy.",
    getMove: getCustomHeuristicMove,
  },
};

export function getAgentById(agentId: AgentId): AgentDefinition {
  return agentRegistry[agentId];
}

export function listAgents(): AgentDefinition[] {
  return Object.values(agentRegistry);
}

