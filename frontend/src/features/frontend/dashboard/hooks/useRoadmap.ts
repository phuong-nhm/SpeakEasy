"use client";

import { useEffect, useState } from "react";

import { roadmapService } from "../services/roadmapService";
import { LevelDto } from "../types/roadmap";

export function useRoadmap() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await roadmapService.getRoadmapLevels();
        if (!isMounted) return;

        setLevels(data);
        const firstLevel = data[0];
        const firstChapter = firstLevel?.chapters[0];

        setSelectedLevelId(firstLevel?.id ?? null);
        setSelectedChapterId(firstChapter?.id ?? null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedLevel =
    levels.find((level) => level.id === selectedLevelId) ?? levels[0] ?? null;

  const selectedChapter =
    selectedLevel?.chapters.find(
      (chapter) => chapter.id === selectedChapterId,
    ) ??
    selectedLevel?.chapters[0] ??
    null;

  const handleSelectLevel = (levelId: string) => {
    const nextLevel = levels.find((level) => level.id === levelId);
    if (!nextLevel) return;

    setSelectedLevelId(levelId);
    setSelectedChapterId(nextLevel.chapters[0]?.id ?? null);
  };

  return {
    levels,
    selectedLevel,
    selectedChapter,
    loading,
    setSelectedLevelId: handleSelectLevel,
    setSelectedChapterId,
  };
}
