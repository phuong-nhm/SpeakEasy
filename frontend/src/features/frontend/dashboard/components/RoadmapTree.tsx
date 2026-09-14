"use client";

import { ChapterDto } from "../types/roadmap";
import { LessonNode } from "./LessonNode";

interface RoadmapTreeProps {
  chapter: ChapterDto;
}

export function RoadmapTree({ chapter }: RoadmapTreeProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Chapter roadmap
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {chapter.title}
          </h2>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
          {chapter.lessons.length} lessons
        </div>
      </div>

      <div className="relative space-y-5 before:absolute before:bottom-2 before:left-7 before:top-2 before:w-px before:bg-gradient-to-b before:from-indigo-200 before:via-emerald-200 before:to-slate-200">
        {chapter.lessons.map((lesson, index) => (
          <div key={lesson.id} className="relative pl-7">
            <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-white bg-indigo-500 shadow-md shadow-indigo-200" />
            <LessonNode lesson={lesson} alignRight={index % 2 === 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
