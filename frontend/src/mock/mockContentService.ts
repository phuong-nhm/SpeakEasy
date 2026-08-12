import {
  ChapterDto,
  CreateUpdateChapterDto,
  LessonDto,
  CreateUpdateLessonDto,
  LessonType,
} from '@/types/admin';

// Mock Data Chapters
let mockChapters: ChapterDto[] = [
  {
    id: 'chap-001',
    title: 'Chapter 1: Chào hỏi & Giới thiệu bản thân',
    orderIndex: 1,
    levelId: 'a1b2c3d4-0001-0000-0000-000000000001', // Thuộc Level A1
  },
  {
    id: 'chap-002',
    title: 'Chapter 2: Mua sắm & Hỏi giá',
    orderIndex: 2,
    levelId: 'a1b2c3d4-0001-0000-0000-000000000001', // Thuộc Level A1
  },
];

// Mock Data Lessons
let mockLessons: LessonDto[] = [
  {
    id: 'les-001',
    title: 'Bài 1: Từ vựng đại từ xưng hô',
    lessonType: LessonType.Vocabulary,
    orderIndex: 1,
    chapterId: 'chap-001',
  },
  {
    id: 'les-002',
    title: 'Bài 2: Ngữ pháp động từ To Be',
    lessonType: LessonType.Grammar,
    orderIndex: 2,
    chapterId: 'chap-001',
  },
];

// API Service cho Chapter
export const chapterService = {
  // GET /api/app/chapter?levelId=...
  getByLevelId: async (levelId: string): Promise<ChapterDto[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return mockChapters.filter((chap) => chap.levelId === levelId);
  },

  create: async (input: CreateUpdateChapterDto): Promise<ChapterDto> => {
    await new Promise((res) => setTimeout(res, 300));
    const newChap: ChapterDto = { id: crypto.randomUUID(), ...input };
    mockChapters.push(newChap);
    return newChap;
  },

  update: async (id: string, input: CreateUpdateChapterDto): Promise<ChapterDto> => {
    await new Promise((res) => setTimeout(res, 300));
    mockChapters = mockChapters.map((item) => (item.id === id ? { ...item, ...input } : item));
    return { id, ...input };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 300));
    mockChapters = mockChapters.filter((item) => item.id !== id);
  },
};

// API Service cho Lesson
export const lessonService = {
  // GET /api/app/lesson?chapterId=...
  getByChapterId: async (chapterId: string): Promise<LessonDto[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return mockLessons.filter((les) => les.chapterId === chapterId);
  },

  create: async (input: CreateUpdateLessonDto): Promise<LessonDto> => {
    await new Promise((res) => setTimeout(res, 300));
    const newLes: LessonDto = { id: crypto.randomUUID(), ...input };
    mockLessons.push(newLes);
    return newLes;
  },

  update: async (id: string, input: CreateUpdateLessonDto): Promise<LessonDto> => {
    await new Promise((res) => setTimeout(res, 300));
    mockLessons = mockLessons.map((item) => (item.id === id ? { ...item, ...input } : item));
    return { id, ...input };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 300));
    mockLessons = mockLessons.filter((item) => item.id !== id);
  },
};