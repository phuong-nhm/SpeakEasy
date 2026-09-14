import { IdentityRoleLookupDto } from "@/features/admin/users/types/users";

export interface UserFilterProps {
  filterText: string;
  roleName: string;
  roles: IdentityRoleLookupDto[];
  onFilterTextChange: (value: string) => void;
  onRoleNameChange: (value: string) => void;
}

export function UserFilter({
  filterText,
  roleName,
  roles,
  onFilterTextChange,
  onRoleNameChange,
}: UserFilterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={(event) => onFilterTextChange(event.target.value)}
            placeholder="Tìm theo username, tên hoặc email..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>

        <select
          value={roleName}
          onChange={(event) => onRoleNameChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
