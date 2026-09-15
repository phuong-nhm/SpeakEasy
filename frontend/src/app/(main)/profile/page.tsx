import { BadgeCheck, Flame, Gem, Star } from "lucide-react";
import {
  getUserProfile,
  getUserAchievements,
  getLearningStats,
} from "@/features/frontend/profile/services/profileService";
import { LearningStatsTabs } from "@/features/frontend/profile/components/LearningStatsTabs";

export default async function ProfilePage() {
  const [profile, achievements, weeklyStats, monthlyStats] = await Promise.all([
    getUserProfile(),
    getUserAchievements(),
    getLearningStats("weekly"),
    getLearningStats("monthly"),
  ]);

  if (!profile) {
    return (
      <div className="p-6 text-slate-600">Không tải được thông tin hồ sơ.</div>
    );
  }

  const displayName = profile.fullName ?? profile.userName;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200/60">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black">{displayName}</h1>
            <p className="text-sm text-indigo-100">
              @{profile.userName} · Level {profile.level ?? 1} · Tham gia{" "}
              {profile.joinedAt
                ? new Date(profile.joinedAt).toLocaleDateString("vi-VN")
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <Flame className="h-5 w-5 text-orange-200" />
            <p className="mt-1 text-xl font-bold">{profile.currentStreak}</p>
            <p className="text-xs uppercase tracking-wide text-indigo-100">
              Streak
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <Star className="h-5 w-5 text-yellow-200" />
            <p className="mt-1 text-xl font-bold">{profile.totalXp}</p>
            <p className="text-xs uppercase tracking-wide text-indigo-100">
              XP
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <Gem className="h-5 w-5 text-cyan-200" />
            <p className="mt-1 text-xl font-bold">{profile.gems}</p>
            <p className="text-xs uppercase tracking-wide text-indigo-100">
              Gems
            </p>
          </div>
        </div>
      </div>

      <LearningStatsTabs weekly={weeklyStats} monthly={monthlyStats} />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Huy hiệu & Thành tựu
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const percent = Math.min(
              100,
              Math.round((a.progressCurrent / a.progressTarget) * 100),
            );
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${
                  a.isUnlocked
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    className={`h-5 w-5 ${
                      a.isUnlocked ? "text-emerald-500" : "text-slate-300"
                    }`}
                  />
                  <p className="font-semibold text-slate-800">{a.title}</p>
                </div>
                {a.description && (
                  <p className="mt-1 text-xs text-slate-500">{a.description}</p>
                )}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      a.isUnlocked ? "bg-emerald-400" : "bg-indigo-400"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">
                  {a.progressCurrent}/{a.progressTarget}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
