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

type UserRoleResponse =
  | Array<{ id?: string; name?: string } | string>
  | {
      items?: Array<{ id?: string; name?: string } | string>;
      roleNames?: string[];
      roles?: string[];
    }
  | null
  | undefined;

const normalizeUser = (
  user: Partial<IdentityUserDto> | null | undefined,
): IdentityUserDto => ({
  id: user?.id ?? "",
  userName: user?.userName ?? "",
  name: user?.name ?? "",
  surname: user?.surname ?? "",
  email: user?.email ?? "",
  phoneNumber: user?.phoneNumber ?? "",
  isActive: user?.isActive ?? false,
  lockoutEnabled: user?.lockoutEnabled ?? false,
  creationTime: user?.creationTime ?? "",
  concurrencyStamp: user?.concurrencyStamp ?? "",
  roleNames: Array.isArray(user?.roleNames) ? user.roleNames : [],
});

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
  getUserRoleNames: async (userId: string): Promise<string[]> => {
    if (!userId) {
      return [];
    }

    try {
      const response = await apiClient<UserRoleResponse>(
        `/api/identity/users/${userId}/roles`,
      );

      if (!response) {
        return [];
      }

      if (Array.isArray(response)) {
        return response
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter((name): name is string => Boolean(name));
      }

      if (Array.isArray(response.items)) {
        return response.items
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter((name): name is string => Boolean(name));
      }

      if (Array.isArray(response.roleNames)) {
        return response.roleNames;
      }

      if (Array.isArray(response.roles)) {
        return response.roles;
      }

      return [];
    } catch {
      return [];
    }
  },

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
    const users = (normalized.items as Array<Partial<IdentityUserDto>>).map(
      normalizeUser,
    );

    const enrichedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        roleNames: user.id ? await userService.getUserRoleNames(user.id) : [],
      })),
    );

    return {
      totalCount: normalized.totalCount,
      items: enrichedUsers,
    };
  },

  getById: async (id: string): Promise<IdentityUserDto | undefined> => {
    const user = await apiClient<IdentityUserDto | undefined>(
      `/api/identity/users/${id}`,
    );
    return user ? normalizeUser(user) : undefined;
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
    const { roleNames, ...profilePayload } = data;

    void roleNames;

    return apiClient<IdentityUserDto>(`/api/identity/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(profilePayload),
    });
  },

  updateRoles: async (
    id: string,
    roleNames: string[],
  ): Promise<IdentityUserDto> => {
    return apiClient<IdentityUserDto>(`/api/identity/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roleNames }),
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
