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

type ApiLikeError = Error & {
  status?: number;
  code?: string;
};

type FetchUsersOptions = {
  silent?: boolean;
};

const normalizeRoleNames = (roleNames?: string[]) =>
  [...(roleNames ?? [])].sort((left, right) => left.localeCompare(right));

const areRoleNamesEqual = (left?: string[], right?: string[]) => {
  const normalizedLeft = normalizeRoleNames(left);
  const normalizedRight = normalizeRoleNames(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every(
    (roleName, index) => roleName === normalizedRight[index],
  );
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
      options: FetchUsersOptions = {},
    ) => {
      if (!options.silent) {
        setLoading(true);
        setError(null);
      }

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
        const apiErr = err as ApiLikeError;
        const isForbidden =
          apiErr?.status === 403 ||
          apiErr?.code === "Volo.Authorization:010001";
        const message = isForbidden
          ? "Bạn không còn quyền xem danh sách người dùng (AbpIdentity.Users). Hãy đăng nhập bằng tài khoản admin hoặc gán lại quyền."
          : err instanceof Error
            ? err.message
            : "Failed to load users.";
        setError(message);

        if (!isForbidden) {
          setData([]);
          setTotalCount(0);
        }
      } finally {
        if (!options.silent) {
          setLoading(false);
        }
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

    if (!Array.isArray(user.roleNames)) {
      void (async () => {
        const roleNames = await userService.getUserRoleNames(user.id);
        const nextUser = {
          ...user,
          roleNames,
        };

        setData((previous) =>
          previous.map((item) => (item.id === user.id ? nextUser : item)),
        );
        setEditingUser((previous) =>
          previous?.id === user.id ? nextUser : previous,
        );
        setSelectedUser((previous) =>
          previous?.id === user.id ? nextUser : previous,
        );
      })();
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedUser(null);
  }, []);

  const resolveRoleSaveError = useCallback((err: unknown) => {
    const detail = err instanceof Error ? err.message : "Unknown error.";
    return `Luu thong tin nguoi dung thanh cong nhung gan vai tro that bai. Vui long mo lai nguoi dung va thu lai. Chi tiet: ${detail}`;
  }, []);

  const hasProfileChanges = useCallback(
    (payload: UpdateIdentityUserDto, currentUser: IdentityUserDto) => {
      return (
        (payload.userName ?? "") !== (currentUser.userName ?? "") ||
        (payload.name ?? "") !== (currentUser.name ?? "") ||
        (payload.surname ?? "") !== (currentUser.surname ?? "") ||
        (payload.email ?? "") !== (currentUser.email ?? "") ||
        (payload.phoneNumber ?? "") !== (currentUser.phoneNumber ?? "") ||
        (payload.isActive ?? false) !== (currentUser.isActive ?? false) ||
        (payload.lockoutEnabled ?? false) !==
          (currentUser.lockoutEnabled ?? false) ||
        Boolean(payload.password)
      );
    },
    [],
  );

  const handleCreateUser = useCallback(
    async (payload: CreateIdentityUserDto) => {
      setLoading(true);
      setError(null);

      try {
        let roleSaveWarning: string | null = null;
        const { roleNames, ...profilePayload } = payload;
        const createdUser = await userService.create(profilePayload);

        if (roleNames && roleNames.length > 0) {
          try {
            await userService.updateRoles(createdUser.id, roleNames);
          } catch (roleErr) {
            roleSaveWarning = resolveRoleSaveError(roleErr);
          }
        }

        setSelectedUser({
          ...createdUser,
          roleNames: roleNames ?? createdUser.roleNames,
        });
        setIsModalOpen(false);
        setEditingUser(null);
        void handleFetchUsers(filter, skipCount, maxResultCount, {
          silent: true,
        });

        if (roleSaveWarning) {
          setError(roleSaveWarning);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create user.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filter, handleFetchUsers, maxResultCount, resolveRoleSaveError, skipCount],
  );

  const handleUpdateUser = useCallback(
    async (id: string, payload: UpdateIdentityUserDto) => {
      setLoading(true);
      setError(null);

      try {
        let roleSaveWarning: string | null = null;
        if (!editingUser) {
          throw new Error(
            "Khong tim thay du lieu nguoi dung hien tai de cap nhat.",
          );
        }

        let updatedUser: IdentityUserDto = editingUser;
        const { roleNames, ...profilePayload } = payload;
        const shouldUpdateProfile = hasProfileChanges(payload, editingUser);
        const shouldUpdateRoles =
          Array.isArray(roleNames) &&
          !areRoleNamesEqual(roleNames, editingUser.roleNames);

        if (shouldUpdateProfile) {
          const safePayload: UpdateIdentityUserDto = {
            ...profilePayload,
            concurrencyStamp:
              payload.concurrencyStamp || editingUser.concurrencyStamp || "",
          };

          updatedUser = await userService.update(id, safePayload);
        }

        if (shouldUpdateRoles && Array.isArray(roleNames)) {
          try {
            await userService.updateRoles(id, roleNames);
            updatedUser = {
              ...updatedUser,
              roleNames,
            };
          } catch (roleErr) {
            roleSaveWarning = resolveRoleSaveError(roleErr);
          }
        }

        setSelectedUser(updatedUser);
        setIsModalOpen(false);
        setEditingUser(null);
        setData((previous) =>
          previous.map((user) => (user.id === id ? updatedUser : user)),
        );
        void handleFetchUsers(filter, skipCount, maxResultCount, {
          silent: true,
        });

        if (roleSaveWarning) {
          setError(roleSaveWarning);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update user.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      editingUser,
      filter,
      handleFetchUsers,
      hasProfileChanges,
      maxResultCount,
      resolveRoleSaveError,
      skipCount,
    ],
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

        setData((previous) => previous.filter((user) => user.id !== id));
        setTotalCount((previous) => Math.max(0, previous - 1));
        void handleFetchUsers(filter, skipCount, maxResultCount, {
          silent: true,
        });
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
        userName: user.userName ?? "",
        name: user.name ?? "",
        surname: user.surname ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber,
        password: undefined,
        isActive: !(user.isActive ?? false),
        lockoutEnabled: user.lockoutEnabled ?? false,
        concurrencyStamp: user.concurrencyStamp,
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
