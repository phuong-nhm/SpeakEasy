export interface UserProfileDto {
  id: string;
  userName: string; // IdentityUser.UserName
  fullName?: string; // ghép Surname + Name ở AppService, optional
  avatarUrl?: string;
  currentStreak: number;
  longestStreak?: number;
  totalXp: number;
  gems: number;
  level?: number;
  joinedAt?: string;
}

export interface AchievementDto {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
  isUnlocked: boolean;
  progressCurrent: number;
  progressTarget: number;
  unlockedAt?: string;
}

export interface LearningStatEntryDto {
  label: string;
  xpEarned: number;
  lessonsCompleted: number;
}

export type LearningStatsPeriod = "weekly" | "monthly";

export interface LearningStatsDto {
  period: LearningStatsPeriod;
  entries: LearningStatEntryDto[];
}