import { mockLessonMap } from "../mock/mockLessonData";
import {
  LessonDto,
  LessonSubmitRequest,
  LessonSubmitResponse,
} from "../types/lesson";

export const lessonService = {
  getLessonById: async (lessonId: string): Promise<LessonDto> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lesson = mockLessonMap[lessonId];
        if (!lesson) {
          reject(new Error("Lesson not found"));
          return;
        }

        resolve(lesson);
      }, 250);
    });
  },

  submitLessonResult: async (
    payload: LessonSubmitRequest,
  ): Promise<LessonSubmitResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          xpEarned: payload.xpEarned,
          accuracyPercent: payload.accuracyPercent,
          lessonsCompleted: 1,
          streakUpdated: payload.heartsLeft > 0,
        });
      }, 400);
    });
  },
};
