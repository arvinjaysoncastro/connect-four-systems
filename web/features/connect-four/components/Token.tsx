import { CSSProperties } from "react";
import { Cell, Player } from "@/features/connect-four/domain/types";

type TokenProps = {
  cell: Cell;
  isDropping?: boolean;
  isWinning?: boolean;
  shadowOnly?: boolean;
  style?: CSSProperties;
};

export function Token({
  cell,
  isDropping = false,
  isWinning = false,
  shadowOnly = false,
  style,
}: TokenProps) {
  if (shadowOnly) {
    return (
      <span
        className={getDiscShadowClassName(cell)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={getDiscClassName(cell, isDropping, isWinning)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {cell !== 0 ? (
        <span className={getDiscStarClassName(cell, isWinning)}>{"\u2605"}</span>
      ) : null}
    </span>
  );
}

function getDiscClassName(cell: Cell, isDropping: boolean, isWinning: boolean): string {
  const baseClassName = `cf-disc relative block h-full w-full rounded-full overflow-hidden ${
    isDropping ? "cf-disc--falling" : ""
  }`;

  if (cell === 1) {
    return `${baseClassName} shadow-[0_0_13px_#c02628] bg-[radial-gradient(circle_at_32%_28%,#c02628_0%,#991b1b_35%,#7f1d1d_100%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.06)_100%),repeating-linear-gradient(45deg,rgba(0,0,0,0.03)_0_1px,transparent_1px_4px)]`;
  }

  if (cell === 2) {
    return `${baseClassName} shadow-[0_0_13px_#d97706] bg-[radial-gradient(circle_at_32%_28%,#d97706_0%,#f59e0b_35%,#b45309_100%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.06)_100%),repeating-linear-gradient(45deg,rgba(0,0,0,0.03)_0_1px,transparent_1px_4px)]`;
  }

  return `${baseClassName} bg-transparent`;
}

function getDiscStarClassName(cell: Player, isWinning: boolean): string {
  const baseClassName =
    "pointer-events-none absolute inset-0 flex items-center justify-center text-[1.65rem] leading-none transition duration-300";

  if (cell === 1) {
    return isWinning
      ? `${baseClassName} text-rose-100 opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]`
      : `${baseClassName} text-rose-950/35 opacity-0`;
  }

  return isWinning
    ? `${baseClassName} text-amber-50 opacity-100 drop-shadow-[0_0_8px_rgba(255,248,196,0.7)]`
    : `${baseClassName} text-amber-900/30 opacity-0`;
}

function getDiscShadowClassName(cell: Cell): string {
  const baseClassName = "block h-full w-full rounded-full";

  if (cell === 1) {
    return `${baseClassName} bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.18),rgba(159,18,57,0.55)_72%)] blur-[2px]`;
  }

  if (cell === 2) {
    return `${baseClassName} bg-[radial-gradient(circle_at_30%_30%,rgba(234,179,8,0.16),rgba(161,98,7,0.5)_72%)] blur-[2px]`;
  }

  return `${baseClassName} bg-transparent`;
}
