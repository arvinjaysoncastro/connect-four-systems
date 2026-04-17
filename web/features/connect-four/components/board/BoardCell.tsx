import { Token } from "@/features/connect-four/components/Token";
import { Cell } from "@/features/connect-four/domain/types";

type BoardCellProps = {
  cell: Cell;
  columnIndex: number;
  disabled: boolean;
  index: number;
  isActive: boolean;
  isDropping: boolean;
  isWinning: boolean;
  onClick: (column: number) => void | Promise<void>;
  onEnter: (column: number) => void;
  onLeave: () => void;
  rowIndex: number;
  setCellRef: (index: number, node: HTMLButtonElement | null) => void;
};

export function BoardCell({
  cell,
  columnIndex,
  disabled,
  index,
  isActive,
  isDropping,
  isWinning,
  onClick,
  onEnter,
  onLeave,
  rowIndex,
  setCellRef,
}: BoardCellProps) {
  return (
    <button
      ref={(node) => setCellRef(index, node)}
      type="button"
      onMouseEnter={() => onEnter(columnIndex)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(columnIndex)}
      onBlur={onLeave}
      onClick={() => void onClick(columnIndex)}
      disabled={disabled}
      aria-label={`Column ${columnIndex + 1}, row ${rowIndex + 1}`}
      className={`cf-cell aspect-square cursor-pointer rounded-[1.1rem] bg-transparent p-2 sm:p-3 disabled:cursor-not-allowed disabled:hover:scale-100 ${
        isActive ? "is-active" : ""
      }`}
    >
      <span className={`cf-cell-socket ${isActive ? "is-active" : ""}`}>
        <Token cell={cell} isDropping={isDropping} isWinning={isWinning} />
      </span>
    </button>
  );
}
