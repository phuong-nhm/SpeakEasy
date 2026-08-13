import { LevelDto, CreateUpdateLevelDto } from '@/types/admin';

let mockLevels: LevelDto[] = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    name: 'Level A1 - Sơ cấp',
    description: 'Dành cho người mới bắt đầu, làm quen với từ vựng và câu cơ bản.',
  },
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000002',
    name: 'Level B1 - Trung cấp',
    description: 'Nâng cao khả năng giao tiếp, ngữ pháp phức hợp và viết đoạn văn AI.',
  },
];

export const levelService = {
  // GET /api/app/level
  getList: async (): Promise<LevelDto[]> => {
    await new Promise((res) => setTimeout(res, 400)); // Giả lập network delay
    return [...mockLevels];
  },

  // POST /api/app/level
  create: async (input: CreateUpdateLevelDto): Promise<LevelDto> => {
    await new Promise((res) => setTimeout(res, 400));
    const newLevel: LevelDto = {
      id: crypto.randomUUID(),
      ...input,
    };
    mockLevels.push(newLevel);
    return newLevel;
  },

  // PUT /api/app/level/{id}
  update: async (id: string, input: CreateUpdateLevelDto): Promise<LevelDto> => {
    await new Promise((res) => setTimeout(res, 400));
    mockLevels = mockLevels.map((item) =>
      item.id === id ? { ...item, ...input } : item
    );
    return { id, ...input };
  },

  // DELETE /api/app/level/{id}
  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 400));
    mockLevels = mockLevels.filter((item) => item.id !== id);
  },
};
export default levelService;