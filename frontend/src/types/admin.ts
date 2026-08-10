// DTO tương ứng với ABP LevelDto
export interface LevelDto {
  id: string; // Guid
  name: string;
  description: string;
}

export interface CreateUpdateLevelDto {
  name: string;
  description: string;
}
export enum LessonType {
  Vocabulary = 0,    // Bài học Từ vựng
  Grammar = 1,       // Bài học Ngữ pháp (Xếp câu)
  Combined = 2,      // Bài học Tổng hợp
}

// DTO Chapter
export interface ChapterDto {
  id: string; // Guid
  title: string;
  orderIndex: number;
  levelId: string;
}

export interface CreateUpdateChapterDto {
  title: string;
  orderIndex: number;
  levelId: string;
}

// DTO Lesson
export interface LessonDto {
  id: string; // Guid
  title: string;
  lessonType: LessonType;
  orderIndex: number;
  chapterId: string;
}

export interface CreateUpdateLessonDto {
  title: string;
  lessonType: LessonType;
  orderIndex: number;
  chapterId: string;
}