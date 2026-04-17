import { AgentId } from "@/features/connect-four/domain/types";
import { Game, PlayMode, PlayerType } from "@/features/connect-four/domain/types";

export type GameControllerState = {
  customMs: number;
  error: string | null;
  game: Game | null;
  hasPendingDelay: boolean;
  isLoading: boolean;
  isProcessingMove: boolean;
  playMode: PlayMode;
  player1AgentId: AgentId;
  player1Type: PlayerType;
  player2AgentId: AgentId;
  player2Type: PlayerType;
  replayStep: number | null;
};

export type GameControllerAction =
  | { type: "createGameStarted" }
  | { type: "createGameSucceeded"; payload: Game }
  | { type: "createGameFailed"; payload: string }
  | { type: "setGame"; payload: Game | null }
  | { type: "setError"; payload: string | null }
  | { type: "setProcessingMove"; payload: boolean }
  | { type: "setPlayer1Type"; payload: PlayerType }
  | { type: "setPlayer2Type"; payload: PlayerType }
  | { type: "setPlayer1AgentId"; payload: AgentId }
  | { type: "setPlayer2AgentId"; payload: AgentId }
  | { type: "setPlayMode"; payload: PlayMode }
  | { type: "setCustomMs"; payload: number }
  | { type: "setReplayStep"; payload: number | null }
  | { type: "setHasPendingDelay"; payload: boolean };

export const initialGameControllerState: GameControllerState = {
  customMs: 300,
  error: null,
  game: null,
  hasPendingDelay: false,
  isLoading: true,
  isProcessingMove: false,
  playMode: "short",
  player1AgentId: "random",
  player1Type: "human",
  player2AgentId: "random",
  player2Type: "agent",
  replayStep: null,
};

export function gameControllerReducer(
  state: GameControllerState,
  action: GameControllerAction,
): GameControllerState {
  switch (action.type) {
    case "createGameStarted":
      return {
        ...state,
        error: null,
        hasPendingDelay: false,
        isLoading: true,
      };
    case "createGameSucceeded":
      return {
        ...state,
        game: action.payload,
        isLoading: false,
      };
    case "createGameFailed":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "setGame":
      return {
        ...state,
        game: action.payload,
      };
    case "setError":
      return {
        ...state,
        error: action.payload,
      };
    case "setProcessingMove":
      return {
        ...state,
        isProcessingMove: action.payload,
      };
    case "setPlayer1Type":
      return {
        ...state,
        player1Type: action.payload,
      };
    case "setPlayer2Type":
      return {
        ...state,
        player2Type: action.payload,
      };
    case "setPlayer1AgentId":
      return {
        ...state,
        player1AgentId: action.payload,
      };
    case "setPlayer2AgentId":
      return {
        ...state,
        player2AgentId: action.payload,
      };
    case "setPlayMode":
      return {
        ...state,
        playMode: action.payload,
      };
    case "setCustomMs":
      return {
        ...state,
        customMs: Math.max(0, action.payload),
      };
    case "setReplayStep":
      return {
        ...state,
        replayStep: action.payload,
      };
    case "setHasPendingDelay":
      return {
        ...state,
        hasPendingDelay: action.payload,
      };
    default:
      return state;
  }
}
