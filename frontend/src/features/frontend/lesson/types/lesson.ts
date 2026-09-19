export enum ExerciseType {
  WordOrder = "WordOrder",
  FillInBlank = "FillInBlank",
  AnswerQuestion = "AnswerQuestion",
  TranslateFromVietnamese = "TranslateFromVietnamese",
  ListenChoose = "ListenChoose",
}

export type ListeningOptionKey = "A" | "B" | "C" | "D";

export interface AiFeedbackDto {
  band?: string;
  score?: number;
  errors?: {
    sentence: string;
    issue: string;
    suggestion: string;
  }[];
  suggestion?: string;
  improvedText?: string;
}

export interface SentenceExerciseDto {
  id: string;
  lessonId: string;
  sectionType: number;
  correctSentence: string;
  audioUrl?: string;
  exerciseType: string;
  promptText?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: string;
  wordBank?: string[];
  vietnameseTranslation?: string;
  dialogueGroupId?: string;
  orderInGroup?: number;
  listenOptions?: string[];
  shuffledWords?: string[];
}

export interface ListeningPassageQuestionDto {
  id: string;
  questionType: "MultipleChoice" | "Essay";
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  orderIndex: number;
}

export interface ListeningPassageClientDto {
  title: string;
  audioUrl: string;
  questions: ListeningPassageQuestionDto[];
}

export interface SubmitListeningMultipleChoiceRequest {
  questionId: string;
  selectedOptionKey: ListeningOptionKey;
}

export interface SubmitListeningMultipleChoiceResponse {
  isCorrect: boolean;
  correctOptionKey: ListeningOptionKey;
}

export interface SubmitListeningEssayRequest {
  questionId: string;
  userContent: string;
}

export interface SubmitListeningEssayResponse {
  aiFeedback: AiFeedbackDto;
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
