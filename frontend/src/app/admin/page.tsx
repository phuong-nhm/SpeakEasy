import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Tổng quan Admin CMS
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Hệ thống quản lý nội dung và dữ liệu học tập.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">
            Cấu trúc bài học
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            Level / Chapter / Lesson
          </p>
          <Link
            href="/admin/levels"
            className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline"
          >
            Quản lý nội dung →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">
            Vận hành
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            Bài viết AI Học viên
          </p>
          <Link
            href="/admin/student-writings"
            className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline"
          >
            Xem lịch sử chấm bài →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">
            Phân quyền
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2">ABP Identity</p>
          <Link
            href="/admin/users"
            className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline"
          >
            Quản lý User & Role →
          </Link>
        </div>
      </div>
    </div>
  );
}
