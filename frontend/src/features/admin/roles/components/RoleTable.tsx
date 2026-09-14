import { IdentityRoleDto } from "@/features/admin/roles/types/roles";

export interface RoleTableProps {
  roles: IdentityRoleDto[];
  isLoading: boolean;
  onPermissionClick: (role: IdentityRoleDto) => void;
  onEdit: (role: IdentityRoleDto) => void;
  onDelete: (id: string) => void;
}

export function RoleTable({
  roles,
  isLoading,
  onPermissionClick,
  onEdit,
  onDelete,
}: RoleTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Đang tải danh sách vai trò...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-600">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <th className="w-16 px-4 py-3">STT</th>
            <th className="px-4 py-3">Tên vai trò</th>
            <th className="px-4 py-3">Đặc tính</th>
            <th className="w-32 px-4 py-3 text-center">Loại Role</th>
            <th className="w-48 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                Không tìm thấy vai trò nào.
              </td>
            </tr>
          ) : (
            roles.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                <td className="px-4 py-3 font-semibold text-slate-800">
                  {item.name}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.isDefault && (
                      <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Mặc định (Default)
                      </span>
                    )}
                    {item.isPublic && (
                      <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Công khai (Public)
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  {item.isStatic ? (
                    <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      Cố định
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Tùy chỉnh
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onPermissionClick(item)}
                      className="rounded border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Quyền hạn
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Sửa
                    </button>
                    {!item.isStatic && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-800"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
