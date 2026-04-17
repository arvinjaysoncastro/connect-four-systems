import { AgentId, GameStatus, Player } from "@/features/connect-four/domain/types";
import { SettingsPanel, shouldShowAssistButton } from "@/features/connect-four/components/panels/SettingsPanel";

type SettingsSidebarProps = {
  agentOptions: readonly AgentId[];
  currentPlayer: Player | undefined;
  error: string | null;
  gameStatus: GameStatus | undefined;
  isAgentThinking: boolean;
  isLiveGameplay: boolean;
  isProcessingMove: boolean;
  showForceMove: boolean;
  onCreateGame: () => void | Promise<void>;
  onForceMove: () => void;
  onPlayer1AgentChange: (value: AgentId) => void;
  onPlayer1Assist: () => void | Promise<void>;
  onPlayer1TypeChange: (value: "human" | "agent") => void;
  onPlayer2AgentChange: (value: AgentId) => void;
  onPlayer2Assist: () => void | Promise<void>;
  onPlayer2TypeChange: (value: "human" | "agent") => void;
  player1AgentId: AgentId;
  player1Type: "human" | "agent";
  player2AgentId: AgentId;
  player2Type: "human" | "agent";
};

export function SettingsSidebar({
  agentOptions,
  currentPlayer,
  error,
  gameStatus,
  isAgentThinking,
  isLiveGameplay,
  isProcessingMove,
  showForceMove,
  onCreateGame,
  onForceMove,
  onPlayer1AgentChange,
  onPlayer1Assist,
  onPlayer1TypeChange,
  onPlayer2AgentChange,
  onPlayer2Assist,
  onPlayer2TypeChange,
  player1AgentId,
  player1Type,
  player2AgentId,
  player2Type,
}: SettingsSidebarProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-8">
      <section className="cf-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="mb-6 space-y-4 text-left">
          <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-1 text-sm font-medium tracking-[0.24em] text-[#1e4fa8] uppercase shadow-sm backdrop-blur">
            <span className="mr-3 flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            </span>
            Connect Four
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Drop discs, control the center, finish the line.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A polished, production-ready Connect Four experience built for executive-level impact.
              The game loads instantly, validates every move with the Node engine, and keeps the board
              in sync with authoritative server logic—even when the app drops offline.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Server-side validation</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Live board sync</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Offline fallback</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Responsive UX</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Agent-assisted play</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">Author:</span>{" "}
                <a
                  href="https://arvinjaysoncastro.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-slate-900"
                >
                  arvinjaysoncastro.com
                </a>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Git Link:</span>{" "}
                <a
                  href="https://github.com/arvinjaysoncastro/connect-four-system"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-slate-900"
                >
                  github.com/arvinjaysoncastro/connect-four-system
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Controls
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Settings</h2>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onCreateGame();
          }}
          className="mt-3 grid gap-3"
        >
          <SettingsPanel
            label="Player 1"
            isActive={!isLiveGameplay || currentPlayer === 1}
            playerType={player1Type}
            agentId={player1AgentId}
            agentOptions={agentOptions}
            showAssistButton={shouldShowAssistButton(gameStatus, currentPlayer, 1)}
            assistDisabled={gameStatus !== "active" || isProcessingMove || isAgentThinking}
            onPlayerTypeChange={onPlayer1TypeChange}
            onAgentIdChange={onPlayer1AgentChange}
            onAssist={onPlayer1Assist}
          />

          <SettingsPanel
            label="Player 2"
            isActive={!isLiveGameplay || currentPlayer === 2}
            playerType={player2Type}
            agentId={player2AgentId}
            agentOptions={agentOptions}
            showAssistButton={shouldShowAssistButton(gameStatus, currentPlayer, 2)}
            assistDisabled={gameStatus !== "active" || isProcessingMove || isAgentThinking}
            onPlayerTypeChange={onPlayer2TypeChange}
            onAgentIdChange={onPlayer2AgentChange}
            onAssist={onPlayer2Assist}
          />


          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              className="cf-primary-cta rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]"
            >
              New Game
            </button>
            {showForceMove ? (
              <button
                type="button"
                onClick={onForceMove}
                className="cf-primary-cta rounded-md bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]"
              >
                Force Move
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}
    </aside>
  );
}
