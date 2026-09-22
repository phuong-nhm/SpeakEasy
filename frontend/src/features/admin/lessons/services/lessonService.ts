import {
  LessonDto,
  CreateUpdateLessonDto,
  LessonType,
} from "@/features/admin/lessons/types/lesson";
import { VocabularyDto } from "@/features/admin/vocabularies/types/vocabulary";
import { SentenceExerciseDto } from "@/features/admin/sentence-exercises/types/sentence-exercise";
import { apiClient } from "@/lib/apiClient"; // đường dẫn tới apiClient của bạn

// Nếu cần thêm interface cho LessonContentDto thì định nghĩa ở đây hoặc file types
export interface LessonContentDto {
  lesson: LessonDto;
  vocabularies: VocabularyDto[]; // Thay bằng VocabularyDto chuẩn nếu có
  sentences: SentenceExerciseDto[]; // Thay bằng SentenceExerciseDto chuẩn nếu có
}

export const lessonService = {
  // Lấy danh sách bài học theo ChapterId
  getByChapterId: async (chapterId: string): Promise<LessonDto[]> => {
    return apiClient<LessonDto[]>(`/api/app/lesson/by-chapter/${chapterId}`);
  },

  // Lấy chi tiết một bài học kèm nội dung (Vocab, Sentences)
  getLessonContent: async (lessonId: string): Promise<LessonContentDto> => {
    return apiClient<LessonContentDto>(
      `/api/app/lesson/lesson-content/${lessonId}`,
    );
  },

  // Lấy chi tiết một bài học theo ID
  getById: async (id: string): Promise<LessonDto> => {
    return apiClient<LessonDto>(`/api/app/lesson/${id}`);
  },

  // Tạo mới bài học
  create: async (input: CreateUpdateLessonDto): Promise<LessonDto> => {
    return apiClient<LessonDto>("/api/app/lesson", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  // Cập nhật bài học
  update: async (
    id: string,
    input: CreateUpdateLessonDto,
  ): Promise<LessonDto> => {
    return apiClient<LessonDto>(`/api/app/lesson/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  // Xoá bài học
  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/api/app/lesson/${id}`, {
      method: "DELETE",
    });
  },
};
