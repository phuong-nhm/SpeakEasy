import { apiClient } from "@/lib/apiClient";
import {
  CreateIdentityUserDto,
  IdentityRoleLookupDto,
  IdentityUserDto,
  UpdateIdentityUserDto,
} from "@/features/admin/users/types/users";

type GetListUserParams = {
  filterText?: string;
  roleName?: string;
  skipCount?: number;
  maxResultCount?: number;
};

type GetListUserResult = {
  totalCount: number;
  items: IdentityUserDto[];
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

export const userService = {
  getList: async (
    params: GetListUserParams = {},
  ): Promise<GetListUserResult> => {
    const query = new URLSearchParams();

    if (params.filterText) query.set("filter", params.filterText);
    if (params.roleName) query.set("roleName", params.roleName);
    if (params.skipCount !== undefined) {
      query.set("skipCount", String(params.skipCount));
    }
    if (params.maxResultCount !== undefined) {
      query.set("maxResultCount", String(params.maxResultCount));
    }

    const response = await apiClient<
      PagedResponse<IdentityUserDto> | IdentityUserDto[]
    >(`/api/identity/users${query.toString() ? `?${query.toString()}` : ""}`);

    const normalized = normalizeListResponse(response);
    return {
      totalCount: normalized.totalCount,
      items: normalized.items,
    };
  },

  getById: async (id: string): Promise<IdentityUserDto | undefined> => {
    return apiClient<IdentityUserDto>(`/api/identity/users/${id}`);
  },

  create: async (data: CreateIdentityUserDto): Promise<IdentityUserDto> => {
    return apiClient<IdentityUserDto>("/api/identity/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateIdentityUserDto,
  ): Promise<IdentityUserDto> => {
    return apiClient<IdentityUserDto>(`/api/identity/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiClient<void>(`/api/identity/users/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  getRoles: async (): Promise<IdentityRoleLookupDto[]> => {
    const response = await apiClient<
      PagedResponse<IdentityRoleLookupDto> | IdentityRoleLookupDto[]
    >(`/api/identity/roles?maxResultCount=1000`);

    const normalized = normalizeListResponse(response);
    return normalized.items;
  },
};

export default userService;
