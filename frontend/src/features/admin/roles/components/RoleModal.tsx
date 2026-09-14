"use client";

import { useState } from "react";
import {
  IdentityRoleDto,
  CreateIdentityRoleDto,
  UpdateIdentityRoleDto,
} from "@/features/admin/roles/types/roles";

interface RoleModalProps {
  isOpen: boolean;
  editingRole: IdentityRoleDto | null;
  onClose: () => void;
  onSave: (data: CreateIdentityRoleDto | UpdateIdentityRoleDto) => void;
}

// Component con xử lý form, tự động reset state thông qua prop `key`
function RoleModalForm({
  editingRole,
  onClose,
  onSave,
}: {
  editingRole: IdentityRoleDto | null;
  onClose: () => void;
  onSave: (data: CreateIdentityRoleDto | UpdateIdentityRoleDto) => void;
}) {
  const [name, setName] = useState(editingRole?.name || "");
  const [isDefault, setIsDefault] = useState(
    editingRole ? editingRole.isDefault : false,
  );
  const [isPublic, setIsPublic] = useState(
    editingRole ? editingRole.isPublic : true,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      isDefault,
      isPublic,
      concurrencyStamp: editingRole?.concurrencyStamp,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tên Vai Trò */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên vai trò (Role Name) *
        </label>
        <input
          type="text"
          required
          disabled={editingRole?.isStatic} // Khóa sửa name nếu là role hệ thống cố định
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên vai trò (vd: teacher, manager...)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
        />
        {editingRole?.isStatic && (
          <p className="mt-1 text-xs text-slate-400">
            * Vai trò mặc định hệ thống không thể đổi tên.
          </p>
        )}
      </div>

      {/* Checkbox Mặc định & Công khai */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
          />
          <label
            htmlFor="isDefault"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Mặc định (Tự động gán cho tài khoản mới đăng ký)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
          />
          <label
            htmlFor="isPublic"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Công khai (Public Role)
          </label>
        </div>
      </div>

      {/* Buttons Action */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
          {editingRole ? "Lưu thay đổi" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}

export function RoleModal({
  isOpen,
  editingRole,
  onClose,
  onSave,
}: RoleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-semibold text-slate-800">
            {editingRole ? "Chỉnh sửa Vai trò" : "Thêm Vai trò mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <RoleModalForm
          key={editingRole?.id || "new-role"}
          editingRole={editingRole}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
