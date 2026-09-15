import { getLeaderboard } from "@/features/frontend/leaderboard/services/leaderboardService";
import { LeaderboardTabs } from "@/features/frontend/leaderboard/components/LeaderboardTabs";

export default async function LeaderboardPage() {
  const [weekly, friends] = await Promise.all([
    getLeaderboard("weekly"),
    getLeaderboard("friends"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-2xl font-black text-slate-800">
        Bảng xếp hạng
      </h1>
      <LeaderboardTabs weekly={weekly} friends={friends} />
    </div>
  );
}
