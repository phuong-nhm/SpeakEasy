"use client";

import { useState } from "react";
import { Crown, Medal } from "lucide-react";
import { LeaderboardResultDto } from "../types/leaderboard";

interface LeaderboardTabsProps {
  weekly: LeaderboardResultDto;
  friends: LeaderboardResultDto;
}

const divisionColor: Record<string, string> = {
  Bronze: "from-orange-400 to-amber-600",
  Silver: "from-slate-300 to-slate-500",
  Gold: "from-yellow-300 to-amber-500",
  Diamond: "from-cyan-300 to-blue-500",
};

const podiumStyle = ["order-2 h-28", "order-1 h-36", "order-3 h-24"]; // 2nd, 1st, 3rd

export function LeaderboardTabs({ weekly, friends }: LeaderboardTabsProps) {
  const [tab, setTab] = useState<"weekly" | "friends">("weekly");
  const data = tab === "weekly" ? weekly : friends;
  const top3 = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setTab("weekly")}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors ${
              tab === "weekly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Bảng xếp hạng Tuần
          </button>
          <button
            onClick={() => setTab("friends")}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors ${
              tab === "friends"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Bạn bè
          </button>
        </div>
      </div>

      {/* Division banner */}
      <div
        className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${divisionColor[data.division]} py-3 text-white shadow-sm`}
      >
        <Medal className="h-5 w-5" />
        <span className="font-bold">Giải {data.division}</span>
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4">
          {[top3[1], top3[0], top3[2]].map((entry, idx) =>
            entry ? (
              <div
                key={entry.userId}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {entry.rank === 1 && (
                    <Crown className="absolute -top-5 h-5 w-5 text-yellow-400" />
                  )}
                  {(entry.fullName ?? entry.userName).charAt(0).toUpperCase()}
                </div>
                <div
                  className={`flex w-24 flex-col items-center justify-end rounded-t-xl bg-gradient-to-t ${divisionColor[data.division]} px-2 pb-2 text-center text-white ${podiumStyle[idx]}`}
                >
                  <span className="text-xs font-semibold leading-tight">
                    {entry.fullName ?? entry.userName}
                  </span>
                  <span className="text-[11px] opacity-90">
                    {entry.xpThisPeriod} XP
                  </span>
                </div>
              </div>
            ) : (
              <div key={idx} className="w-24" />
            ),
          )}
        </div>
      )}

      {/* Rest of the list */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <ul className="flex flex-col divide-y divide-slate-100">
          {rest.map((entry) => (
            <li
              key={entry.userId}
              className={`flex items-center justify-between px-2 py-3 ${
                entry.isCurrentUser ? "rounded-xl bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-semibold text-slate-400">
                  {entry.rank}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {(entry.fullName ?? entry.userName).charAt(0).toUpperCase()}
                </div>
                <span
                  className={`text-sm ${
                    entry.isCurrentUser
                      ? "font-bold text-indigo-700"
                      : "text-slate-700"
                  }`}
                >
                  {entry.fullName ?? entry.userName}
                  {entry.isCurrentUser && " (Bạn)"}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {entry.xpThisPeriod} XP
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
