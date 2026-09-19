"use client";

import { useAuth } from "@/features/frontend/auth/hooks/useAuth";
import Link from "next/link";

export default function RegisterPage() {
  // TODO 1: Destructure các State và Handlers từ useAuth()
  // Cần lấy: surname, setSurname, name, setName, email, setEmail,
  // password, setPassword, confirmPassword, setConfirmPassword,
  // isLoading, errors, handleRegister
  const {
    surname,
    setSurname,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    errors,
    handleRegister,
  } = useAuth();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tạo Tài Khoản Mới</h2>
        <p className="text-slate-500 text-sm mt-1">
          Bắt đầu lộ trình học tiếng Anh tương tác ngay hôm nay
        </p>
      </div>

      {errors.general && (
        <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {errors.general}
        </div>
      )}
      {/* Gợi ý: Kiểm tra errors.general && render div thông báo lỗi */}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ
            </label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Nguyễn Văn"
              className={`w-full px-3.5 py-2.5 rounded-lg border outline-none transition text-sm ${
                errors.surname
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.surname && (
              <p className="text-xs text-red-500 mt-1">{errors.surname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="A"
              className={`w-full px-3.5 py-2.5 rounded-lg border outline-none transition text-sm ${
                errors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Ô nhập Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="student@example.com"
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

        {/* Ô nhập Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Tối thiểu 6 ký tự"
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

        {/* Ô nhập Xác nhận mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            "Tạo tài khoản"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-6">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
