"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Giả lập User đăng nhập chuẩn ABP (Name: A, Surname: Nguyễn Văn)
  const currentUser = {
    name: "A",
    surname: "Nguyễn Văn",
    email: "admin@example.com",
    role: "Admin",
  };

  // Lấy chữ cái đầu của Tên để làm Avatar (chuẩn ABP không cần cột Avatar)
  const avatarLetter = currentUser.name
    ? currentUser.name[0].toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo App */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              E
            </div>
            <span className="font-bold text-slate-800 text-lg">
              English Journey
            </span>
          </Link>

          {/* Right Navigation & User Avatar Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Avatar Button Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                {/* Avatar Badge bằng Chữ cái đầu */}
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm">
                  {avatarLetter}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-700 leading-tight">
                    {currentUser.surname} {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-400">{currentUser.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400">
                      Đăng nhập với email
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  {/* Nút bấm sang Admin CMS */}
                  <Link
                    href="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 font-medium transition"
                  >
                    <svg
                      className="w-4 h-4 mr-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Trang quản trị (Admin CMS)
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <Link
                    href="/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <svg
                      className="w-4 h-4 mr-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
