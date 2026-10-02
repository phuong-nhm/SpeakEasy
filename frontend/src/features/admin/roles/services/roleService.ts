import { apiClient } from "@/lib/apiClient";
import {
  CreateIdentityRoleDto,
  GetPermissionListResultDto,
  IdentityRoleDto,
  UpdateIdentityRoleDto,
  UpdatePermissionsDto,
} from "@/features/admin/roles/types/roles";

type PagedResponse<T> = {
  totalCount?: number;
  items?: T[];
};

const normalizeListResponse = <T>(
  response: PagedResponse<T> | T[] | null | undefined,
): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response) {
    return [];
  }

  return response.items ?? [];
};

export const roleService = {
  getRoles: async (): Promise<IdentityRoleDto[]> => {
    const response = await apiClient<
      PagedResponse<IdentityRoleDto> | IdentityRoleDto[]
    >(`/api/identity/roles?maxResultCount=1000`);

    return normalizeListResponse(response);
  },

  getRoleById: async (id: string): Promise<IdentityRoleDto | undefined> => {
    return apiClient<IdentityRoleDto>(`/api/identity/roles/${id}`);
  },

  createRole: async (data: CreateIdentityRoleDto): Promise<IdentityRoleDto> => {
    return apiClient<IdentityRoleDto>("/api/identity/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRole: async (
    id: string,
    data: UpdateIdentityRoleDto,
  ): Promise<IdentityRoleDto> => {
    return apiClient<IdentityRoleDto>(`/api/identity/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteRole: async (id: string): Promise<boolean> => {
    await apiClient<void>(`/api/identity/roles/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  getPermissions: async (
    providerName: string,
    providerKey: string,
  ): Promise<GetPermissionListResultDto> => {
    const query = new URLSearchParams({
      providerName,
      providerKey,
    });

    return apiClient<GetPermissionListResultDto>(
      `/api/permission-management/permissions?${query.toString()}`,
    );
  },

  updatePermissions: async (
    providerName: string,
    providerKey: string,
    data: UpdatePermissionsDto,
  ): Promise<GetPermissionListResultDto> => {
    const query = new URLSearchParams({
      providerName,
      providerKey,
    });

    return apiClient<GetPermissionListResultDto>(
      `/api/permission-management/permissions?${query.toString()}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },
};

export default roleService;
