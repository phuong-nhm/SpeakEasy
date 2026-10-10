import { apiClient } from "@/lib/apiClient";
import { CompleteReviewRequest, DueReviewSummaryDto } from "../types/review";

export const reviewService = {
  initReview: async (lessonId: string): Promise<void> => {
    return apiClient<void>(
      `/api/app/user-lesson-review/init-review/${lessonId}`,
      { method: "POST" },
    );
  },

  getDueReviews: async (): Promise<DueReviewSummaryDto> => {
    return apiClient<DueReviewSummaryDto>(
      "/api/app/user-lesson-review/due-reviews",
      { method: "GET" },
    );
  },

  completeReview: async (input: CompleteReviewRequest): Promise<void> => {
    return apiClient<void>("/api/app/user-lesson-review/complete-review", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
