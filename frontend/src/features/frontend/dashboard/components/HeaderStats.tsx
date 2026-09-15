"use client";

import Link from "next/link";
import { BookOpenCheck, Gamepad2, User } from "lucide-react";

interface HeaderStatsProps {
  levelNumber: number;
  title: string;
  progress: number;
  completed: number;
  total: number;
}

export function HeaderStats({
  levelNumber,
  title,
  progress,
  completed,
  total,
}: HeaderStatsProps) {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
            Level {levelNumber}
          </p>
          <h1 className="mt-2 text-3xl font-black">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">
              Progress
            </p>
            <p className="mt-1 text-2xl font-bold">{progress}%</p>
          </div>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-yellow-300 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase 4/5 quick actions: Review / Games / Profile */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href="/review"
          className="group flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <span className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-emerald-200" />
            <span className="text-sm font-semibold">Ôn tập</span>
          </span>
          <span className="hidden text-xs text-indigo-100 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
            →
          </span>
        </Link>

        <Link
          href="/games"
          className="group flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <span className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-yellow-200" />
            <span className="text-sm font-semibold">Mini Games</span>
          </span>
          <span className="hidden text-xs text-indigo-100 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
            →
          </span>
        </Link>

        <Link
          href="/profile"
          className="group flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-200" />
            <span className="text-sm font-semibold">Hồ sơ</span>
          </span>
          <span className="hidden text-xs text-indigo-100 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
            →
          </span>
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-indigo-100">
            Completed
          </p>
          <p className="mt-2 text-xl font-bold">
            {completed}/{total}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-indigo-100">
            Streak
          </p>
          <p className="mt-2 text-xl font-bold">12 days</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs uppercase tracking-wide text-indigo-100">XP</p>
          <p className="mt-2 text-xl font-bold">830</p>
        </div>
      </div>
    </div>
  );
}
