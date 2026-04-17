import { CSSProperties } from "react";

type ColumnHighlightProps = {
  activeColumn: number | null;
  activeColumnStyle: CSSProperties | null;
};

export function ColumnHighlight({
  activeColumn,
  activeColumnStyle,
}: ColumnHighlightProps) {
  return (
    <div
      className={`cf-column-highlight ${activeColumn !== null ? "is-visible" : ""}`}
      style={activeColumnStyle ?? undefined}
    />
  );
}
