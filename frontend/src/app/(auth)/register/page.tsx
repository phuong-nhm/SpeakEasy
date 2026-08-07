"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function RegisterPage() {
  // TODO 1: Destructure các State và Handlers từ useAuth()
  // Cần lấy: surname, setSurname, name, setName, email, setEmail,
  // password, setPassword, confirmPassword, setConfirmPassword,
  // isLoading, errors, handleRegister
  const {} = useAuth();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tạo Tài Khoản Mới</h2>
        <p className="text-slate-500 text-sm mt-1">
          Bắt đầu lộ trình học tiếng Anh tương tác ngay hôm nay
        </p>
      </div>

      {/* TODO 2: Hiển thị thông báo lỗi chung (errors.general) nếu có */}
      {/* Gợi ý: Kiểm tra errors.general && render div thông báo lỗi */}

      {/* TODO 3: Gắn event onSubmit cho Form */}
      <form className="space-y-4">
        {/* Hàng chứa Họ và Tên */}
        <div className="grid grid-cols-2 gap-3">
          {/* Ô nhập Họ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn"
              // TODO 4.1: Gắn value, onChange (setSurname) và xử lý border đỏ khi có errors.surname
              className={`w-full px-3.5 py-2.5 rounded-lg border outline-none transition text-sm ${
                false /* Đổi thành điều kiện kiểm tra errors.surname */
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {/* TODO 4.2: Hiển thị tin nhắn lỗi errors.surname bên dưới input nếu có */}
          </div>

          {/* Ô nhập Tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên
            </label>
            <input
              type="text"
              placeholder="A"
              // TODO 5.1: Gắn value, onChange (setName) và xử lý border đỏ khi có errors.name
              className={`w-full px-3.5 py-2.5 rounded-lg border outline-none transition text-sm ${
                false /* Đổi thành điều kiện kiểm tra errors.name */
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {/* TODO 5.2: Hiển thị tin nhắn lỗi errors.name nếu có */}
          </div>
        </div>

        {/* Ô nhập Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="student@example.com"
            // TODO 6: Gắn value, onChange (setEmail), kiểm tra border đỏ & hiển thị errors.email
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Ô nhập Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            // TODO 7: Gắn value, onChange (setPassword), kiểm tra border đỏ & hiển thị errors.password
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Ô nhập Xác nhận mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            // TODO 8: Gắn value, onChange (setConfirmPassword), kiểm tra border đỏ & hiển thị errors.confirmPassword
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          // TODO 9: Disable button khi isLoading = true
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm disabled:opacity-50 mt-2"
        >
          {/* TODO 10: Nếu isLoading = true thì hiện icon loading, ngược lại hiện text 'Tạo tài khoản' */}
          Tạo tài khoản
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
