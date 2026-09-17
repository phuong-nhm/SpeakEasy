export enum ExerciseType {
  WordOrder = "WordOrder",
  FillInBlank = "FillInBlank",
  AnswerQuestion = "AnswerQuestion",
  TranslateFromVietnamese = "TranslateFromVietnamese",
}

export interface SentenceExerciseDto {
  id: string;
  lessonId: string;
  sectionType: number;
  correctSentence: string;
  audioUrl?: string;
  exerciseType: string;
  promptText?: string;
  vietnameseTranslation?: string;
}

export interface VocabularyDto {
  id: string;
  lessonId: string;
  word: string;
  meaning: string;
  imageUrl?: string;
  audioUrl?: string;
  distractor?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface LessonQuestion extends SentenceExerciseDto {
  prompt: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  wordBank?: string[];
  sourceText?: string;
  blankSentence?: string;
  matchingPairs?: MatchingPair[];
}

export interface LessonDto {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xpReward: number;
  totalHearts: number;
  estimatedMinutes: number;
  questions: LessonQuestion[];
  vocabulary: VocabularyDto[];
  grammarTopic?: string; // Chủ điểm ngữ pháp, hiển thị đầu Part 2
}

export interface LessonSubmitRequest {
  lessonId: string;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  heartsLeft: number;
  accuracyPercent: number;
  elapsedSeconds: number;
}

export interface LessonSubmitResponse {
  success: boolean;
  xpEarned: number;
  accuracyPercent: number;
  lessonsCompleted: number;
  streakUpdated: boolean;
}
