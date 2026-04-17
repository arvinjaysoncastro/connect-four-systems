import { CSSProperties, RefObject } from "react";
import { Token } from "@/features/connect-four/components/Token";
import { ActiveTokenLayer } from "@/features/connect-four/components/board/ActiveTokenLayer";
import { BoardCell } from "@/features/connect-four/components/board/BoardCell";
import { ColumnHighlight } from "@/features/connect-four/components/board/ColumnHighlight";
import { ActiveToken, Board as BoardType } from "@/features/connect-four/domain/types";

type BoardProps = {
  activeColumn: number | null;
  activeColumnStyle: CSSProperties | null;
  activeToken: ActiveToken | null;
  activeTokenStyle: CSSProperties | null;
  board: BoardType;
  boardContainerRef: RefObject<HTMLDivElement>;
  cellDisabledStates: boolean[];
  columnCount: number;
  onCellClick: (column: number) => void | Promise<void>;
  onCellEnter: (column: number) => void;
  onCellLeave: () => void;
  rowCount: number;
  setCellRef: (index: number, node: HTMLButtonElement | null) => void;
  winningCellSet: Set<string>;
};

export function Board({
  activeColumn,
  activeColumnStyle,
  activeToken,
  activeTokenStyle,
  board,
  boardContainerRef,
  cellDisabledStates,
  columnCount,
  onCellClick,
  onCellEnter,
  onCellLeave,
  rowCount,
  setCellRef,
  winningCellSet,
}: BoardProps) {
  return (
    <div className="cf-board-stage" style={{ position: "relative", zIndex: 1 }}>
      <PreviewTokenLayer activeToken={activeToken} activeTokenStyle={activeTokenStyle} />
      <ColumnHighlight activeColumn={activeColumn} activeColumnStyle={activeColumnStyle} />

      <div
        ref={boardContainerRef}
        className="cf-board grid gap-0 rounded-[1.75rem] p-1 shadow-inner shadow-blue-950/30 sm:p-1.5"
        style={{
          position: "relative",
          zIndex: 2,
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        <ActiveTokenLayer activeToken={activeToken} activeTokenStyle={activeTokenStyle} />
        <BoardFaceSvg columnCount={columnCount} rowCount={rowCount} />

        {board.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <BoardCell
              key={`${rowIndex}-${columnIndex}`}
              cell={cell}
              columnIndex={columnIndex}
              disabled={cellDisabledStates[columnIndex]}
              index={rowIndex * columnCount + columnIndex}
              isActive={activeColumn === columnIndex}
              isDropping={
                activeToken?.status === "falling" &&
                activeToken.row === rowIndex &&
                activeToken.col === columnIndex
              }
              isWinning={winningCellSet.has(`${rowIndex}-${columnIndex}`)}
              onClick={onCellClick}
              onEnter={onCellEnter}
              onLeave={onCellLeave}
              rowIndex={rowIndex}
              setCellRef={setCellRef}
            />
          )),
        )}
      </div>
    </div>
  );
}

function PreviewTokenLayer({
  activeToken,
  activeTokenStyle,
}: {
  activeToken: ActiveToken | null;
  activeTokenStyle: CSSProperties | null;
}) {
  if (!activeToken || !activeTokenStyle || activeToken.status !== "preview") {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <div
        style={{
          ...activeTokenStyle,
          opacity: 0.35,
        }}
      >
        <div className="aspect-square rounded-full bg-transparent">
          <Token cell={activeToken.player} shadowOnly />
        </div>
      </div>
    </div>
  );
}

function BoardFaceSvg({
  columnCount,
  rowCount,
}: {
  columnCount: number;
  rowCount: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: "1.75rem",
      }}
    >
      <svg
        viewBox={`0 0 ${columnCount * 100} ${rowCount * 100}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <defs>
          <mask id="connect-four-hole-mask">
            <rect x="0" y="0" width={columnCount * 100} height={rowCount * 100} fill="white" />
            {Array.from({ length: rowCount }, (_, row) =>
              Array.from({ length: columnCount }, (_, column) => (
                <circle
                  key={`${row}-${column}`}
                  cx={50 + column * 100}
                  cy={50 + row * 100}
                  r={42}
                  fill="black"
                />
              )),
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={columnCount * 100}
          height={rowCount * 100}
          rx="28"
          ry="28"
          fill="#0f3d91"
          mask="url(#connect-four-hole-mask)"
        />
      </svg>
    </div>
  );
}
