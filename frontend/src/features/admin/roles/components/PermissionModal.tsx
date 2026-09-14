"use client";

import { useState } from "react";
import {
  IdentityRoleDto,
  GetPermissionListResultDto,
  UpdatePermissionsDto,
} from "@/features/admin/roles/types/roles";

interface PermissionModalProps {
  isOpen: boolean;
  role: IdentityRoleDto | null;
  permissionData: GetPermissionListResultDto | null;
  onClose: () => void;
  onSave: (data: UpdatePermissionsDto) => void;
}

// Hàm helper khởi tạo map quyền ban đầu từ permissionData
function buildInitialGrantedMap(permissionData: GetPermissionListResultDto) {
  const initialMap: Record<string, boolean> = {};
  permissionData.groups?.forEach((group) => {
    group.permissions?.forEach((p) => {
      initialMap[p.name] = p.isGranted;
    });
  });
  return initialMap;
}

function PermissionModalForm({
  role,
  permissionData,
  onClose,
  onSave,
}: {
  role: IdentityRoleDto;
  permissionData: GetPermissionListResultDto;
  onClose: () => void;
  onSave: (data: UpdatePermissionsDto) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>(
    permissionData.groups[0]?.name || "",
  );

  // 1. Khởi tạo state trực tiếp từ initialData (Không dùng useEffect)
  const [grantedMap, setGrantedMap] = useState<Record<string, boolean>>(() =>
    buildInitialGrantedMap(permissionData),
  );

  // 2. Track role ID cũ để reset state khi chuyển role mà không cần useEffect
  const [prevRoleId, setPrevRoleId] = useState<string>(role.id);

  if (prevRoleId !== role.id) {
    setPrevRoleId(role.id);
    setGrantedMap(buildInitialGrantedMap(permissionData));
  }

  // Toggle một quyền đơn lẻ (Tự động tích quyền cha nếu tích quyền con)
  const handleTogglePermission = (permName: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setGrantedMap((prev) => {
      const next = { ...prev, [permName]: newVal };

      const allPermissions = permissionData.groups.flatMap(
        (g) => g.permissions,
      );
      const currentPerm = allPermissions.find((p) => p.name === permName);

      // Nếu tích quyền con -> Tự động tích quyền cha
      if (newVal && currentPerm?.parentName) {
        next[currentPerm.parentName] = true;
      }

      // Nếu bỏ tích quyền cha -> Tự động bỏ tích tất cả quyền con
      if (!newVal) {
        const uncheckChildren = (parentName: string) => {
          const children = allPermissions.filter(
            (p) => p.parentName === parentName,
          );
          children.forEach((c) => {
            next[c.name] = false;
            uncheckChildren(c.name);
          });
        };
        uncheckChildren(permName);
      }

      return next;
    });
  };

  // Chọn tất cả / Bỏ chọn tất cả trong 1 Nhóm (Group)
  const handleToggleGroupAll = (groupName: string, grantAll: boolean) => {
    const group = permissionData.groups.find((g) => g.name === groupName);
    if (!group) return;

    setGrantedMap((prev) => {
      const next = { ...prev };
      group.permissions.forEach((p) => {
        next[p.name] = grantAll;
      });
      return next;
    });
  };

  // Select/Unselect toàn bộ tất cả các Nhóm
  const handleToggleSelectAll = (grantAll: boolean) => {
    setGrantedMap((prev) => {
      const next = { ...prev };
      permissionData.groups.forEach((g) => {
        g.permissions.forEach((p) => {
          next[p.name] = grantAll;
        });
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const permissionsPayload = Object.entries(grantedMap).map(
      ([name, isGranted]) => ({
        name,
        isGranted,
      }),
    );
    onSave({ permissions: permissionsPayload });
  };

  const currentGroup = permissionData.groups.find((g) => g.name === activeTab);

  const isCurrentGroupAllSelected =
    currentGroup?.permissions.every((p) => grantedMap[p.name]) ?? false;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[75vh]">
      {/* Header Bar Actions */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Phân quyền cho vai trò:{" "}
          <strong className="text-indigo-600">{role.name}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleSelectAll(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Chọn tất cả
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleToggleSelectAll(false)}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      </div>

      {/* Main Body: Tabs Left & Content Right */}
      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Left Sidebar: Tab Groups */}
        <div className="col-span-4 border-r border-slate-200 pr-3 space-y-1 overflow-y-auto">
          {permissionData.groups.map((group) => {
            const isActive = group.name === activeTab;
            const grantedCount = group.permissions.filter(
              (p) => grantedMap[p.name],
            ).length;

            return (
              <button
                key={group.name}
                type="button"
                onClick={() => setActiveTab(group.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{group.displayName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    grantedCount > 0
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {grantedCount}/{group.permissions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content: Permissions Tree List */}
        <div className="col-span-8 overflow-y-auto pl-1 pr-2 space-y-3">
          {currentGroup && (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  {currentGroup.displayName}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrentGroupAllSelected}
                    onChange={(e) =>
                      handleToggleGroupAll(currentGroup.name, e.target.checked)
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                  />
                  <span>Chọn nhóm này</span>
                </label>
              </div>

              <div className="space-y-2">
                {currentGroup.permissions.map((p) => {
                  const isChild = !!p.parentName;
                  const isGranted = !!grantedMap[p.name];

                  return (
                    <div
                      key={p.name}
                      className={`flex items-center gap-2 py-1.5 rounded transition-colors ${
                        isChild ? "ml-6" : "font-medium text-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`perm-${p.name}`}
                        checked={isGranted}
                        onChange={() =>
                          handleTogglePermission(p.name, isGranted)
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                      />
                      <label
                        htmlFor={`perm-${p.name}`}
                        className={`text-xs cursor-pointer select-none ${
                          isChild
                            ? "text-slate-600"
                            : "text-slate-800 font-semibold"
                        }`}
                      >
                        {p.displayName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-auto">
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
          Lưu quyền
        </button>
      </div>
    </form>
  );
}

export function PermissionModal({
  isOpen,
  role,
  permissionData,
  onClose,
  onSave,
}: PermissionModalProps) {
  if (!isOpen || !role || !permissionData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl space-y-4">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-semibold text-slate-800">
            Cấu hình Quyền Hạn (Permissions)
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <PermissionModalForm
          key={role.id}
          role={role}
          permissionData={permissionData}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
