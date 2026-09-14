export interface WritingErrorDto {
  errorType: string; // "Grammar" | "Vocabulary" | "Structure" ...
  originalText: string;
  suggestion: string;
}

export interface AiFeedbackDto {
  isCorrect: boolean;
  score: number;
  errors: WritingErrorDto[];
  explanation: string;
  suggestedCorrection: string;
}

export interface UserWritingDto {
  id: string; // Guid
  topicId: string; // Guid
  topicTitle?: string; // Tên đề bài (Map thêm từ BE hoặc Filter)
  userName?: string; // Tên học viên (ABP Identity User)
  userContent: string;
  feedback?: AiFeedbackDto | null;
  creationTime: string; // DateTime
}
