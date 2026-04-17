"use client";

import { useEffect, useRef, useState } from "react";
import { Board } from "@/features/connect-four/components/Board";
import { Controls } from "@/features/connect-four/components/Controls";
import { GameInfoPanel } from "@/features/connect-four/components/panels/GameInfoPanel";
import { HistoryPanel } from "@/features/connect-four/components/panels/HistoryPanel";
import { SettingsSidebar } from "@/features/connect-four/components/panels/SettingsSidebar";
import { AmbientBackground } from "@/features/connect-four/components/ui/AmbientBackground";
import { useGameController } from "@/features/connect-four/hooks/useGameController";

export default function Home() {
  const game = useGameController();
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const previousOnlineRef = useRef(game.isOnline);

  useEffect(() => {
    if (!previousOnlineRef.current && game.isOnline) {
      const activateId = window.setTimeout(() => setShowOnlineToast(true), 0);
      const hideId = window.setTimeout(() => setShowOnlineToast(false), 4000);

      return () => {
        window.clearTimeout(activateId);
        window.clearTimeout(hideId);
      };
    }

    previousOnlineRef.current = game.isOnline;
    return undefined;
  }, [game.isOnline]);

  return (
    <main className="relative overflow-hidden connect-four-shell min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7,transparent_28%),linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#e0f2fe_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <AmbientBackground className="z-0" />
      {showOnlineToast ? (
        <div className="fixed right-4 top-4 z-50 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-xl animate-pulse">
          ✨ Online mode restored
          <button
            type="button"
            onClick={() => {
              void game.goOnline();
            }}
            className="ml-3 underline"
          >
            Switch to Online
          </button>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div />
          <div
            className={`inline-flex flex-wrap items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
              game.isOnline
                ? "border-emerald-200 bg-emerald-100 text-emerald-900"
                : "border-amber-200 bg-amber-100 text-amber-900"
            }`}
          >
            {game.isOnline ? "🟢 Online Mode" : "⚠️ Offline Mode (limited)"}
            {game.isChecking ? <span className="text-xs font-medium">Checking...</span> : null}
            <button
              type="button"
              onClick={game.isOnline ? game.goOffline : game.goOnline}
              disabled={game.isChecking}
              className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {game.isOnline ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(21rem,24rem)_minmax(0,1fr)_minmax(17rem,19rem)]">
          <div className="order-2 xl:order-1">
            <SettingsSidebar
              currentPlayer={game.game?.currentPlayer}
              gameStatus={game.game?.status}
              player1Type={game.player1Type}
              player2Type={game.player2Type}
              player1AgentId={game.player1AgentId}
              player2AgentId={game.player2AgentId}
              agentOptions={game.agentOptions}
              error={game.error}
              isLiveGameplay={game.isLiveGameplay}
              isProcessingMove={game.isProcessingMove}
              isAgentThinking={game.isAgentThinking}
              showForceMove={game.showForceMove}
              onCreateGame={game.createGame}
              onForceMove={game.forceMoveNow}
              onPlayer1AgentChange={game.setPlayer1AgentId}
              onPlayer1Assist={game.playAssistedMoveForPlayer1}
              onPlayer1TypeChange={game.setPlayer1Type}
              onPlayer2AgentChange={game.setPlayer2AgentId}
              onPlayer2Assist={game.playAssistedMoveForPlayer2}
              onPlayer2TypeChange={game.setPlayer2Type}
            />
          </div>
          <section className="order-1 xl:order-2 min-w-0 rounded-[2rem] p-4 sm:p-6 bg-transparent shadow-none border-none">
            <div className="space-y-3">
            <Controls
              columnCount={game.columnCount}
              columnDisabledStates={game.columnDisabledStates}
              activeColumn={game.activeColumn}
              showReplayControls={game.showReplayControls}
              replayStep={game.replayStep}
              movesLength={game.moves.length}
              isLiveGameplay={game.isLiveGameplay}
              onColumnClick={game.handleColumnClick}
              onColumnEnter={game.updatePreviewToken}
              onColumnLeave={game.clearPreviewToken}
              onReplayPrevious={game.goToPreviousReplayStep}
              onReplayNext={game.goToNextReplayStep}
              onReplayReset={game.resetReplay}
              onReplayStart={game.startReplay}
              showPlaySpeedControls={game.showPlaySpeedControls}
              playMode={game.playMode}
              customMs={game.customMs}
              onPlayModeChange={game.setPlayMode}
              onCustomMsChange={game.setCustomMs}
            />

            <Board
              board={game.displayBoard}
              rowCount={game.rowCount}
              columnCount={game.columnCount}
              activeColumn={game.activeColumn}
              activeColumnStyle={game.activeColumnStyle}
              activeToken={game.activeToken}
              activeTokenStyle={game.activeTokenStyle}
              winningCellSet={game.winningCellSet}
              cellDisabledStates={game.columnDisabledStates}
              boardContainerRef={game.boardContainerRef}
              onCellClick={game.handleColumnClick}
              onCellEnter={game.updatePreviewToken}
              onCellLeave={game.clearPreviewToken}
              setCellRef={game.setCellRef}
            />
          </div>

          </section>

          <aside className="order-3 space-y-4">
            <GameInfoPanel
              gameId={game.game?.id}
              statusLabel={game.statusLabel}
              isAgentThinking={game.isAgentThinking}
              currentPlayer={game.game?.currentPlayer}
              winner={game.game?.winner ?? null}
              gameStatus={game.game?.status ?? "active"}
              livePlayer={game.livePlayer}
              isLiveGameplay={game.isLiveGameplay}
            />
            <HistoryPanel
              moves={game.game?.moves ?? []}
              isLiveGameplay={game.isLiveGameplay}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
