"use client";

import { CSSProperties, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  FALL_SPEED_PX_PER_SECOND,
  MIN_FALL_DURATION_MS,
  MOTION_EASING,
} from "@/features/connect-four/domain/constants";
import { getDropRow, isColumnFull } from "@/features/connect-four/domain/gameLogic";
import { ActiveToken, Board, Game, Player, TokenMetrics } from "@/features/connect-four/domain/types";
import { nextFrame, wait } from "@/features/connect-four/utils/timing";

type UseActiveTokenArgs = {
  board: Board;
  columnCount: number;
  game: Game | null;
  isAgentThinking: boolean;
  isProcessingMove: boolean;
  replayActive: boolean;
};

export function useActiveToken({
  board,
  columnCount,
  game,
  isAgentThinking,
  isProcessingMove,
  replayActive,
}: UseActiveTokenArgs) {
  const [activeToken, setActiveToken] = useState<ActiveToken | null>(null);
  const [activeColumn, setActiveColumn] = useState<number | null>(null);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeTokenStyle = getActiveTokenStyle(
    activeToken,
    boardContainerRef.current,
    cellRefs.current,
    columnCount,
  );

  const activeColumnStyle =
    activeColumn !== null
      ? ({
          left: `calc(${(activeColumn / columnCount) * 100}% + 0.25rem)`,
          width: `calc(${100 / columnCount}% - 0.5rem)`,
        } satisfies CSSProperties)
      : null;

  function setCellRef(index: number, node: HTMLButtonElement | null) {
    cellRefs.current[index] = node;
  }

  function clearPreviewToken() {
    updatePreviewToken(null);
  }

  function clearInteraction() {
    setActiveColumn(null);
    setActiveToken(null);
  }

  function clearToken() {
    setActiveToken(null);
  }

  function updatePreviewToken(column: number | null) {
    setActiveColumn(column);

    if (
      column === null ||
      !game ||
      replayActive ||
      isProcessingMove ||
      isAgentThinking ||
      isColumnFull(board, column)
    ) {
      setActiveToken((current) => (current?.status === "preview" ? null : current));
      return;
    }

    const dropRow = getDropRow(board, column);
    const metrics = getTokenMetrics(
      boardContainerRef.current,
      cellRefs.current,
      dropRow,
      column,
      columnCount,
    );

    if (!metrics) {
      return;
    }

    const player = game.currentPlayer;

    setActiveToken((current) => {
      if (
        current &&
        current.status === "preview" &&
        current.col === column &&
        current.row === dropRow &&
        current.player === player &&
        current.currentY === metrics.startY
      ) {
        return current;
      }

      return {
        col: column,
        row: dropRow,
        player,
        currentY: metrics.startY,
        targetY: metrics.targetY,
        durationMs: metrics.durationMs,
        status: "preview",
      };
    });
  }

  async function animateDrop(column: number, player: Player, boardForMove: Board) {
    setActiveColumn(column);

    const dropRow = getDropRow(boardForMove, column);
    const metrics = getTokenMetrics(
      boardContainerRef.current,
      cellRefs.current,
      dropRow,
      column,
      columnCount,
    );

    if (!metrics) {
      return null;
    }

    flushSync(() => {
      setActiveToken({
        col: column,
        row: dropRow,
        player,
        currentY: metrics.startY,
        targetY: metrics.targetY,
        durationMs: metrics.durationMs,
        status: "preview",
      });
    });

    await nextFrame();
    await nextFrame();

    const resolvedMetrics = getTokenMetrics(
      boardContainerRef.current,
      cellRefs.current,
      dropRow,
      column,
      columnCount,
    );
    const finalMetrics = resolvedMetrics ?? metrics;

    void boardContainerRef.current?.offsetHeight;

    flushSync(() => {
      setActiveToken((current) =>
        current && current.status === "preview" && current.col === column
          ? {
              ...current,
              row: dropRow,
              currentY: finalMetrics.targetY,
              targetY: finalMetrics.targetY,
              durationMs: finalMetrics.durationMs,
              status: "falling",
            }
          : {
              col: column,
              row: dropRow,
              player,
              currentY: finalMetrics.targetY,
              targetY: finalMetrics.targetY,
              durationMs: finalMetrics.durationMs,
              status: "falling",
            },
      );
    });

    await wait(finalMetrics.durationMs);

    return { dropRow, durationMs: finalMetrics.durationMs };
  }

  return {
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
  };
}

function getActiveTokenStyle(
  activeToken: ActiveToken | null,
  boardContainer: HTMLDivElement | null,
  cells: Array<HTMLButtonElement | null>,
  columnCount: number,
): CSSProperties | null {
  if (!activeToken || !boardContainer) {
    return null;
  }

  const topCell = cells[activeToken.col];
  const targetCell = cells[activeToken.row * columnCount + activeToken.col];

  if (!topCell || !targetCell) {
    return null;
  }

  const topSocket = topCell.querySelector<HTMLElement>(".cf-cell-socket");
  const targetSocket = targetCell.querySelector<HTMLElement>(".cf-cell-socket");

  const startLeft =
    topCell.offsetLeft + (topSocket?.offsetLeft ?? 0);
  const width = targetSocket?.offsetWidth ?? targetCell.offsetWidth;
  const height = targetSocket?.offsetHeight ?? targetCell.offsetHeight;

  return {
    position: "absolute",
    left: startLeft,
    top: 0,
    width,
    height,
    transform: `translateY(${activeToken.currentY}px)`,
    WebkitTransform: `translateY(${activeToken.currentY}px)`,
    transition:
      activeToken.status === "falling"
        ? `transform ${activeToken.durationMs}ms ${MOTION_EASING}, -webkit-transform ${activeToken.durationMs}ms ${MOTION_EASING}`
        : undefined,
    WebkitTransition:
      activeToken.status === "falling"
        ? `-webkit-transform ${activeToken.durationMs}ms ${MOTION_EASING}, transform ${activeToken.durationMs}ms ${MOTION_EASING}`
        : undefined,
    willChange: "transform",
  };
}

function getTokenMetrics(
  boardContainer: HTMLDivElement | null,
  cells: Array<HTMLButtonElement | null>,
  row: number,
  col: number,
  columnCount: number,
): TokenMetrics | null {
  if (!boardContainer) {
    return null;
  }

  const topCell = cells[col];
  const targetCell = cells[row * columnCount + col];

  if (!topCell || !targetCell) {
    return null;
  }

  const topSocket = topCell.querySelector<HTMLElement>(".cf-cell-socket");
  const targetSocket = targetCell.querySelector<HTMLElement>(".cf-cell-socket");

  const startY =
    topCell.offsetTop -
    (topSocket?.offsetHeight ?? topCell.offsetHeight) +
    (topSocket?.offsetTop ?? 0);
  const targetY = targetCell.offsetTop + (targetSocket?.offsetTop ?? 0);
  const distance = Math.abs(targetY - startY);
  const durationMs = Math.max(
    MIN_FALL_DURATION_MS,
    (distance / FALL_SPEED_PX_PER_SECOND) * 1000,
  );

  return { startY, targetY, durationMs };
}
