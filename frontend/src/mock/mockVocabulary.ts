import { VocabularyDto, CreateUpdateVocabularyDto } from '@/types/admin';

let mockVocabularies: (VocabularyDto & { distractor: string })[] = [
  {
    id: 'vocab-1',
    lessonId: 'les-1',
    word: 'Hello',
    meaning: 'Xin chào',
    distractor: 'Tạm biệt',
    imageUrl: 'https://placehold.co/150',
    audioUrl: 'https://www.w3schools.com/html/horse.mp3',
  },
  {
    id: 'vocab-2',
    lessonId: 'les-1',
    word: 'Apple',
    meaning: 'Quả táo',
    distractor: 'Quả cam',
    imageUrl: 'https://placehold.co/150',
    audioUrl: '',
  },
];

export const vocabularyService = {
  getByLessonId: async (lessonId: string): Promise<(VocabularyDto & { distractor: string })[]> => {
    await new Promise((res) => setTimeout(res, 300));
    return mockVocabularies.filter((v) => v.lessonId === lessonId);
  },

  create: async (data: CreateUpdateVocabularyDto) => {
    await new Promise((res) => setTimeout(res, 300));
    const newItem = { id: `vocab-${Date.now()}`, ...data };
    mockVocabularies.push(newItem);
    return newItem;
  },

  update: async (id: string, data: CreateUpdateVocabularyDto) => {
    await new Promise((res) => setTimeout(res, 300));
    mockVocabularies = mockVocabularies.map((v) => (v.id === id ? { ...v, ...data } : v));
    return { id, ...data };
  },

  delete: async (id: string) => {
    await new Promise((res) => setTimeout(res, 300));
    mockVocabularies = mockVocabularies.filter((v) => v.id !== id);
    return true;
  },

  createMany: async (items: CreateUpdateVocabularyDto[]) => {
    await new Promise((res) => setTimeout(res, 500));
    const createdItems = items.map((item, index) => ({
      id: `vocab-batch-${Date.now()}-${index}`,
      ...item,
    }));
    mockVocabularies.push(...createdItems);
    return createdItems;
  },
};
export default vocabularyService;