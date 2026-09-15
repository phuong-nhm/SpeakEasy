export type LeaderboardDivision = "Bronze" | "Silver" | "Gold" | "Diamond";

export type LeaderboardScope = "weekly" | "friends";

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  userName: string;
  fullName?: string;
  avatarUrl?: string;
  xpThisPeriod: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardResultDto {
  scope: LeaderboardScope;
  division: LeaderboardDivision;
  entries: LeaderboardEntryDto[];
  currentUserRank?: number;
}
