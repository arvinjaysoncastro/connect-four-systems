import { StatusTone } from "@/features/connect-four/domain/types";

type StatusCardsProps = {
  currentPlayer: 1 | 2 | undefined;
  gameId: string | undefined;
  highlighted: boolean;
  statusLabel: string;
};

export function StatusCards({
  currentPlayer,
  gameId,
  highlighted,
  statusLabel,
}: StatusCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatusCard label="Game" value={gameId ? gameId.slice(0, 8) : "Pending"} tone="slate" />
      <StatusCard
        label="Turn"
        value={currentPlayer ? `Player ${currentPlayer}` : "..."}
        tone={currentPlayer === 2 ? "amber" : "rose"}
        highlighted={highlighted}
      />
      <StatusCard
        label="Status"
        value={statusLabel}
        tone={statusLabel.startsWith("Winner") ? "emerald" : "sky"}
      />
    </div>
  );
}

type StatusCardProps = {
  highlighted?: boolean;
  label: string;
  tone: StatusTone;
  value: string;
};

function StatusCard({ highlighted = false, label, tone, value }: StatusCardProps) {
  const toneClasses: Record<StatusTone, string> = {
    amber:
      "border-amber-200 bg-amber-50/90 text-amber-800 shadow-[0_16px_30px_rgba(234,179,8,0.12)]",
    emerald:
      "border-emerald-200 bg-emerald-50/90 text-emerald-800 shadow-[0_16px_30px_rgba(16,185,129,0.12)]",
    rose:
      "border-rose-200 bg-rose-50/90 text-rose-800 shadow-[0_18px_34px_rgba(225,29,72,0.14)]",
    sky:
      "border-sky-200 bg-sky-50/90 text-sky-800 shadow-[0_16px_30px_rgba(14,165,233,0.14)]",
    slate:
      "border-slate-200 bg-slate-50/90 text-slate-800 shadow-[0_14px_26px_rgba(15,23,42,0.08)]",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 ${
        toneClasses[tone]
      } ${highlighted ? "scale-[1.01] ring-1 ring-white/70" : "opacity-90"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
