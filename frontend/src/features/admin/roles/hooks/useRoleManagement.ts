"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import roleService from "@/features/admin/roles/services/roleService";
import {
  CreateIdentityRoleDto,
  GetPermissionListResultDto,
  IdentityRoleDto,
  UpdateIdentityRoleDto,
  UpdatePermissionsDto,
} from "@/features/admin/roles/types/roles";

export function useRoleManagement() {
  const [roles, setRoles] = useState<IdentityRoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IdentityRoleDto | null>(null);

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionRole, setPermissionRole] = useState<IdentityRoleDto | null>(
    null,
  );
  const [permissionData, setPermissionData] =
    useState<GetPermissionListResultDto | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await roleService.getRoles();
      setRoles(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load roles.";
      setError(message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRoles();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchRoles]);

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) {
      return roles;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return roles.filter((role) =>
      role.name.toLowerCase().includes(normalizedQuery),
    );
  }, [roles, searchQuery]);

  const openCreateRoleModal = useCallback(() => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  }, []);

  const openEditRoleModal = useCallback((role: IdentityRoleDto) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  }, []);

  const closeRoleModal = useCallback(() => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  }, []);

  const handleSaveRole = useCallback(
    async (data: CreateIdentityRoleDto | UpdateIdentityRoleDto) => {
      setLoading(true);
      setError(null);

      try {
        if (editingRole) {
          const updatedRole = await roleService.updateRole(
            editingRole.id,
            data as UpdateIdentityRoleDto,
          );
          setRoles((previous) =>
            previous.map((role) =>
              role.id === updatedRole.id ? updatedRole : role,
            ),
          );
        } else {
          const createdRole = await roleService.createRole(
            data as CreateIdentityRoleDto,
          );
          setRoles((previous) => [...previous, createdRole]);
        }

        closeRoleModal();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save role.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [closeRoleModal, editingRole],
  );

  const handleDeleteRole = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa vai trò này?",
      );
      if (!confirmed) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isDeleted = await roleService.deleteRole(id);

        if (!isDeleted) {
          throw new Error("Role not found.");
        }

        await fetchRoles();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete role.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchRoles],
  );

  const closePermissionModal = useCallback(() => {
    setIsPermissionModalOpen(false);
    setPermissionRole(null);
    setPermissionData(null);
  }, []);

  const openPermissionModal = useCallback(
    async (role: IdentityRoleDto) => {
      setPermissionRole(role);
      setPermissionData(null);
      setIsPermissionModalOpen(true);
      setError(null);

      try {
        const response = await roleService.getPermissions("R", role.name);
        setPermissionData(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load permissions.";
        setError(message);
        closePermissionModal();
      }
    },
    [closePermissionModal],
  );

  const handleSavePermissions = useCallback(
    async (updateData: UpdatePermissionsDto) => {
      if (!permissionRole) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await roleService.updatePermissions(
          "R",
          permissionRole.name,
          updateData,
        );

        setPermissionData(response);
        closePermissionModal();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save permissions.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [closePermissionModal, permissionRole],
  );

  return {
    roles: filteredRoles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isRoleModalOpen,
    editingRole,
    openCreateRoleModal,
    openEditRoleModal,
    closeRoleModal,
    handleSaveRole,
    handleDeleteRole,
    isPermissionModalOpen,
    permissionRole,
    permissionData,
    openPermissionModal,
    closePermissionModal,
    handleSavePermissions,
  };
}
