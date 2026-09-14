// @/mock/mockContentService.ts

import {
  ChapterDto,
  CreateUpdateChapterDto,
} from "@/features/admin/chapters/types/chapter";

// Mock Data Chapters ban đầu
let mockChapters: ChapterDto[] = [
  {
    id: "chap-001",
    title: "Chapter 1: Chào hỏi & Giới thiệu bản thân",
    orderIndex: 1,
    levelId: "a1b2c3d4-0001-0000-0000-000000000001", // Thuộc Level A1
  },
  {
    id: "chap-002",
    title: "Chapter 2: Mua sắm & Hỏi giá",
    orderIndex: 2,
    levelId: "a1b2c3d4-0001-0000-0000-000000000001", // Thuộc Level A1
  },
];

export const chapterService = {
  // GET /api/app/chapter?levelId=...
  getByLevelId: async (levelId: string): Promise<ChapterDto[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return mockChapters
      .filter((chap) => chap.levelId === levelId)
      .sort((a, b) => a.orderIndex - b.orderIndex); // Sắp xếp theo orderIndex
  },

  // POST /api/app/chapter
  create: async (input: CreateUpdateChapterDto): Promise<ChapterDto> => {
    await new Promise((res) => setTimeout(res, 300));
    const newChap: ChapterDto = {
      id: crypto.randomUUID(),
      ...input,
    };
    mockChapters.push(newChap);
    return newChap;
  },

  // PUT /api/app/chapter/{id}
  update: async (
    id: string,
    input: CreateUpdateChapterDto,
  ): Promise<ChapterDto> => {
    await new Promise((res) => setTimeout(res, 300));
    const index = mockChapters.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockChapters[index] = { id, ...input };
    }
    return { id, ...input };
  },

  // DELETE /api/app/chapter/{id}
  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 300));
    mockChapters = mockChapters.filter((item) => item.id !== id);
  },
};
