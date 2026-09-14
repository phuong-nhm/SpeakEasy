// --- ROLE DTOs ---

export interface IdentityRoleDto {
  id: string;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  isStatic: boolean;
  concurrencyStamp?: string;
}

export interface CreateIdentityRoleDto {
  name: string;
  isDefault: boolean;
  isPublic: boolean;
}

export interface UpdateIdentityRoleDto {
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  concurrencyStamp?: string;
}

// --- PERMISSION DTOs (ABP Identity) ---

export interface PermissionGrantInfoDto {
  name: string;
  displayName: string;
  isGranted: boolean;
  parentName?: string | null;
  allowedProviders?: string[];
}

export interface PermissionGroupDto {
  name: string;
  displayName: string;
  displayNameKey?: string;
  permissions: PermissionGrantInfoDto[];
}

export interface GetPermissionListResultDto {
  entityDisplayName: string;
  groups: PermissionGroupDto[];
}

export interface UpdatePermissionDto {
  name: string;
  isGranted: boolean;
}

export interface UpdatePermissionsDto {
  permissions: UpdatePermissionDto[];
}
