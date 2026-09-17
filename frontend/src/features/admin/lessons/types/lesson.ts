export enum LessonType {
  Vocabulary = 0, // Bài học Từ vựng
  Grammar = 1, // Bài học Ngữ pháp (Xếp câu)
  Combined = 2, // Bài học Tổng hợp
}
export interface LessonDto {
  id: string; // Guid
  title: string;
  lessonType: LessonType;
  orderIndex: number;
  chapterId: string;
  grammarTopic?: string; // Chủ điểm ngữ pháp, hiển thị đầu Part 2 bên Client
}

export interface CreateUpdateLessonDto {
  title: string;
  lessonType: LessonType;
  orderIndex: number;
  chapterId: string;
  grammarTopic?: string;
}
