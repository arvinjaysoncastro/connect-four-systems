export const FALL_SPEED_PX_PER_SECOND = 800;
export const MIN_FALL_DURATION_MS = 180;
export const BOARD_ROWS = 8;
export const BOARD_COLUMNS = 8;
export const MOTION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export const AGENT_IDS = [
  "random",
  "greedy",
  "defensive",
  "minimax-lite",
  "custom-heuristic",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];
