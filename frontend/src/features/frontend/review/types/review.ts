export interface DueReviewItem {
  // Unique identifier for this review entry (vocabulary or sentence exercise)
  id: string;

  // Primary display fields
  word?: string; // short token e.g. a word or phrase
  meaning?: string; // primary meaning / gloss
  exampleSentence?: string; // optional example usage

  // Media / UX helpers
  audioUrl?: string;
  imageUrl?: string;

  // Additional review metadata returned by backend
  distractors?: string[]; // optional distractor values for quiz generation
  lessonId?: string;
  lessonTitle?: string;

  // Spaced-repetition fields
  nextReviewTime?: string; // ISO datetime
  currentIntervalStage?: number; // e.g., repetition count or stage index
  intervalDays?: number; // length of current interval in days
  easeFactor?: number; // e.g., SM-2 ease factor

  // Cross-reference to vocabulary entity if applicable
  vocabId?: string | number;

  // Optional generic metadata bag coming from server
  metadata?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
}

export interface MatchingPairDto {
  id: string;
  left: string;
  right: string;
  // optional linkage back to vocabulary items
  leftId?: string | number;
  rightId?: string | number;
  vocabId?: string | number;

  // optional media fields
  leftAudioUrl?: string;
  rightAudioUrl?: string;
  leftImageUrl?: string;
  rightImageUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount?: number;
}

// Server responses / requests for review flows
export interface DueReviewsResponse extends PagedResult<DueReviewItem> {}

export interface CompleteReviewRequest {
  ids: Array<string | number>;
  // optional context such as duration, score, or source (game/flashcard)
  context?: {
    source?: string;
    durationMs?: number;
    score?: number;
  };
}

export interface CompleteReviewResponse {
  success: boolean;
  updatedCount?: number;
  awardedXp?: number;
}

export interface MatchingGameDataResponse {
  items: MatchingPairDto[];
  timeLimitSeconds?: number;
  recommendedXp?: number;
}
