import Link from "next/link";

export default function UserDashboardPage() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <div className="max-w-2xl">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          User Dashboard
        </span>
        <h1 className="text-3xl font-bold text-slate-800 mt-3">
          Chào mừng bạn quay trở lại!
        </h1>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Giao diện lộ trình học dành cho học viên sẽ được phát triển ở bước
          sau. Hiện tại bạn có thể truy cập vào Admin CMS để nhập liệu cấu trúc
          môn học.
        </p>

        <div className="mt-6">
          <Link
            href="/admin/levels"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-md"
          >
            Mở Admin CMS Quản Lý Nội Dung →
          </Link>
        </div>
      </div>
    </div>
  );
}
