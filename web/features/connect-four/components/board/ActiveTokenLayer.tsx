import { CSSProperties } from "react";
import { ActiveToken } from "@/features/connect-four/domain/types";
import { Token } from "@/features/connect-four/components/Token";

type ActiveTokenLayerProps = {
  activeToken: ActiveToken | null;
  activeTokenStyle: CSSProperties | null;
};

export function ActiveTokenLayer({
  activeToken,
  activeTokenStyle,
}: ActiveTokenLayerProps) {
  if (!activeToken || !activeTokenStyle) {
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
        zIndex: 2,
      }}
    >
      <div style={activeTokenStyle}>
        <div className="aspect-square rounded-full bg-transparent">
          <Token
            cell={activeToken.player}
            isDropping={activeToken.status === "falling"}
            style={{ opacity: activeToken.status === "preview" ? 0.92 : 1 }}
          />
        </div>
      </div>
    </div>
  );
}
