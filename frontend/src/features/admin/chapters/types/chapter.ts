// @/features/admin/chapters/types/chapter.ts

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
