import React from "react";
import MatchingGameClient from "../../../features/frontend/review/components/MatchingGameClient";

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Game Hub
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Game Hub</h1>
          <p className="mt-2 text-sm text-slate-600">
            Play quick review games to reinforce vocabulary and earn XP.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Matching Game</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn level và chapter rồi bắt đầu ghép từ.
          </p>
          <div className="mt-5">
            <MatchingGameClient />
          </div>
        </section>
      </div>
    </div>
  );
}
