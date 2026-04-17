import { Player } from "@/features/connect-four/domain/types";

type GameInfoPanelProps = {
  currentPlayer: Player | undefined;
  gameStatus: "active" | "finished";
  gameId: string | undefined;
  isAgentThinking: boolean;
  isLiveGameplay: boolean;
  livePlayer: Player | null;
  statusLabel: string;
  winner: Player | null;
};

export function GameInfoPanel({
  currentPlayer,
  gameStatus,
  gameId,
  isAgentThinking,
  isLiveGameplay,
  livePlayer,
  statusLabel,
  winner,
}: GameInfoPanelProps) {
  const turnLabel = winner
    ? `Player ${winner}`
    : gameStatus === "finished"
      ? "Draw"
      : currentPlayer
        ? `Player ${currentPlayer}`
        : "...";

  return (
    <section className="cf-panel rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Live State
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Game Info</h2>
        </div>
        {isAgentThinking && currentPlayer ? (
          <div className="cf-live-indicator rounded-xl px-4 py-2 text-center text-sm font-medium text-sky-800">
            Player {currentPlayer} thinking...
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Game ID
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {gameId ? gameId.slice(0, 8) : "Pending"}
          </p>
        </div>

        <div
          data-player={livePlayer ?? undefined}
          className={`rounded-2xl border px-4 py-3 shadow-sm transition-opacity duration-300 ${
            isLiveGameplay ? "opacity-100" : "opacity-85"
          } ${
            livePlayer === 1
              ? "border-rose-200/80 bg-rose-50/80"
              : livePlayer === 2
                ? "border-amber-200/80 bg-amber-50/85"
                : "border-slate-200/80 bg-white/70"
          }`}
        >
          <div className="flex items-center gap-3">
            {livePlayer ? (
              <span
                className="cf-live-indicator-dot"
                style={{ color: livePlayer === 1 ? "var(--cf-player-one)" : "var(--cf-player-two)" }}
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Turn
              </p>
              <p
                className="mt-2 text-xl font-semibold"
                style={{
                  color:
                    livePlayer === 1
                      ? "var(--cf-player-one)"
                      : livePlayer === 2
                        ? "#a16207"
                        : "#0f172a",
                }}
              >
                {gameStatus === "finished" && winner
                  ? `${turnLabel} wins`
                  : gameStatus === "finished"
                    ? turnLabel
                    : `${turnLabel}'s turn`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Status
          </p>
          <p className="mt-2 text-xl font-semibold text-sky-800">{statusLabel}</p>
        </div>
      </div>
    </section>
  );
}
