import {
  LessonDto,
  CreateUpdateLessonDto,
  LessonType,
} from "@/features/admin/lessons/types/lesson";

let mockLessons: LessonDto[] = [
  {
    id: "les-001",
    title: "Bài 1: Từ vựng đại từ xưng hô",
    lessonType: LessonType.Vocabulary,
    orderIndex: 1,
    chapterId: "chap-001",
  },
  {
    id: "les-002",
    title: "Bài 2: Ngữ pháp động từ To Be",
    lessonType: LessonType.Grammar,
    orderIndex: 2,
    chapterId: "chap-001",
  },
];

export const lessonService = {
  getByChapterId: async (chapterId: string): Promise<LessonDto[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return mockLessons
      .filter((les) => les.chapterId === chapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getList: async (): Promise<LessonDto[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return [...mockLessons].sort((a, b) => a.orderIndex - b.orderIndex);
  },

  create: async (input: CreateUpdateLessonDto): Promise<LessonDto> => {
    await new Promise((res) => setTimeout(res, 300));
    const newLes: LessonDto = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `les-${Date.now()}`,
      ...input,
    };
    mockLessons.push(newLes);
    return newLes;
  },

  update: async (
    id: string,
    input: CreateUpdateLessonDto,
  ): Promise<LessonDto> => {
    await new Promise((res) => setTimeout(res, 300));
    mockLessons = mockLessons.map((item) =>
      item.id === id ? { ...item, ...input } : item,
    );
    return { id, ...input };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 300));
    mockLessons = mockLessons.filter((item) => item.id !== id);
  },
};
