import { PlayMode } from "@/features/connect-four/domain/types";

type ControlsProps = {
  activeColumn: number | null;
  columnCount: number;
  columnDisabledStates: boolean[];
  isLiveGameplay: boolean;
  movesLength: number;
  onColumnClick: (column: number) => void | Promise<void>;
  onColumnEnter: (column: number) => void;
  onColumnLeave: () => void;
  onReplayNext: () => void;
  onReplayPrevious: () => void;
  onReplayReset: () => void;
  onReplayStart: () => void;
  replayStep: number | null;
  showReplayControls: boolean;
  showPlaySpeedControls: boolean;
  playMode: PlayMode;
  customMs: number;
  onPlayModeChange: (mode: PlayMode) => void;
  onCustomMsChange: (value: number) => void;
};

export function Controls({
  activeColumn,
  columnCount,
  columnDisabledStates,
  isLiveGameplay,
  movesLength,
  onColumnClick,
  onColumnEnter,
  onColumnLeave,
  onReplayNext,
  onReplayPrevious,
  onReplayReset,
  onReplayStart,
  replayStep,
  showReplayControls,
  showPlaySpeedControls,
  playMode,
  customMs,
  onPlayModeChange,
  onCustomMsChange,
}: ControlsProps) {
  return (
    <>
      {(showReplayControls || showPlaySpeedControls) ? (
        <div className={`cf-utility-row mb-4 flex flex-wrap items-center gap-2 ${isLiveGameplay ? "is-muted" : ""}`}>
          {showReplayControls ? (
            <>
              <button
            type="button"
            className="cf-chip rounded bg-slate-200 px-2 py-1 text-xs font-medium"
            disabled={replayStep === 0 || replayStep === null}
            onClick={onReplayPrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="cf-chip rounded bg-slate-200 px-2 py-1 text-xs font-medium"
            disabled={replayStep === movesLength || replayStep === null}
            onClick={onReplayNext}
          >
            Next
          </button>
          <button
            type="button"
            className="cf-chip rounded bg-slate-200 px-2 py-1 text-xs font-medium"
            disabled={replayStep === null}
            onClick={onReplayReset}
          >
            Reset
          </button>
          </>
          ) : null}
          {showPlaySpeedControls ? (
            <div className="ml-auto flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
              <span className="font-semibold">Speed</span>
              <select
                value={playMode}
                onChange={(event) => onPlayModeChange(event.target.value as PlayMode)}
                className="rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
              >
                <option value="auto">Instant</option>
                <option value="short">Short</option>
                <option value="custom">Custom</option>
              </select>
              {playMode === "custom" ? (
                <input
                  type="number"
                  min={0}
                  value={customMs}
                  onChange={(event) => onCustomMsChange(Number(event.target.value || 0))}
                  className="w-20 rounded-full border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              ) : null}
            </div>
          ) : null}
          {showReplayControls ? (
            <>
              <span className="ml-2 text-xs text-slate-500">
                {replayStep !== null ? `Move ${replayStep} / ${movesLength}` : "Live"}
              </span>
              <button
                type="button"
                className="cf-chip ml-2 rounded bg-sky-200 px-2 py-1 text-xs font-medium"
                disabled={replayStep !== null}
                onClick={onReplayStart}
              >
                Start Replay
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columnCount }, (_, column) => (
          <button
            key={`control-${column}`}
            type="button"
            onClick={() => void onColumnClick(column)}
            onMouseEnter={() => onColumnEnter(column)}
            onMouseLeave={onColumnLeave}
            onFocus={() => onColumnEnter(column)}
            onBlur={onColumnLeave}
            disabled={columnDisabledStates[column]}
            className={`cf-drop-button rounded-full px-2 py-2 text-[0.7rem] font-semibold tracking-[0.18em] text-[#1e4fa8] uppercase disabled:cursor-not-allowed disabled:opacity-45 sm:text-[0.8rem] ${
              activeColumn === column ? "is-active" : ""
            }`}
          >
            Drop
          </button>
        ))}
      </div>

    </>
  );
}
