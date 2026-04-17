"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { AGENT_IDS } from "@/features/connect-four/domain/constants";
import {
  createPlaceholderBoard,
  getDisplayBoard,
  getReplayBoard,
  getWinningCells,
  isColumnFull,
} from "@/features/connect-four/domain/gameLogic";
import { getLivePlayer, getStatusLabel, isLiveGameplay } from "@/features/connect-four/domain/selectors";
import { AgentId, Game, PlayMode, Player } from "@/features/connect-four/domain/types";
import { useActiveToken } from "@/features/connect-four/hooks/useActiveToken";
import * as gameService from "@/features/connect-four/services/gameService";
import { offlineGameService } from "@/features/connect-four/services/offlineGameService";
import { useConnectivity } from "@/features/connect-four/hooks/useConnectivity";
import { createGameSocket, GameSocket } from "@/features/connect-four/services/socketService";
import {
  gameControllerReducer,
  initialGameControllerState,
} from "@/features/connect-four/state/gameControllerReducer";
import { wait } from "@/features/connect-four/utils/timing";

export function useGameController() {
  const [state, dispatch] = useReducer(gameControllerReducer, initialGameControllerState);

  const socketRef = useRef<GameSocket | null>(null);
  const pendingDelayRef = useRef<{ timeoutId?: number; resolve?: () => void } | null>(null);
  const animationActiveRef = useRef(false);
  const queuedServerGameRef = useRef<Game | null>(null);
  const aiTurnInFlightRef = useRef(false);
  const replayAutoPlayTimeoutRef = useRef<number | null>(null);
  const { isOnline, isChecking, refreshConnectivity, goOffline, goOnline } = useConnectivity();
  const apiService = {
    createGame: gameService.createGameRequest,
    applyMove: gameService.applyMoveRequest,
    requestAgentMove: gameService.requestAgentMove,
  };
  const service = isOnline ? apiService : offlineGameService;

  const isAgentThinking =
    state.game !== null &&
    !state.game.winner &&
    state.game.status === "active" &&
    ((state.game.currentPlayer === 1 && state.player1Type === "agent") ||
      (state.game.currentPlayer === 2 && state.player2Type === "agent")) &&
    !state.isProcessingMove;

  const moves = state.game?.moves ?? [];
  const replayActive = state.replayStep !== null;
  const board = replayActive
    ? getReplayBoard(moves, state.replayStep ?? 0)
    : state.game?.board ?? createPlaceholderBoard();
  const rowCount = board.length;
  const columnCount = board[0]?.length ?? 0;
  const statusLabel = getStatusLabel(state.game, state.isLoading);
  const liveGameplay = isLiveGameplay(state.game, replayActive);
  const livePlayer = getLivePlayer(state.game, replayActive);

  const {
    activeColumn,
    activeColumnStyle,
    activeToken,
    activeTokenStyle,
    animateDrop,
    boardContainerRef,
    clearInteraction,
    clearPreviewToken,
    clearToken,
    setCellRef,
    updatePreviewToken,
  } = useActiveToken({
    board,
    columnCount,
    game: state.game,
    isAgentThinking,
    isProcessingMove: state.isProcessingMove,
    replayActive,
  });

  const winningCellSet = useMemo(
    () => new Set(getWinningCells(board).map(({ row, col }) => `${row}-${col}`)),
    [board],
  );
  const displayBoard = useMemo(() => getDisplayBoard(board, activeToken), [activeToken, board]);
  const columnDisabledStates = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, column) => {
        return (
          !state.game ||
          state.game.status === "finished" ||
          state.isProcessingMove ||
          isAgentThinking ||
          replayActive ||
          isColumnFull(state.game.board, column)
        );
      }),
    [columnCount, isAgentThinking, replayActive, state.game, state.isProcessingMove],
  );

  const showReplayControls = moves.length > 0 && (!liveGameplay || replayActive);
  const showPlaySpeedControls =
    state.player1Type === "agent" || state.player2Type === "agent" || state.isProcessingMove;
  const showForceMove = state.hasPendingDelay && state.isProcessingMove;

  useEffect(() => {
    if (!isOnline) {
      return undefined;
    }

    const socket = createGameSocket();
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOnline]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !state.game?.id) {
      return;
    }

    socket.emit("join-room", state.game.id);

    const handleGameUpdate = (nextGame: Game) => {
      if (animationActiveRef.current) {
        queuedServerGameRef.current = nextGame;
        return;
      }

      dispatch({ type: "setGame", payload: nextGame });
    };

    socket.on("game-update", handleGameUpdate);

    return () => {
      socket.off("game-update", handleGameUpdate);
      socket.emit("leave-room", state.game?.id);
    };
  }, [state.game?.id]);

  useEffect(() => {
    if (state.game || isChecking) {
      return;
    }

    void createGame();
  }, [isChecking, isOnline]);

  useEffect(() => {
    if (!isOnline && state.game) {
      offlineGameService.save(state.game);
    }
  }, [isOnline, state.game]);

  useEffect(() => {
    if (state.replayStep === null || state.replayStep >= moves.length || moves.length === 0) {
      if (replayAutoPlayTimeoutRef.current) {
        window.clearTimeout(replayAutoPlayTimeoutRef.current);
        replayAutoPlayTimeoutRef.current = null;
      }
      return;
    }

    const delayMs = getDelayMs(state.playMode, state.customMs);

    if (replayAutoPlayTimeoutRef.current) {
      window.clearTimeout(replayAutoPlayTimeoutRef.current);
    }

    replayAutoPlayTimeoutRef.current = window.setTimeout(() => {
      dispatch({
        type: "setReplayStep",
        payload: Math.min(moves.length, (state.replayStep ?? 0) + 1),
      });
    }, delayMs);

    return () => {
      if (replayAutoPlayTimeoutRef.current) {
        window.clearTimeout(replayAutoPlayTimeoutRef.current);
        replayAutoPlayTimeoutRef.current = null;
      }
    };
  }, [state.replayStep, moves.length, state.playMode, state.customMs]);

  useEffect(() => {
    if (
      !state.game ||
      state.game.status !== "active" ||
      state.isProcessingMove ||
      replayActive ||
      !isAgentThinking ||
      aiTurnInFlightRef.current
    ) {
      return;
    }

    let cancelled = false;
    aiTurnInFlightRef.current = true;

    const runAgentTurn = async () => {
      try {
        const payload = await service.requestAgentMove({
          gameId: state.game!.id,
          agentId:
            state.game!.currentPlayer === 1 ? state.player1AgentId : state.player2AgentId,
        });

        if (!cancelled && typeof payload.move === "number") {
          updatePreviewToken(payload.move);
          await wait(220);

          if (!cancelled) {
            await handleColumnClick(payload.move, true);
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          dispatch({
            type: "setError",
            payload:
              requestError instanceof Error ? requestError.message : "Unable to get agent move.",
          });
        }
      } finally {
        aiTurnInFlightRef.current = false;
      }
    };

    void runAgentTurn();

    return () => {
      cancelled = true;
    };
  }, [isAgentThinking, replayActive, state.game, state.isProcessingMove]);

  async function createGame() {
    dispatch({ type: "createGameStarted" });
    animationActiveRef.current = false;
    queuedServerGameRef.current = null;
    clearInteraction();

    try {
      const offlineGame = !isOnline ? offlineGameService.load() : null;
      const nextGame =
        offlineGame ??
        (await service.createGame({
          player1Type: state.player1Type,
          player2Type: state.player2Type,
          player1AgentId: state.player1AgentId,
          player2AgentId: state.player2AgentId,
        }));

      dispatch({ type: "createGameSucceeded", payload: nextGame });
    } catch (requestError) {
      dispatch({
        type: "createGameFailed",
        payload:
          requestError instanceof Error
            ? requestError.message
            : "Unable to connect to the game server.",
      });
    }
  }

  async function handleColumnClick(column: number, initiatedByAgent = false) {
    if (
      !state.game ||
      state.game.status === "finished" ||
      state.isProcessingMove ||
      (isAgentThinking && !initiatedByAgent) ||
      replayActive ||
      isColumnFull(state.game.board, column)
    ) {
      return;
    }

    dispatch({ type: "setProcessingMove", payload: true });
    dispatch({ type: "setError", payload: null });

    const previousGame = state.game;
    const player = state.game.currentPlayer;

    animationActiveRef.current = true;
    queuedServerGameRef.current = null;

    try {
      const animationResult = await animateDrop(column, player, state.game.board);

      if (!animationResult) {
        throw new Error("Unable to measure token animation.");
      }

      const delayMs = getDelayMs(state.playMode, state.customMs);

      if (delayMs > 0) {
        await waitWithAbort(delayMs);
      }

      const nextGame = await service.applyMove({
        gameId: previousGame.id,
        column,
      });

      dispatch({ type: "setGame", payload: nextGame });
      clearToken();
      const queuedGame: Game | null = queuedServerGameRef.current;

      if (hasMatchingGameId(queuedGame, nextGame)) {
        dispatch({ type: "setGame", payload: queuedGame });
        queuedServerGameRef.current = null;
      }
    } catch (requestError) {
      clearToken();
      dispatch({ type: "setGame", payload: previousGame });
      dispatch({
        type: "setError",
        payload: requestError instanceof Error ? requestError.message : "Unable to apply move.",
      });
    } finally {
      animationActiveRef.current = false;
      dispatch({ type: "setHasPendingDelay", payload: false });
      dispatch({ type: "setProcessingMove", payload: false });
      clearPreviewToken();
    }
  }

  async function playAssistedMove(player: Player) {
    if (!state.game) {
      return;
    }

    try {
      const payload = await service.requestAgentMove({
        gameId: state.game.id,
        agentId: player === 1 ? state.player1AgentId : state.player2AgentId,
      });

      if (typeof payload.move === "number") {
        await handleColumnClick(payload.move);
      }
    } catch {
      // Preserve existing silent failure behavior.
    }
  }

  function waitWithAbort(ms: number) {
    return new Promise<void>((resolve) => {
      if (pendingDelayRef.current?.timeoutId) {
        clearTimeout(pendingDelayRef.current.timeoutId);
      }

      const id = window.setTimeout(() => {
        pendingDelayRef.current = null;
        dispatch({ type: "setHasPendingDelay", payload: false });
        resolve();
      }, ms);

      pendingDelayRef.current = { timeoutId: id, resolve };
      dispatch({ type: "setHasPendingDelay", payload: true });
    });
  }

  function forceMoveNow() {
    const pending = pendingDelayRef.current;

    if (!pending) {
      return;
    }

    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    pending.resolve?.();
    pendingDelayRef.current = null;
    dispatch({ type: "setHasPendingDelay", payload: false });
  }

  return {
    activeColumn,
    activeColumnStyle,
    activeToken,
    activeTokenStyle,
    agentOptions: AGENT_IDS,
    boardContainerRef,
    clearPreviewToken,
    columnCount,
    columnDisabledStates,
    createGame,
    customMs: state.customMs,
    displayBoard,
    error: state.error,
    forceMoveNow,
    game: state.game,
    goToNextReplayStep: () =>
      dispatch({
        type: "setReplayStep",
        payload: state.replayStep !== null ? Math.min(moves.length, state.replayStep + 1) : 1,
      }),
    goToPreviousReplayStep: () =>
      dispatch({
        type: "setReplayStep",
        payload: state.replayStep !== null ? Math.max(0, state.replayStep - 1) : 0,
      }),
    handleColumnClick,
    isAgentThinking,
    isLiveGameplay: liveGameplay,
    isLoading: state.isLoading,
    isProcessingMove: state.isProcessingMove,
    livePlayer,
    moves,
    playAssistedMoveForPlayer1: () => playAssistedMove(1),
    playAssistedMoveForPlayer2: () => playAssistedMove(2),
    playMode: state.playMode,
    player1AgentId: state.player1AgentId,
    player1Type: state.player1Type,
    player2AgentId: state.player2AgentId,
    player2Type: state.player2Type,
    replayStep: state.replayStep,
    resetReplay: () => dispatch({ type: "setReplayStep", payload: null }),
    rowCount,
    setCellRef,
    setCustomMs: (value: number) => dispatch({ type: "setCustomMs", payload: value }),
    setPlayMode: (value: PlayMode) => dispatch({ type: "setPlayMode", payload: value }),
    setPlayer1AgentId: (value: AgentId) =>
      dispatch({ type: "setPlayer1AgentId", payload: value }),
    setPlayer1Type: (value: typeof state.player1Type) =>
      dispatch({ type: "setPlayer1Type", payload: value }),
    setPlayer2AgentId: (value: AgentId) =>
      dispatch({ type: "setPlayer2AgentId", payload: value }),
    refreshConnectivity,
    isOnline,
    isChecking,
    goOnline,
    goOffline,
    setPlayer2Type: (value: typeof state.player2Type) =>
      dispatch({ type: "setPlayer2Type", payload: value }),
    showForceMove,
    showPlaySpeedControls,
    showReplayControls,
    startReplay: () => dispatch({ type: "setReplayStep", payload: 0 }),
    statusLabel,
    updatePreviewToken,
    winningCellSet,
  };
}

function getDelayMs(playMode: PlayMode, customMs: number) {
  if (playMode === "auto") {
    return 0;
  }

  if (playMode === "short") {
    return 500;
  }

  return Math.max(0, Math.floor(customMs));
}

function hasMatchingGameId(
  queuedGame: Game | null,
  nextGame: Game,
): queuedGame is Game {
  return queuedGame !== null && queuedGame.id === nextGame.id;
}
