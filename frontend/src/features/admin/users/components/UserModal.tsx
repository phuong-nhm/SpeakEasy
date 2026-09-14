"use client";

import { useState } from "react";
import {
  CreateIdentityUserDto,
  IdentityUserDto,
  IdentityRoleLookupDto,
  UpdateIdentityUserDto,
} from "@/features/admin/users/types/users";

interface UserModalProps {
  isOpen: boolean;
  editingUser: IdentityUserDto | null;
  roles: IdentityRoleLookupDto[];
  onClose: () => void;
  onSave: (data: CreateIdentityUserDto | UpdateIdentityUserDto) => void;
}

function UserModalForm({
  editingUser,
  roles,
  onClose,
  onSave,
}: {
  editingUser: IdentityUserDto | null;
  roles: IdentityRoleLookupDto[];
  onClose: () => void;
  onSave: (data: CreateIdentityUserDto | UpdateIdentityUserDto) => void;
}) {
  const [userName, setUserName] = useState(editingUser?.userName || "");
  const [name, setName] = useState(editingUser?.name || "");
  const [surname, setSurname] = useState(editingUser?.surname || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(
    editingUser?.phoneNumber || "",
  );
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(
    editingUser ? editingUser.isActive : true,
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    editingUser?.roleNames || ["student"],
  );

  const handleToggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateIdentityUserDto | UpdateIdentityUserDto = {
      userName,
      name,
      surname,
      email,
      phoneNumber,
      password: password || undefined,
      isActive,
      lockoutEnabled: true,
      roleNames: selectedRoles,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên đăng nhập (UserName) *
          </label>
          <input
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Họ (Surname)
          </label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên (Name)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu {editingUser && "(Bỏ trống nếu không đổi)"}
          </label>
          <input
            type="password"
            required={!editingUser}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Roles */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Vai trò (Roles)
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {roles.map((r) => {
            const isSelected = selectedRoles.includes(r.name);
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => handleToggleRole(r.name)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isSelected ? "✓ " : ""}
                {r.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Kích hoạt tài khoản (Active)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {editingUser ? "Lưu thay đổi" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}

export function UserModal({
  isOpen,
  editingUser,
  roles,
  onClose,
  onSave,
}: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-semibold text-slate-800">
            {editingUser ? "Chỉnh sửa Tài khoản" : "Tạo Tài khoản mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <UserModalForm
          key={editingUser?.id || "new-user"}
          editingUser={editingUser}
          roles={roles}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
