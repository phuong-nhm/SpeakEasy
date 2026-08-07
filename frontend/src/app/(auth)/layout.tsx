import React from 'react';
export default function AuthLayout({children}:{ children: React.ReactNode }) {
return (
<div className="min-h-screen grid grid-cols-1 lg:grid-cols-[35%_65%] bg-slate-50">
      {/* CỘT T TRÁI: Banner giới thiệu tính năng ứng dụng */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12">
            <div>
            <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl backdrop-blur-sm">
                E
                </div>
                <span className="text-xl font-bold tracking-wide">English Journey</span>
            </div>

            <div className="mt-16 space-y-6 max-w-md">
                <h1 className="text-4xl font-extrabold leading-tight">
                Học Tiếng Anh Thông Minh Theo Lộ Trình
                </h1>
                <p className="text-blue-100 text-base leading-relaxed">
                Tích hợp Spaced Repetition giúp nhớ từ vựng lâu hơn và AI chấm bài viết B1/B2 chi tiết theo real-time.
                </p>
            </div>
            </div>

            {/* Các đặc điểm nổi bật dạng Badge */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-blue-200 mt-1">Lộ trình rõ ràng</p>
            </div>
            <div>
                <p className="text-2xl font-bold">AI</p>
                <p className="text-xs text-blue-200 mt-1">Chấm bài viết B1/B2</p>
            </div>
            <div>
                <p className="text-2xl font-bold">SRS</p>
                <p className="text-xs text-blue-200 mt-1">Ôn tập ngắt quãng</p>
            </div>
            </div>
        </div>

        {/* CỘT PHẢI: Nơi nội dung Login hoặc Register chèn vào */}
        <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
            {children}
            </div>
        </div>
        </div>
    );
}