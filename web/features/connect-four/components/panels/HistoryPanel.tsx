import { Move } from "@/features/connect-four/domain/types";
import { formatOrdinal } from "@/features/connect-four/utils/formatters";

export function HistoryPanel({
  moves,
  isLiveGameplay = false,
}: {
  isLiveGameplay?: boolean;
  moves: Move[];
}) {
  return (
    <section className="cf-panel rounded-[1.75rem] p-5 text-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Timeline
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Match History</h2>
      </div>

      {moves.length > 0 ? (
        <ol className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {[...moves].reverse().map((move, reversedIndex) => {
            const originalIndex = moves.length - 1 - reversedIndex;
            const turnNumber = originalIndex + 1;
            const isLatest = reversedIndex === 0;

            return (
              <li
                key={`${move.player}-${move.column}-${originalIndex}`}
                className={`rounded-lg px-3 py-2 ${
                  isLatest
                    ? "bg-sky-100 font-bold text-sky-700 shadow-[0_10px_18px_rgba(14,165,233,0.12)]"
                    : "bg-white/80 text-slate-700"
                }`}
              >
                {`P${move.player} ${formatOrdinal(turnNumber)} - Column ${move.column + 1}`}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-slate-500">
          {isLiveGameplay
            ? "Moves will appear here as the match progresses."
            : "No recorded moves yet."}
        </div>
      )}
    </section>
  );
}
