export type LessonStatus = "completed" | "unlocked" | "locked";

// ===== RAW DTO (khớp backend) =====
export interface LevelDto {
  id: string;
  name: string;
  description?: string;
}

export interface ChapterDto {
  id: string;
  levelId: string;
  title: string;
  orderIndex: number;
}

export interface UserProgressDto {
  id: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface PagedResultDto<T> {
  totalCount: number;
  items: T[];
}

// ===== VIEW MODEL (FE tự ráp + tính unlock, dùng để render UI) =====
export interface RoadmapLessonView {
  id: string;
  chapterId: string;
  title: string;
  orderIndex: number;
  lessonType: number;
  status: LessonStatus;
}

export interface RoadmapChapterView {
  id: string;
  levelId: string;
  title: string;
  orderIndex: number;
  lessons: RoadmapLessonView[];
  status: LessonStatus;
}
