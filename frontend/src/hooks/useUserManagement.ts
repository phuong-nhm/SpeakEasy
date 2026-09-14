import { useState, useMemo } from "react";
import {
  IdentityUserDto,
  CreateIdentityUserDto,
  UpdateIdentityUserDto,
  IdentityRoleLookupDto,
} from "@/types/users";

const mockRoles: IdentityRoleLookupDto[] = [
  { id: "role-1", name: "admin" },
  { id: "role-2", name: "teacher" },
  { id: "role-3", name: "student" },
];

const mockUsers: IdentityUserDto[] = [
  {
    id: "u-101",
    userName: "admin",
    name: "Quản trị",
    surname: "Hệ thống",
    email: "admin@englishapp.com",
    phoneNumber: "0901234567",
    isActive: true,
    lockoutEnabled: true,
    creationTime: "2026-01-10T08:00:00Z",
    roleNames: ["admin"],
  },
  {
    id: "u-102",
    userName: "nguyenvana",
    name: "A",
    surname: "Nguyễn Văn",
    email: "vana@gmail.com",
    phoneNumber: "0912345678",
    isActive: true,
    lockoutEnabled: true,
    creationTime: "2026-03-15T10:30:00Z",
    roleNames: ["student"],
  },
];

export function useUserManagement() {
  const [users, setUsers] = useState<IdentityUserDto[]>(mockUsers);
  const [roles] = useState<IdentityRoleLookupDto[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IdentityUserDto | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullText =
        `${u.userName} ${u.name} ${u.surname} ${u.email}`.toLowerCase();
      return fullText.includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery]);

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: IdentityUserDto) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (
    data: CreateIdentityUserDto | UpdateIdentityUserDto,
  ) => {
    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)),
      );
    } else {
      // Create
      const newUser: IdentityUserDto = {
        id: `u-${Date.now()}`,
        ...data,
        creationTime: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    closeModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const toggleUserActive = (user: IdentityUserDto) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
    );
  };

  return {
    users: filteredUsers,
    roles,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    editingUser,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveUser,
    handleDeleteUser,
    toggleUserActive,
  };
}
