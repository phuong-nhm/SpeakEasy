export interface LevelDto {
  id: string; // Guid
  name: string;
  description: string;
}

export interface CreateUpdateLevelDto {
  name: string;
  description: string;
}
