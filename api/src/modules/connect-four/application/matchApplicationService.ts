import { AppError } from "../../../shared/errors/AppError.js";
import type { ConnectFourStore } from "../infrastructure/connectFourStore.js";

export function createMatchApplicationService(store: ConnectFourStore) {
  return {
    clearMatches() {
      store.clearMatches();
      return { deleted: true };
    },
    deleteMatch(matchId: string) {
      const deleted = store.deleteMatch(matchId);

      if (!deleted) {
        throw new AppError("Match not found", 404);
      }

      return { deleted: true };
    },
    getMatch(matchId: string) {
      const match = store.findMatch(matchId);

      if (!match) {
        throw new AppError("Match not found", 404);
      }

      return match;
    },
    listMatches() {
      return store.getMatches();
    },
  };
}
