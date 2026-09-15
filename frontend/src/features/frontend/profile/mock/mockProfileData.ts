import {
  UserProfileDto,
  AchievementDto,
  LearningStatsDto,
} from "../types/profile";

export const mockUserProfile: UserProfileDto = {
  id: "user-1",
  userName: "minhphuong",
  fullName: "Nguyễn Hải Minh Phương",
  avatarUrl: undefined,
  currentStreak: 12,
  longestStreak: 21,
  totalXp: 830,
  gems: 145,
  level: 3,
  joinedAt: "2026-06-01T00:00:00.000Z",
};

export const mockAchievements: AchievementDto[] = [
  {
    id: "ach-1",
    title: "Khởi động",
    description: "Hoàn thành bài học đầu tiên",
    isUnlocked: true,
    progressCurrent: 1,
    progressTarget: 1,
    unlockedAt: "2026-06-02T00:00:00.000Z",
  },
  {
    id: "ach-2",
    title: "Kiên trì 7 ngày",
    description: "Duy trì streak 7 ngày liên tiếp",
    isUnlocked: true,
    progressCurrent: 7,
    progressTarget: 7,
    unlockedAt: "2026-06-10T00:00:00.000Z",
  },
  {
    id: "ach-3",
    title: "Bậc thầy từ vựng",
    description: "Học thuộc 100 từ vựng",
    isUnlocked: false,
    progressCurrent: 63,
    progressTarget: 100,
  },
  {
    id: "ach-4",
    title: "Nhà văn nhí",
    description: "Nộp 10 bài viết được AI chấm",
    isUnlocked: false,
    progressCurrent: 3,
    progressTarget: 10,
  },
  {
    id: "ach-5",
    title: "Streak huyền thoại",
    description: "Duy trì streak 30 ngày liên tiếp",
    isUnlocked: false,
    progressCurrent: 12,
    progressTarget: 30,
  },
  {
    id: "ach-6",
    title: "Chuyên gia Checkpoint",
    description: "Vượt qua 5 Checkpoint cuối chương",
    isUnlocked: false,
    progressCurrent: 1,
    progressTarget: 5,
  },
];

export const mockLearningStatsWeekly: LearningStatsDto = {
  period: "weekly",
  entries: [
    { label: "T2", xpEarned: 40, lessonsCompleted: 2 },
    { label: "T3", xpEarned: 20, lessonsCompleted: 1 },
    { label: "T4", xpEarned: 60, lessonsCompleted: 3 },
    { label: "T5", xpEarned: 0, lessonsCompleted: 0 },
    { label: "T6", xpEarned: 50, lessonsCompleted: 2 },
    { label: "T7", xpEarned: 80, lessonsCompleted: 4 },
    { label: "CN", xpEarned: 30, lessonsCompleted: 1 },
  ],
};

export const mockLearningStatsMonthly: LearningStatsDto = {
  period: "monthly",
  entries: [
    { label: "Tuần 1", xpEarned: 220, lessonsCompleted: 9 },
    { label: "Tuần 2", xpEarned: 180, lessonsCompleted: 7 },
    { label: "Tuần 3", xpEarned: 260, lessonsCompleted: 11 },
    { label: "Tuần 4", xpEarned: 170, lessonsCompleted: 6 },
  ],
};
