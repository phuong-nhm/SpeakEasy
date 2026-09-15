"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpenCheck, Gamepad2, Trophy, User } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Lộ trình", icon: Home },
  { href: "/review", label: "Ôn tập", icon: BookOpenCheck },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                active ? "text-indigo-700" : "text-slate-500"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-indigo-700" : "text-slate-400"}`}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
