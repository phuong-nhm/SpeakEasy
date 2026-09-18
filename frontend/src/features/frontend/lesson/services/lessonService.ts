import { mockLessonMap } from "../mock/mockLessonData";
import {
  AiFeedbackDto,
  ListeningOptionKey,
  ListeningPassageClientDto,
  SubmitListeningEssayRequest,
  SubmitListeningEssayResponse,
  SubmitListeningMultipleChoiceRequest,
  SubmitListeningMultipleChoiceResponse,
  LessonDto,
  LessonSubmitRequest,
  LessonSubmitResponse,
} from "../types/lesson";

const USE_MOCK = true;

const mockPassages: Record<string, ListeningPassageClientDto> = {
  default: {
    title: "Long listening passage",
    audioUrl: "/audio/checkpoint-passage.mp3",
    questions: [
      {
        id: "passage-q-1",
        questionType: "MultipleChoice",
        questionText: "What does the speaker say about the weather?",
        optionA: "It is sunny today.",
        optionB: "It is raining heavily.",
        optionC: "It is very cold tonight.",
        optionD: "It will snow tomorrow.",
        orderIndex: 1,
      },
      {
        id: "passage-q-2",
        questionType: "Essay",
        questionText: "Write one sentence about the main idea you hear.",
        orderIndex: 2,
      },
      {
        id: "passage-q-3",
        questionType: "MultipleChoice",
        questionText: "Who is the speaker meeting after class?",
        optionA: "A friend.",
        optionB: "A teacher.",
        optionC: "A parent.",
        optionD: "A classmate.",
        orderIndex: 3,
      },
    ],
  },
};

const mockMultipleChoiceAnswers: Record<string, ListeningOptionKey> = {
  "passage-q-1": "B",
  "passage-q-3": "D",
};

const createMockFeedback = (content: string): AiFeedbackDto => {
  const trimmedContent = content.trim();
  const score = Math.min(95, Math.max(65, trimmedContent.length * 2));

  return {
    band: score >= 90 ? "8.0" : score >= 80 ? "7.0" : "6.0",
    score,
    errors:
      trimmedContent.length < 20
        ? [
            {
              sentence: trimmedContent,
              issue: "Câu trả lời còn quá ngắn",
              suggestion: "Hãy thêm chi tiết hơn về nội dung bạn nghe được.",
            },
          ]
        : [],
    suggestion: "Tập trung nhắc lại ý chính và dùng câu hoàn chỉnh.",
    improvedText: `${trimmedContent} (improved mock version)`,
  };
};

const clonePassage = (
  passage: ListeningPassageClientDto,
): ListeningPassageClientDto => ({
  ...passage,
  questions: [...passage.questions].sort((a, b) => a.orderIndex - b.orderIndex),
});

export const lessonService = {
  getLessonById: async (lessonId: string): Promise<LessonDto> => {
    if (!USE_MOCK) {
      throw new Error("Real lesson API is not connected yet.");
    }

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
    if (!USE_MOCK) {
      throw new Error("Real lesson API is not connected yet.");
    }

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

  getPassageByChapter: async (
    chapterId: string,
  ): Promise<ListeningPassageClientDto> => {
    if (!USE_MOCK) {
      throw new Error("Real listening passage API is not connected yet.");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(clonePassage(mockPassages[chapterId] ?? mockPassages.default));
      }, 250);
    });
  },

  submitMultipleChoice: async (
    input: SubmitListeningMultipleChoiceRequest,
  ): Promise<SubmitListeningMultipleChoiceResponse> => {
    if (!USE_MOCK) {
      throw new Error("Real listening answer API is not connected yet.");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const correctOptionKey =
          mockMultipleChoiceAnswers[input.questionId] ?? "A";

        resolve({
          isCorrect: input.selectedOptionKey === correctOptionKey,
          correctOptionKey,
        });
      }, 300);
    });
  },

  submitEssay: async (
    input: SubmitListeningEssayRequest,
  ): Promise<SubmitListeningEssayResponse> => {
    if (!USE_MOCK) {
      throw new Error("Real listening essay API is not connected yet.");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          aiFeedback: createMockFeedback(input.userContent),
        });
      }, 450);
    });
  },
};
