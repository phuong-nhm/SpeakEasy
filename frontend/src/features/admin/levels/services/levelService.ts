import {
  LevelDto,
  CreateUpdateLevelDto,
} from "@/features/admin/levels/types/level";

let mockLevels: LevelDto[] = [
  {
    id: "a1b2c3d4-0001-0000-0000-000000000001",
    name: "Level A1 - Sơ cấp",
    description:
      "Dành cho người mới bắt đầu, làm quen với từ vựng và câu cơ bản.",
  },
  {
    id: "a1b2c3d4-0001-0000-0000-000000000002",
    name: "Level B1 - Trung cấp",
    description:
      "Nâng cao khả năng giao tiếp, ngữ pháp phức hợp và viết đoạn văn AI.",
  },
];

export const levelService = {
  getList: async (): Promise<LevelDto[]> => {
    await new Promise((res) => setTimeout(res, 400));
    return [...mockLevels];
  },

  create: async (input: CreateUpdateLevelDto): Promise<LevelDto> => {
    await new Promise((res) => setTimeout(res, 400));
    const newLevel: LevelDto = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `mock-guid-${Date.now()}`,
      ...input,
    };
    mockLevels.unshift(newLevel);
    return newLevel;
  },

  update: async (
    id: string,
    input: CreateUpdateLevelDto,
  ): Promise<LevelDto> => {
    await new Promise((res) => setTimeout(res, 400));
    mockLevels = mockLevels.map((item) =>
      item.id === id ? { ...item, ...input } : item,
    );
    return { id, ...input };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 400));
    mockLevels = mockLevels.filter((item) => item.id !== id);
  },
};

export default levelService;
