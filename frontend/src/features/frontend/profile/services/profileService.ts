import {
  UserProfileDto,
  AchievementDto,
  LearningStatsDto,
  LearningStatsPeriod,
} from "../types/profile";
import {
  mockUserProfile,
  mockAchievements,
  mockLearningStatsWeekly,
  mockLearningStatsMonthly,
} from "../mock/mockProfileData";

const USE_MOCK = true; // đổi thành false khi backend sẵn sàng
const API_BASE = "/api/app";

export async function getUserProfile(): Promise<UserProfileDto | null> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUserProfile), 300);
    });
  }

  const res = await fetch(`${API_BASE}/user-profile/me`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as UserProfileDto;
}

export async function getUserAchievements(): Promise<AchievementDto[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAchievements), 300);
    });
  }

  const res = await fetch(`${API_BASE}/achievement/user-achievements`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as
    | { items: AchievementDto[] }
    | AchievementDto[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getLearningStats(
  period: LearningStatsPeriod,
): Promise<LearningStatsDto> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            period === "weekly"
              ? mockLearningStatsWeekly
              : mockLearningStatsMonthly,
          ),
        300,
      );
    });
  }

  const res = await fetch(
    `${API_BASE}/user-profile/learning-stats?period=${period}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return { period, entries: [] };
  return (await res.json()) as LearningStatsDto;
}
