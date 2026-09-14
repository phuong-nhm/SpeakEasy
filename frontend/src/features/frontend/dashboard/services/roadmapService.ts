import { mockRoadmapLevels } from "../mock/mockRoadmapData";
import { LevelDto } from "../types/roadmap";

export const roadmapService = {
  getRoadmapLevels: async (): Promise<LevelDto[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRoadmapLevels);
      }, 250);
    });
  },

  getCurrentLevel: async (): Promise<LevelDto> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRoadmapLevels[0]);
      }, 250);
    });
  },
};
