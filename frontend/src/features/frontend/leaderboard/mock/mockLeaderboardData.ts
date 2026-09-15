import { LeaderboardResultDto } from "../types/leaderboard";

const weeklyNames = [
  "Minh Anh",
  "Thảo Vy",
  "Đức Huy",
  "Gia Bảo",
  "Ngọc Hân",
  "Quang Minh",
  "Hải Yến",
  "Tuấn Kiệt",
  "Phương Nam",
  "Bảo Trâm",
];

export const mockWeeklyLeaderboard: LeaderboardResultDto = {
  scope: "weekly",
  division: "Gold",
  currentUserRank: 6,
  entries: weeklyNames.map((name, i) => ({
    rank: i + 1,
    userId: `u-${i + 1}`,
    userName: name.toLowerCase().replace(/\s/g, ""),
    fullName: name,
    xpThisPeriod: 620 - i * 35,
    isCurrentUser: i === 5, // rank 6 = "bạn"
  })),
};

export const mockFriendsLeaderboard: LeaderboardResultDto = {
  scope: "friends",
  division: "Gold",
  currentUserRank: 2,
  entries: [
    {
      rank: 1,
      userId: "f-1",
      userName: "thaovy",
      fullName: "Thảo Vy",
      xpThisPeriod: 540,
    },
    {
      rank: 2,
      userId: "user-1",
      userName: "minhphuong",
      fullName: "Nguyễn Hải Minh Phương",
      xpThisPeriod: 830,
      isCurrentUser: true,
    },
    {
      rank: 3,
      userId: "f-3",
      userName: "ducuy",
      fullName: "Đức Huy",
      xpThisPeriod: 410,
    },
    {
      rank: 4,
      userId: "f-4",
      userName: "giabao",
      fullName: "Gia Bảo",
      xpThisPeriod: 260,
    },
  ],
};
