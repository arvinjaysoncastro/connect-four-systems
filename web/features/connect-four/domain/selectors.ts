import { Game, Player } from "@/features/connect-four/domain/types";

export function getStatusLabel(game: Game | null, isLoading: boolean): string {
  if (isLoading) {
    return "Loading";
  }

  if (!game) {
    return "Offline";
  }

  if (game.winner) {
    return `Winner P${game.winner}`;
  }

  if (game.status === "finished") {
    return "Draw";
  }

  return "Active";
}

export function getLivePlayer(game: Game | null, replayActive: boolean): Player | null {
  if (replayActive) {
    return null;
  }

  if (game?.status === "active") {
    return game.currentPlayer;
  }

  return game?.winner ?? null;
}

export function isLiveGameplay(game: Game | null, replayActive: boolean): boolean {
  return Boolean(game && game.status === "active" && !replayActive);
}
