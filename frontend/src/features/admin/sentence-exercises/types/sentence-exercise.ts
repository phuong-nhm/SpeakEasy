// 1. Enums chuẩn theo C# Backend
export enum SectionType {
  Vocabulary = 0,
  Grammar = 1,
  Review = 2,
}

export enum ExerciseType {
  WordOrder = 0, // Ghép câu từ các từ xáo trộn
  FillInBlank = 1, // Điền từ khuyết trong câu
  AnswerQuestion = 2, // Trả lời 1 câu hỏi bằng câu hoàn chỉnh
  TranslateFromVietnamese = 3, // Ghép câu tiếng Anh từ gợi ý câu tiếng Việt
  ListenChoose = 4, // Nghe rồi chọn đúng câu vừa nghe
}

// 2. Interfaces DTOs
export interface SentenceExerciseDto {
  id: string;
  lessonId: string;
  sectionType: SectionType;
  correctSentence: string; // Dùng cho Admin CMS
  audioUrl?: string;
  exerciseType: ExerciseType;
  shuffledWords?: string[];
  displaySentence?: string;
  blankIndex?: number;
  promptText?: string;
  vietnameseTranslation?: string;
  distractorSentence?: string;
  dialogueGroupId?: string;
  orderInGroup?: number;
  listenOptions?: string[];
}

export interface CreateUpdateSentenceExerciseDto {
  lessonId: string;
  sectionType: SectionType;
  correctSentence: string;
  audioUrl?: string;
  exerciseType: ExerciseType;
  promptText?: string;
  vietnameseTranslation?: string;
  distractorSentence?: string;
  dialogueGroupId?: string;
  orderInGroup?: number;
}

// 3. Option Interfaces cho Cascading Filter
export interface FilterOption {
  id: string;
  title: string;
}

// 4. UI UI Mapping Badge Labels
export const SectionTypeLabels: Record<
  SectionType,
  { label: string; color: string }
> = {
  [SectionType.Vocabulary]: {
    label: "Vocabulary",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  [SectionType.Grammar]: {
    label: "Grammar",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  [SectionType.Review]: {
    label: "Review",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export const ExerciseTypeLabels: Record<
  ExerciseType,
  { label: string; color: string }
> = {
  [ExerciseType.WordOrder]: {
    label: "Xếp từ",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [ExerciseType.FillInBlank]: {
    label: "Điền chỗ trống",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  [ExerciseType.AnswerQuestion]: {
    label: "Trả lời câu hỏi",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  [ExerciseType.TranslateFromVietnamese]: {
    label: "Dịch Việt - Anh",
    color: "bg-teal-100 text-teal-700 border-teal-200",
  },
  [ExerciseType.ListenChoose]: {
    label: "Nghe - chọn câu",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
};
