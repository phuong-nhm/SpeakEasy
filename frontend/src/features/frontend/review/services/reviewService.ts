import {
  DueReviewItem,
  PagedResult,
  CompleteReviewRequest,
  CompleteReviewResponse,
} from "@/features/frontend/review/types/review";
import { mockDueReviews } from "@/features/frontend/review/mock/mockReviewData";

const USE_MOCK = true; // đổi thành false khi backend sẵn sàng
const API_BASE = "/api/app";

export async function getDueReviews(): Promise<DueReviewItem[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDueReviews), 300);
    });
  }

  const res = await fetch(`${API_BASE}/user-lesson-review/due-reviews`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as
    | PagedResult<DueReviewItem>
    | DueReviewItem[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function completeReview(
  payload: CompleteReviewRequest,
): Promise<CompleteReviewResponse | null> {
  if (USE_MOCK) {
    console.log("[mock] completeReview called with:", payload);
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            success: true,
            updatedCount: payload.ids.length,
            awardedXp: payload.ids.length * 5,
          }),
        200,
      );
    });
  }

  const res = await fetch(`${API_BASE}/user-lesson-review/complete-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as CompleteReviewResponse;
  } catch {
    return { success: true };
  }
}
