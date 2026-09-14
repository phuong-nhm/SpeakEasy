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

const mockUsers: IdentityUserDto[] = [
  {
    id: "user-001",
    userName: "alice.nguyen",
    name: "Alice",
    surname: "Nguyen",
    email: "alice.nguyen@example.com",
    phoneNumber: "+84123456789",
    isActive: true,
    lockoutEnabled: false,
    creationTime: "2026-01-15T09:30:00Z",
    roleNames: ["Admin", "Teacher"],
  },
  {
    id: "user-002",
    userName: "minh.tran",
    name: "Minh",
    surname: "Tran",
    email: "minh.tran@example.com",
    phoneNumber: "+84987654321",
    isActive: true,
    lockoutEnabled: false,
    creationTime: "2026-02-08T14:10:00Z",
    roleNames: ["Student"],
  },
  {
    id: "user-003",
    userName: "hoang.le",
    name: "Hoang",
    surname: "Le",
    email: "hoang.le@example.com",
    phoneNumber: "+84876543210",
    isActive: false,
    lockoutEnabled: false,
    creationTime: "2026-03-12T08:00:00Z",
    roleNames: ["Teacher"],
  },
  {
    id: "user-004",
    userName: "lan.pham",
    name: "Lan",
    surname: "Pham",
    email: "lan.pham@example.com",
    phoneNumber: "+84345678901",
    isActive: true,
    lockoutEnabled: true,
    creationTime: "2026-05-30T16:45:00Z",
    roleNames: ["Student", "Editor"],
  },
  {
    id: "user-005",
    userName: "duy.vo",
    name: "Duy",
    surname: "Vo",
    email: "duy.vo@example.com",
    phoneNumber: "+84234567890",
    isActive: true,
    lockoutEnabled: false,
    creationTime: "2026-06-21T11:20:00Z",
    roleNames: ["Admin"],
  },
];

const mockRoles: IdentityRoleLookupDto[] = [
  { id: "role-admin", name: "Admin" },
  { id: "role-teacher", name: "Teacher" },
  { id: "role-student", name: "Student" },
  { id: "role-editor", name: "Editor" },
];

export const userService = {
  getList: async (
    params: GetListUserParams = {},
  ): Promise<GetListUserResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filteredUsers = mockUsers.filter((user) => {
      const matchesText =
        !params.filterText ||
        [user.userName, user.name, user.surname, user.email]
          .join(" ")
          .toLowerCase()
          .includes(params.filterText.toLowerCase());

      const matchesRole =
        !params.roleName ||
        user.roleNames.some(
          (roleName) =>
            roleName.toLowerCase() === params.roleName?.toLowerCase(),
        );

      return matchesText && matchesRole;
    });

    const skipCount = params.skipCount ?? 0;
    const maxResultCount = params.maxResultCount ?? filteredUsers.length;

    return {
      totalCount: filteredUsers.length,
      items: filteredUsers.slice(skipCount, skipCount + maxResultCount),
    };
  },

  getById: async (id: string): Promise<IdentityUserDto | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUsers.find((user) => user.id === id);
  },

  create: async (data: CreateIdentityUserDto): Promise<IdentityUserDto> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: IdentityUserDto = {
      id: `user-${Date.now()}`,
      userName: data.userName,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      lockoutEnabled: data.lockoutEnabled,
      creationTime: new Date().toISOString(),
      roleNames: data.roleNames,
    };

    mockUsers.push(newUser);
    return newUser;
  },

  update: async (
    id: string,
    data: UpdateIdentityUserDto,
  ): Promise<IdentityUserDto> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userIndex = mockUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new Error("User not found.");
    }

    const updatedUser: IdentityUserDto = {
      ...mockUsers[userIndex],
      userName: data.userName,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      lockoutEnabled: data.lockoutEnabled,
      roleNames: data.roleNames,
    };

    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userIndex = mockUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return false;
    }

    mockUsers.splice(userIndex, 1);
    return true;
  },

  getRoles: async (): Promise<IdentityRoleLookupDto[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockRoles;
  },
};

export default userService;
