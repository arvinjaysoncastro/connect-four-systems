import type { Game, Match, Room } from "../domain/models.js";

export function createConnectFourStore() {
  const games = new Map<string, Game>();
  const rooms = new Map<string, Room>();
  const matches: Match[] = [];

  return {
    clearMatches() {
      matches.length = 0;
    },
    deleteMatch(matchId: string) {
      const index = matches.findIndex((match) => match.id === matchId);
      if (index === -1) {
        return false;
      }

      matches.splice(index, 1);
      return true;
    },
    findMatch(matchId: string) {
      return matches.find((match) => match.id === matchId) ?? null;
    },
    findRoomByGameId(gameId: string) {
      return Array.from(rooms.values()).find((room) => room.game?.id === gameId) ?? null;
    },
    getGame(gameId: string) {
      return games.get(gameId) ?? null;
    },
    getMatches() {
      return [...matches];
    },
    getRoom(roomId: string) {
      return rooms.get(roomId) ?? null;
    },
    saveGame(game: Game) {
      games.set(game.id, game);
      return game;
    },
    saveMatch(match: Match) {
      matches.push(match);
      return match;
    },
    saveRoom(room: Room) {
      rooms.set(room.id, room);
      return room;
    },
  };
}

export type ConnectFourStore = ReturnType<typeof createConnectFourStore>;
