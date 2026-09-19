"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/frontend/auth/hooks/useAuth";

const features = [
  {
    title: "4 dạng bài tập câu",
    description:
      "Ghép từ, điền chỗ trống, trả lời câu hỏi và dịch câu tiếng Việt sang tiếng Anh theo từng bài học.",
  },
  {
    title: "AI chấm bài B1/B2",
    description:
      "Nhận phản hồi chi tiết về ngữ pháp, từ vựng và cách diễn đạt để cải thiện mỗi ngày.",
  },
  {
    title: "Spaced Repetition & Game nối từ",
    description:
      "Ôn tập ngắt quãng thông minh, kết hợp mini-game để nhớ từ lâu hơn và duy trì streak.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePrimaryClick = () => {
    router.push(isAuthenticated ? "/dashboard" : "/login");
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                English Journey
              </span>

              <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Học Tiếng Anh Gamified với AI Chấm Bài & Ôn Tập Ngắt Quảng
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Duy trì streak hàng ngày, luyện 4 dạng bài tập câu, và nhận phản
                hồi AI ngay lập tức để cải thiện kỹ năng B1/B2 một cách bền
                vững.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handlePrimaryClick}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  {isAuthenticated ? "Vào lộ trình" : "Bắt đầu học ngay"}
                </button>

                <Link
                  href="#features"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  Khám phá tính năng
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
                <div>
                  <span className="block text-2xl font-bold text-slate-900">
                    4+
                  </span>
                  Dạng bài tập
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">
                    AI
                  </span>
                  Chấm bài B1/B2
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">
                    ⚡
                  </span>
                  Streak luyện tập
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Today Streak
                  </span>
                  <span className="text-2xl font-black">⚡ 12</span>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-indigo-100">
                      Luyện tập hôm nay
                    </p>
                    <p className="mt-2 text-3xl font-bold">18 phút</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-indigo-100">
                      Bài tập mới
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      Sentence Workout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Tính năng chính
          </p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            Một hệ sinh thái học tiếng Anh tập trung vào hành động
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-700">
                ✦
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="font-semibold text-slate-800">English Journey</div>
          <div className="flex gap-5">
            <Link href="#features" className="hover:text-indigo-600">
              Tính năng
            </Link>
            <Link href="/login" className="hover:text-indigo-600">
              Đăng nhập
            </Link>
            <Link href="/register" className="hover:text-indigo-600">
              Đăng ký
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
