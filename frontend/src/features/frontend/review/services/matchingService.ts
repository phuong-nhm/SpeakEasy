import { MatchingPairDto } from "@/features/frontend/review/types/review";
import { mockMatchingPairs } from "@/features/frontend/review/mock/mockReviewData";

const USE_MOCK = true; // đổi thành false khi backend sẵn sàng
const API_BASE = "/api/app";

export async function getMatchingData(): Promise<MatchingPairDto[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMatchingPairs), 300);
    });
  }

  const res = await fetch(`${API_BASE}/matching-game/data`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as
    | { items: MatchingPairDto[] }
    | MatchingPairDto[];
  if (Array.isArray(data)) return data as MatchingPairDto[];
  return data.items ?? [];
}
