import { apiClient } from "@/lib/apiClient";
import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";

type GetListForAdminParams = {
  userId?: string;
  topicId?: string;
  skipCount?: number;
  maxResultCount?: number;
};

type AdminWritingListResult = {
  totalCount: number;
  items: UserWritingDto[];
};

type PagedResponse<T> = {
  totalCount?: number;
  items?: T[];
};

const normalizeListResponse = <T>(
  response: PagedResponse<T> | T[] | null | undefined,
): { totalCount: number; items: T[] } => {
  if (Array.isArray(response)) {
    return { totalCount: response.length, items: response };
  }

  if (!response) {
    return { totalCount: 0, items: [] };
  }

  return {
    totalCount: response.totalCount ?? response.items?.length ?? 0,
    items: response.items ?? [],
  };
};

export const userWritingService = {
  getListForAdmin: async (
    params: GetListForAdminParams = {},
  ): Promise<AdminWritingListResult> => {
    const query = new URLSearchParams();

    if (params.userId) query.set("userId", params.userId);
    if (params.topicId) query.set("topicId", params.topicId);
    if (params.skipCount !== undefined) {
      query.set("skipCount", String(params.skipCount));
    }
    if (params.maxResultCount !== undefined) {
      query.set("maxResultCount", String(params.maxResultCount));
    }

    const endpoint = `/api/app/user-writing/for-admin${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await apiClient<
      PagedResponse<UserWritingDto> | UserWritingDto[]
    >(endpoint);

    return normalizeListResponse(response);
  },

  getDetailForAdmin: async (
    writingId: string,
  ): Promise<UserWritingDto | undefined> => {
    const response = await apiClient<UserWritingDto | null>(
      `/api/app/user-writing/detail-for-admin/${encodeURIComponent(writingId)}`,
    );

    return response ?? undefined;
  },

  deleteWriting: async (writingId: string): Promise<boolean> => {
    await apiClient<void>(`/api/app/user-writing/${writingId}`, {
      method: "DELETE",
    });

    return true;
  },
};

export default userWritingService;
