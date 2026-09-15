"use client";

import { useState } from "react";
import { LearningStatsDto } from "../types/profile";

interface LearningStatsTabsProps {
  weekly: LearningStatsDto;
  monthly: LearningStatsDto;
}

export function LearningStatsTabs({ weekly, monthly }: LearningStatsTabsProps) {
  const [active, setActive] = useState<"weekly" | "monthly">("weekly");
  const data = active === "weekly" ? weekly : monthly;
  const maxXp = Math.max(...data.entries.map((e) => e.xpEarned), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Thống kê học tập</h2>
        <div className="flex rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setActive("weekly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === "weekly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setActive("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === "monthly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3">
        {data.entries.map((entry) => (
          <div
            key={entry.label}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-32 w-full items-end rounded-lg bg-slate-100">
              <div
                className="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-violet-400 transition-all duration-300"
                style={{ height: `${(entry.xpEarned / maxXp) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {entry.label}
            </span>
            <span className="text-xs text-slate-400">{entry.xpEarned} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
