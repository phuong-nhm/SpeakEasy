export type LessonStatus = "completed" | "unlocked" | "locked";

export interface LessonDto {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  totalQuestions: number;
}

export interface ChapterDto {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonDto[];
}

export interface LevelDto {
  id: string;
  title: string;
  levelNumber: number;
  chapters: ChapterDto[];
}
