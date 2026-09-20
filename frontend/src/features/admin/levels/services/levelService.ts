import { apiClient } from "@/lib/apiClient";
import {
  LevelDto,
  CreateUpdateLevelDto,
} from "@/features/admin/levels/types/level";

interface PagedResultDto<T> {
  items?: T[];
  totalCount?: number;
}

const normalizeListResult = <T>(
  response: PagedResultDto<T> | T[] | null | undefined,
): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response) {
    return [];
  }

  return Array.isArray(response.items) ? response.items : [];
};

export const levelService = {
  getList: async (): Promise<LevelDto[]> => {
    // CrudAppService mặc định phân trang, truyền maxResultCount lớn để lấy hết
    const result = await apiClient<PagedResultDto<LevelDto> | LevelDto[]>(
      "/api/app/level?maxResultCount=1000",
    );
    return normalizeListResult(result);
  },

  create: async (input: CreateUpdateLevelDto): Promise<LevelDto> => {
    return apiClient<LevelDto>("/api/app/level", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update: async (
    id: string,
    input: CreateUpdateLevelDto,
  ): Promise<LevelDto> => {
    return apiClient<LevelDto>(`/api/app/level/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/level/${id}`, {
      method: "DELETE",
    });
  },
};

export default levelService;
