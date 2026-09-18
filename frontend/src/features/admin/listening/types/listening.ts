export enum ListeningQuestionType {
  MultipleChoice = 0,
  Essay = 1,
}

export type ListeningQuestionOptionKey = "A" | "B" | "C" | "D";

export interface ListeningQuestionDto {
  id: string;
  passageId: string;
  questionType: ListeningQuestionType;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOptionKey?: string;
  orderIndex: number;
}

export interface CreateUpdateListeningQuestionDto {
  questionType: ListeningQuestionType;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOptionKey?: string;
  orderIndex: number;
}

export interface ListeningPassageDto {
  id: string;
  chapterId: string;
  title: string;
  transcript: string;
  audioUrl?: string;
  questions: ListeningQuestionDto[];
}

export interface CreateUpdateListeningPassageDto {
  chapterId: string;
  title: string;
  transcript: string;
  audioUrl?: string;
  questions: CreateUpdateListeningQuestionDto[];
}

export const ListeningQuestionTypeLabels: Record<
  ListeningQuestionType,
  { label: string; color: string }
> = {
  [ListeningQuestionType.MultipleChoice]: {
    label: "Multiple Choice",
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  [ListeningQuestionType.Essay]: {
    label: "Essay",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
};
