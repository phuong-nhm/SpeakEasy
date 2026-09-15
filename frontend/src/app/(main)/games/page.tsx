import React from "react";
import MatchingGameClient from "../../../components/MatchingGameClient";

export default function GamesPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Game Hub</h1>
      <p style={{ marginTop: 6 }}>
        Play quick review games to reinforce vocabulary and earn XP.
      </p>

      <section style={{ marginTop: 20 }}>
        <h2>Matching Game</h2>
        <MatchingGameClient />
      </section>
    </div>
  );
}
