"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, BookOpenCheck, Gamepad2, Trophy, User } from "lucide-react";

import { useAuth } from "@/features/frontend/auth/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Lộ trình", icon: Home },
  { href: "/review", label: "Ôn tập", icon: BookOpenCheck },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export function AppHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const pathname = usePathname();

  const displayName = currentUser
    ? [currentUser.surname, currentUser.name].filter(Boolean).join(" ").trim()
    : "Học viên";

  const initials = currentUser
    ? (currentUser.name || currentUser.surname || "U").charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            E
          </div>
          <span className="hidden text-lg font-bold text-slate-800 sm:inline">
            English Journey
          </span>
        </Link>

        {!isAuthenticated ? (
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              Giới thiệu
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              Tính năng
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Đăng ký
            </Link>
          </nav>
        ) : (
          <>
            {/* Main nav - desktop only, mobile dùng BottomNav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 lg:flex">
                <span className="text-base">⚡</span>
                <span className="text-sm font-semibold text-indigo-700">
                  Streak 12
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-slate-100"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {initials}
                  </div>

                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-slate-800">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentUser?.email}
                    </p>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Hồ sơ của tôi
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      Trang quản trị
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
