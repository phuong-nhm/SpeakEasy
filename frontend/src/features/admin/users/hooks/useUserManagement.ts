import { useCallback, useEffect, useState } from "react";
import {
  CreateIdentityUserDto,
  IdentityRoleLookupDto,
  IdentityUserDto,
  UpdateIdentityUserDto,
} from "@/features/admin/users/types/users";
import userService from "@/features/admin/users/services/userService";

type UserFilter = {
  filterText?: string;
  roleName?: string;
};

export function useUserManagement() {
  const [data, setData] = useState<IdentityUserDto[]>([]);
  const [roles, setRoles] = useState<IdentityRoleLookupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<UserFilter>({});
  const [selectedUser, setSelectedUser] = useState<IdentityUserDto | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IdentityUserDto | null>(null);

  const handleFetchUsers = useCallback(
    async (
      nextFilter: UserFilter = filter,
      nextSkipCount = skipCount,
      nextMaxResultCount = maxResultCount,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await userService.getList({
          filterText: nextFilter.filterText,
          roleName: nextFilter.roleName,
          skipCount: nextSkipCount,
          maxResultCount: nextMaxResultCount,
        });

        setData(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load users.";
        setError(message);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [filter, maxResultCount, skipCount],
  );

  const handleFetchRoles = useCallback(async () => {
    try {
      const result = await userService.getRoles();
      setRoles(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load roles.";
      setError(message);
    }
  }, []);

  useEffect(() => {
    const rolesTimer = window.setTimeout(() => {
      void handleFetchRoles();
    }, 0);

    return () => {
      window.clearTimeout(rolesTimer);
    };
  }, [handleFetchRoles]);

  useEffect(() => {
    const usersTimer = window.setTimeout(() => {
      void handleFetchUsers();
    }, 0);

    return () => {
      window.clearTimeout(usersTimer);
    };
  }, [handleFetchUsers]);

  const updateFilter = useCallback((nextFilter: Partial<UserFilter>) => {
    setFilter((previous) => ({
      ...previous,
      ...nextFilter,
    }));
    setSkipCount(0);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setSelectedUser(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((user: IdentityUserDto) => {
    setEditingUser(user);
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedUser(null);
  }, []);

  const handleCreateUser = useCallback(
    async (payload: CreateIdentityUserDto) => {
      setLoading(true);
      setError(null);

      try {
        const createdUser = await userService.create(payload);
        setSelectedUser(createdUser);
        setIsModalOpen(false);
        setEditingUser(null);
        await handleFetchUsers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create user.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [handleFetchUsers],
  );

  const handleUpdateUser = useCallback(
    async (id: string, payload: UpdateIdentityUserDto) => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await userService.update(id, payload);
        setSelectedUser(updatedUser);
        setIsModalOpen(false);
        setEditingUser(null);
        await handleFetchUsers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update user.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [handleFetchUsers],
  );

  const handleSaveUser = useCallback(
    async (payload: CreateIdentityUserDto | UpdateIdentityUserDto) => {
      if (editingUser) {
        await handleUpdateUser(
          editingUser.id,
          payload as UpdateIdentityUserDto,
        );
      } else {
        await handleCreateUser(payload as CreateIdentityUserDto);
      }
    },
    [editingUser, handleCreateUser, handleUpdateUser],
  );

  const handleDeleteUser = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const isDeleted = await userService.delete(id);

        if (!isDeleted) {
          throw new Error("User not found.");
        }

        await handleFetchUsers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete user.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [handleFetchUsers],
  );

  const toggleUserActive = useCallback(
    async (user: IdentityUserDto) => {
      const nextPayload: UpdateIdentityUserDto = {
        userName: user.userName,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: undefined,
        isActive: !user.isActive,
        lockoutEnabled: user.lockoutEnabled,
        roleNames: user.roleNames,
      };

      await handleUpdateUser(user.id, nextPayload);
    },
    [handleUpdateUser],
  );

  return {
    data,
    users: data,
    roles,
    loading,
    error,
    pagination: {
      skipCount,
      maxResultCount,
      totalCount,
    },
    filter,
    filterText: filter.filterText,
    roleName: filter.roleName,
    selectedUser,
    searchQuery: filter.filterText ?? "",
    isModalOpen,
    editingUser,
    setSearchQuery: (value: string) => updateFilter({ filterText: value }),
    setFilter: updateFilter,
    setFilterText: (filterText?: string) => updateFilter({ filterText }),
    setRoleName: (roleName?: string) => updateFilter({ roleName }),
    setSkipCount,
    setMaxResultCount: (value: number) => {
      setMaxResultCount(value);
      setSkipCount(0);
    },
    setSelectedUser,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleSaveUser,
    handleDeleteUser,
    toggleUserActive,
  };
}
