"use client";

import { useRoadmap } from "../hooks/useRoadmap";
import { ChapterCard } from "./ChapterCard";
import { DailyQuestWidget } from "./DailyQuestWidget";
import { HeaderStats } from "./HeaderStats";
import { RoadmapTree } from "./RoadmapTree";

export function DashboardRoadmap() {
  const {
    levels,
    selectedLevel,
    selectedLevelId,
    chapters,
    selectedChapter,
    selectedChapterId,
    loading,
    loadingLevelDetail,
    error,
    setSelectedLevelId,
    setSelectedChapterId,
  } = useRoadmap();

  if (loading || !selectedLevel) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded-full bg-slate-200" />
          <div className="h-10 w-2/3 rounded-xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      </div>
    );
  }

  const selectedLevelIndex = levels.findIndex(
    (level) => level.id === selectedLevel.id,
  );

  const allLessons = chapters.flatMap((chapter) => chapter.lessons);
  const completedLessons = allLessons.filter(
    (lesson) => lesson.status === "completed",
  ).length;
  const totalLessons = allLessons.length;
  const progressPercent =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6">
      <HeaderStats
        title={selectedLevel.name}
        progress={progressPercent}
        completed={completedLessons}
        total={totalLessons}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Choose level
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Lộ trình</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {levels.map((level, index) => {
            const isActive = selectedLevelId === level.id;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setSelectedLevelId(level.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <div className="mt-1 text-sm font-bold">{level.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Chapters
          </p>
          {chapters.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Scroll to explore
            </span>
          )}
        </div>

        {loadingLevelDetail ? (
          <div className="grid gap-4 py-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <div
              className={`grid gap-4 ${
                chapters.length > 3
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "md:grid-cols-2"
              }`}
            >
              {chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  isSelected={selectedChapterId === chapter.id}
                  onClick={() => setSelectedChapterId(chapter.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedChapter && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <RoadmapTree chapter={selectedChapter} />
          <DailyQuestWidget />
        </div>
      )}
    </div>
  );
}
