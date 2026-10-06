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

type GetUserRoleNamesOptions = {
  forceRefresh?: boolean;
};

const userRoleCache = new Map<string, string[]>();
let rolesLookupCache: IdentityRoleLookupDto[] | null = null;

const cloneRoleNames = (roleNames?: string[]) => [...(roleNames ?? [])];

const setCachedUserRoleNames = (userId: string, roleNames?: string[]) => {
  if (!userId) {
    return;
  }

  userRoleCache.set(userId, cloneRoleNames(roleNames));
};

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
  roleNames: Array.isArray(user?.roleNames) ? user.roleNames : undefined,
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
  getUserRoleNames: async (
    userId: string,
    options: GetUserRoleNamesOptions = {},
  ): Promise<string[]> => {
    if (!userId) {
      return [];
    }

    if (!options.forceRefresh) {
      const cachedRoleNames = userRoleCache.get(userId);
      if (cachedRoleNames) {
        return cloneRoleNames(cachedRoleNames);
      }
    }

    try {
      const response = await apiClient<UserRoleResponse>(
        `/api/identity/users/${userId}/roles`,
      );

      if (!response) {
        return [];
      }

      let roleNames: string[] = [];

      if (Array.isArray(response)) {
        roleNames = response
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter((name): name is string => Boolean(name));
        setCachedUserRoleNames(userId, roleNames);
        return roleNames;
      }

      if (Array.isArray(response.items)) {
        roleNames = response.items
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter((name): name is string => Boolean(name));
        setCachedUserRoleNames(userId, roleNames);
        return roleNames;
      }

      if (Array.isArray(response.roleNames)) {
        roleNames = cloneRoleNames(response.roleNames);
        setCachedUserRoleNames(userId, roleNames);
        return roleNames;
      }

      if (Array.isArray(response.roles)) {
        roleNames = cloneRoleNames(response.roles);
        setCachedUserRoleNames(userId, roleNames);
        return roleNames;
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

    const queryString = query.toString() ? `?${query.toString()}` : "";

    const candidateEndpoints = [
      `/api/app/admin-users/list-with-roles${queryString}`,
      `/api/app/user-admin/list-with-roles${queryString}`,
      `/api/app/user-admin/get-list-with-roles${queryString}`,
      `/api/identity/users${queryString}`,
    ];

    let response:
      | PagedResponse<IdentityUserDto>
      | IdentityUserDto[]
      | undefined;
    let lastError: unknown;

    for (const endpoint of candidateEndpoints) {
      try {
        response = await apiClient<
          PagedResponse<IdentityUserDto> | IdentityUserDto[]
        >(endpoint);
        break;
      } catch (error) {
        const status = (error as { status?: number })?.status;
        if (status === 404) {
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    if (!response) {
      throw (lastError as Error) ?? new Error("API error: 404");
    }

    const normalized = normalizeListResponse(response);
    const users = (normalized.items as Array<Partial<IdentityUserDto>>).map(
      (user) => {
        const normalizedUser = normalizeUser(user);

        if (Array.isArray(normalizedUser.roleNames)) {
          setCachedUserRoleNames(normalizedUser.id, normalizedUser.roleNames);
          return normalizedUser;
        }

        const cachedRoleNames = userRoleCache.get(normalizedUser.id);
        return cachedRoleNames
          ? {
              ...normalizedUser,
              roleNames: cloneRoleNames(cachedRoleNames),
            }
          : normalizedUser;
      },
    );

    return {
      totalCount: normalized.totalCount,
      items: users,
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
    const response = await apiClient<IdentityUserDto>(
      `/api/identity/users/${id}/roles`,
      {
        method: "PUT",
        body: JSON.stringify({ roleNames }),
      },
    );
    setCachedUserRoleNames(id, roleNames);
    return response;
  },

  delete: async (id: string): Promise<boolean> => {
    await apiClient<void>(`/api/identity/users/${id}`, {
      method: "DELETE",
    });
    userRoleCache.delete(id);
    return true;
  },

  getRoles: async (): Promise<IdentityRoleLookupDto[]> => {
    if (rolesLookupCache) {
      return [...rolesLookupCache];
    }

    const response = await apiClient<
      PagedResponse<IdentityRoleLookupDto> | IdentityRoleLookupDto[]
    >(`/api/identity/roles?maxResultCount=1000`);

    const normalized = normalizeListResponse(response);
    rolesLookupCache = [...normalized.items];
    return [...normalized.items];
  },
};

export default userService;
