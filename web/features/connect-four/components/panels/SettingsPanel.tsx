import { AgentId, GameStatus, PlayerType } from "@/features/connect-four/domain/types";

const agentDisplayNames: Record<AgentId, string> = {
  random: "Random",
  greedy: "Greedy",
  defensive: "Defensive",
  "minimax-lite": "Minimax Lite",
  "custom-heuristic": "ArJay's Solution",
};

const agentMechanisms: Record<AgentId, string> = {
  random:
    "Random selects any available column, making moves unpredictable without a deeper strategy.",
  greedy:
    "Greedy looks for an immediate win first, then blocks the opponent's instant win, and otherwise picks a move that strengthens the current position.",
  defensive:
    "Defensive prioritizes stopping your opponent. If there is no immediate block needed, it chooses a safe move to avoid handing the opponent a quick win.",
  "minimax-lite":
    "Minimax Lite simulates possible outcomes a few turns ahead and chooses the move that leads to the best expected position.",
  "custom-heuristic":
    "ArJay's Solution prioritizes the center columns, checks for winning moves, blocks opponent wins, and avoids moves that allow the opponent to win immediately. It then favors moves that build the longest chain of connected pieces.",
};

const agentNameToId: Record<string, AgentId> = {
  Random: "random",
  Greedy: "greedy",
  Defensive: "defensive",
  "Minimax Lite": "minimax-lite",
  "ArJay's Solution": "custom-heuristic",
};

type SettingsPanelProps = {
  agentId: AgentId;
  agentOptions: readonly AgentId[];
  assistDisabled: boolean;
  isActive: boolean;
  label: string;
  onAgentIdChange: (value: AgentId) => void;
  onAssist: () => void | Promise<void>;
  onPlayerTypeChange: (value: PlayerType) => void;
  playerType: PlayerType;
  showAssistButton: boolean;
};

export function SettingsPanel({
  agentId,
  agentOptions,
  assistDisabled,
  isActive,
  label,
  onAgentIdChange,
  onAssist,
  onPlayerTypeChange,
  playerType,
  showAssistButton,
}: SettingsPanelProps) {
  const normalizedAgentId =
    agentId in agentMechanisms
      ? agentId
      : agentNameToId[agentId as string] ?? "random";

  const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    onAgentIdChange(agentNameToId[selectedValue] ?? (selectedValue as AgentId));
  };

  return (
    <div
      className={`cf-panel rounded-[1.35rem] px-4 py-4 sm:px-5 ${
        isActive ? "cf-panel-active" : "cf-panel-muted"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isActive
                ? "bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {isActive ? "Active" : "Waiting"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
          <select
            value={playerType}
            onChange={(event) => onPlayerTypeChange(event.target.value as PlayerType)}
            className="cf-select min-w-0 rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 shadow-sm"
          >
            <option value="human">Human</option>
            <option value="agent">Agent</option>
          </select>

          <select
            value={normalizedAgentId}
            onChange={handleAgentChange}
            className="cf-select min-w-0 rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 shadow-sm"
          >
            {agentOptions.map((agentOption) => (
              <option key={agentOption} value={agentOption}>
                {agentDisplayNames[agentOption] ?? agentOption}
              </option>
            ))}
          </select>
        </div>

        {playerType === "agent" ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-900">How this strategy works</p>
            <p className="mt-2 text-slate-600">
              {agentMechanisms[normalizedAgentId] ??
                "This agent uses a strategy designed to play sensible moves based on the current board state."}
            </p>
          </div>
        ) : null}

        {playerType === "human" && showAssistButton ? (
          <button
            type="button"
            className="cf-secondary-cta w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_18px_rgba(2,132,199,0.24)]"
            disabled={assistDisabled}
            onClick={() => void onAssist()}
          >
            Play Move (AI)
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function shouldShowAssistButton(gameStatus: GameStatus | undefined, currentPlayer: 1 | 2 | undefined, player: 1 | 2) {
  return gameStatus === "active" && currentPlayer === player;
}
