"use client";

import { useAuth } from "@/features/frontend/auth/hooks/useAuth";
import Link from "next/link";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errors,
    handleLogin,
  } = useAuth();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Đăng Nhập</h2>
        <p className="text-slate-500 text-sm mt-1">
          Nhập tài khoản để tiếp tục lộ trình học của bạn
        </p>
      </div>

      {errors.general && (
        <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email hoặc tên đăng nhập
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com hoặc admin"
            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm ${
              errors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm ${
              errors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            }`}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-6">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-blue-600 font-semibold hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
