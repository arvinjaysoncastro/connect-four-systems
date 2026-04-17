"use client";

import React, { useEffect, useState } from "react";
import { Cell, Room } from "@/features/connect-four/domain/types";
import { createPlaceholderBoard } from "@/features/connect-four/domain/gameLogic";
import { useConnectivity } from "@/features/connect-four/hooks/useConnectivity";
import {
  createRoomRequest,
  getRoomRequest,
  joinRoomRequest,
} from "@/features/connect-four/services/roomService";

export default function RoomsPage() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOnline, isChecking, refreshConnectivity } = useConnectivity();

  useEffect(() => {
    if (!joinedRoomId) {
      return;
    }

    const activeRoomId = joinedRoomId;
    let cancelled = false;

    async function fetchOnce() {
      try {
        const body = await getRoomRequest(activeRoomId);
        if (!cancelled) {
          setRoom(body);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : String(requestError));
        }
      }
    }

    void fetchOnce();

    const id = window.setInterval(() => {
      void fetchOnce();
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [joinedRoomId]);

  async function handleCreateRoom(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = await createRoomRequest({ name: roomNameInput || undefined });
      setRoom(body);
      setRoomIdInput(body.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = await joinRoomRequest({
        roomId: roomIdInput,
        playerName: playerName || undefined,
      });
      setRoom(body);
      setJoinedRoomId(body.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Rooms - Simple Multiplayer</h1>

      <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        {!isOnline && !isChecking ? (
          <div style={{ borderRadius: 8, border: "1px solid #f5d0a9", background: "#fef3c7", padding: 12, color: "#92400e" }}>
            <strong>Offline mode:</strong> Rooms and multiplayer are unavailable while the backend is down.
            <button
              type="button"
              onClick={() => {
                void refreshConnectivity();
              }}
              style={{ marginLeft: 12, textDecoration: "underline" }}
            >
              Retry
            </button>
          </div>
        ) : null}

        <form
          onSubmit={handleCreateRoom}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            placeholder="Room name (optional)"
            value={roomNameInput}
            onChange={(event) => setRoomNameInput(event.target.value)}
            style={{ padding: "8px 10px", flex: 1 }}
            disabled={!isOnline}
          />
          <button
            type="submit"
            disabled={loading || !isOnline}
            style={{ padding: "8px 12px" }}
          >
            Create Room
          </button>
        </form>

        <form
          onSubmit={handleJoinRoom}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            placeholder="Room ID"
            value={roomIdInput}
            onChange={(event) => setRoomIdInput(event.target.value)}
            style={{ padding: "8px 10px", width: 320 }}
            disabled={!isOnline}
          />
          <input
            placeholder="Your name (optional)"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            style={{ padding: "8px 10px", width: 200 }}
            disabled={!isOnline}
          />
          <button
            type="submit"
            disabled={loading || !isOnline}
            style={{ padding: "8px 12px" }}
          >
            Join Room
          </button>
        </form>

        {error ? <div style={{ color: "#b00020" }}>Error: {error}</div> : null}
      </section>

      <section>
        {room ? (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 8px" }}>Room</h2>
            <div style={{ marginBottom: 8 }}>ID: {room.id}</div>
            {room.name ? <div style={{ marginBottom: 8 }}>Name: {room.name}</div> : null}

            <div style={{ marginBottom: 8 }}>
              <strong>Players:</strong>
              <ul>
                {room.players.map((player) => (
                  <li key={player.id}>
                    {player.name ? `${player.name} (${player.id.slice(0, 6)})` : player.id}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Game:</strong>
              {room.game ? <BoardView game={room.game} /> : <div style={{ marginTop: 8 }}>Waiting for players...</div>}
            </div>
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>No room selected.</div>
        )}
      </section>
    </main>
  );
}

function BoardView({ game }: { game: NonNullable<Room["game"]> }) {
  const board = game.board ?? createPlaceholderBoard();
  const cols = board[0]?.length ?? 8;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 8 }}>
        Status: {game.status}
        {game.winner ? ` - Winner P${game.winner}` : ""}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 48px)`, gap: 6 }}>
        {board.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div key={`${rowIndex}-${columnIndex}`} style={{ width: 48, height: 48 }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999,
                  border: "2px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: getDiscColor(cell),
                }}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function getDiscColor(cell: Cell) {
  if (cell === 1) return "radial-gradient(circle at 30% 30%, #fecdd3, #e11d48 68%)";
  if (cell === 2) return "radial-gradient(circle at 30% 30%, #fde68a, #eab308 68%)";
  return "#f8fafc";
}
