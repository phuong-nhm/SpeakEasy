// ===== DUE REVIEWS (theo Lesson) =====
export interface DueReviewItemDto {
  lessonId: string;
  lessonTitle: string;
  nextReviewTime: string;
}

export interface DueReviewSummaryDto {
  count: number;
  items: DueReviewItemDto[];
}

// ===== COMPLETE REVIEW =====
export interface CompleteReviewRequest {
  lessonId: string;
  isCorrect: boolean;
}
