import { IdentityUserDto } from "@/features/admin/users/types/users";

export interface UserTableProps {
  users: IdentityUserDto[];
  isLoading: boolean;
  onEdit: (user: IdentityUserDto) => void;
  onDelete: (id: string) => void;
  onAssignRole: (user: IdentityUserDto) => void;
  onToggleActive: (user: IdentityUserDto) => void;
}

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onAssignRole,
  onToggleActive,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Không tìm thấy người dùng nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-600">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <th className="w-16 px-4 py-3">STT</th>
            <th className="px-4 py-3">Tài khoản</th>
            <th className="px-4 py-3">Họ và Tên</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Số điện thoại</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="w-32 px-4 py-3 text-center">Trạng thái</th>
            <th className="w-40 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-slate-500">{index + 1}</td>

              <td className="px-4 py-3 font-medium text-slate-800">
                {item.userName}
              </td>

              <td className="px-4 py-3 text-slate-700">
                {`${item.surname || ""} ${item.name || ""}`.trim() || "N/A"}
              </td>

              <td className="px-4 py-3 text-slate-600">{item.email}</td>

              <td className="px-4 py-3 text-slate-600">
                {item.phoneNumber || "—"}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.roleNames.length > 0 ? (
                    item.roleNames.map((roleName) => (
                      <span
                        key={`${item.id}-${roleName}`}
                        className="inline-block rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {roleName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Chưa có</span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onToggleActive(item)}
                  className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    item.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  {item.isActive ? "Hoạt động" : "Bị khóa"}
                </button>
              </td>

              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onAssignRole(item)}
                    className="text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    Gán vai trò
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-800"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
