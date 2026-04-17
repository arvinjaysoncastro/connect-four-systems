"use client";

import React, { useState } from "react";
import { AGENT_IDS } from "@/features/connect-four/domain/constants";
import { AgentId, SimulationResults } from "@/features/connect-four/domain/types";
import { runSimulationRequest } from "@/features/connect-four/services/simulationService";

export default function SimulationPage() {
  const [agentA, setAgentA] = useState<AgentId>("random");
  const [agentB, setAgentB] = useState<AgentId>("greedy");
  const [runs, setRuns] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResults(null);

    if (runs <= 0) {
      setError("Runs must be a positive integer");
      return;
    }

    setLoading(true);

    try {
      const body = await runSimulationRequest({ agentA, agentB, runs });
      setResults(body.results ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Connect Four - Simulation</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Agent A
          <select value={agentA} onChange={(event) => setAgentA(event.target.value as AgentId)} style={{ marginLeft: 8 }}>
            {AGENT_IDS.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </label>

        <label>
          Agent B
          <select value={agentB} onChange={(event) => setAgentB(event.target.value as AgentId)} style={{ marginLeft: 8 }}>
            {AGENT_IDS.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </label>

        <label>
          Runs
          <input
            type="number"
            min={1}
            value={runs}
            onChange={(event) => setRuns(Math.max(1, Number(event.target.value || 0)))}
            style={{ marginLeft: 8, width: 120 }}
          />
        </label>

        <div>
          <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "Running..." : "Run Simulation"}
          </button>
        </div>
      </form>

      {error ? (
        <div style={{ marginTop: 16, color: "#b00020" }}>
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      {results ? (
        <div style={{ marginTop: 20 }}>
          <h2>Results</h2>
          <ul>
            <li>Wins A ({agentA}): {results.A}</li>
            <li>Wins B ({agentB}): {results.B}</li>
            <li>Draws: {results.draws}</li>
          </ul>
        </div>
      ) : null}
    </main>
  );
}
