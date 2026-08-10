"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Danh sách Navigation Sidebar khớp 10 màn hình yêu cầu
  const navItems = [
    {
      group: "NHÓM 1: CẤU TRÚC NỘI DUNG",
      items: [
        { name: "1. Quản lý Level", href: "/admin/levels" },
        { name: "2. Quản lý Chapter", href: "/admin/chapters" },
        { name: "3. Quản lý Lesson", href: "/admin/lessons" },
        { name: "4. Từ vựng (Vocabulary)", href: "/admin/vocabularies" },
        { name: "5. Bài tập Xếp câu", href: "/admin/sentence-exercises" },
        { name: "6. Topic Bài viết AI", href: "/admin/writing-topics" },
      ],
    },
    {
      group: "NHÓM 2: VẬN HÀNH & AI",
      items: [
        { name: "7. Lịch sử Viết Học viên", href: "/admin/student-writings" },
      ],
    },
    {
      group: "NHÓM 3: HỆ THỐNG (ABP IDENTITY)",
      items: [
        { name: "9. Quản lý User", href: "/admin/users" },
        { name: "10. Quản lý Role & Quyền", href: "/admin/roles" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-lg tracking-wide">
            ADMIN CMS
          </span>
          <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
            v1.0
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar: Nút quay lại User App */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
          >
            ← Quay lại Trang học viên
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 h-14 px-8 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Hệ thống Quản trị Nội dung Học tiếng Anh
          </p>
          <span className="text-xs text-slate-400">
            ABP Framework + Next.js
          </span>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
