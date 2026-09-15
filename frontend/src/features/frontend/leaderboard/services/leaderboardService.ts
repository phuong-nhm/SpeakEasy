import { LeaderboardResultDto, LeaderboardScope } from "../types/leaderboard";
import {
  mockWeeklyLeaderboard,
  mockFriendsLeaderboard,
} from "../mock/mockLeaderboardData";

const USE_MOCK = true; // đổi thành false khi backend sẵn sàng
const API_BASE = "/api/app";

export async function getLeaderboard(
  scope: LeaderboardScope,
): Promise<LeaderboardResultDto> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            scope === "weekly" ? mockWeeklyLeaderboard : mockFriendsLeaderboard,
          ),
        300,
      );
    });
  }

  const res = await fetch(`${API_BASE}/leaderboard/${scope}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { scope, division: "Bronze", entries: [] };
  }
  return (await res.json()) as LeaderboardResultDto;
}
