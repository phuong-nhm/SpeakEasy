import { apiClient } from "@/lib/apiClient";
import {
  CheckSentenceAnswerRequest,
  GrammarNoteDto,
  LessonContentDto,
  ListeningPassageClientDto,
  SentenceExerciseDto,
  SubmitListeningEssayRequest,
  SubmitListeningEssayResponse,
  SubmitListeningMultipleChoiceRequest,
  SubmitListeningMultipleChoiceResponse,
  VocabularyDto,
  VocabularyQuizDto,
  SubmitWritingRequest,
  UserWritingDto,
  WritingTopicDto,
  WritingTopicType,
  CheckMatchingAnswerRequest,
  MatchingGameDto,
} from "../types/lesson";
import { UserProgressDto } from "../../dashboard/types/roadmap";
export const lessonService = {
  // ===== LESSON CONTENT (gộp Lesson + Vocabularies + Sentences) =====
  getLessonContent: async (lessonId: string): Promise<LessonContentDto> => {
    return apiClient<LessonContentDto>(
      `/api/app/lesson/lesson-content/${lessonId}`,
      { method: "GET" },
    );
  },

  // submitLessonResult: async (
  //   payload: LessonSubmitRequest,
  // ): Promise<LessonSubmitResponse> => {
  //   return apiClient<LessonSubmitResponse>("/api/app/lesson", {
  //     method: "POST",
  //     body: JSON.stringify(payload),
  //   });
  // },

  // ===== VOCABULARY =====
  getVocabularyByLesson: async (lessonId: string): Promise<VocabularyDto[]> => {
    return apiClient<VocabularyDto[]>(
      `/api/app/vocabulary/by-lesson/${lessonId}`,
      { method: "GET" },
    );
  },

  getVocabularyQuizBatch: async (
    lessonId: string,
  ): Promise<VocabularyQuizDto[]> => {
    return apiClient<VocabularyQuizDto[]>(
      `/api/app/vocabulary/quiz-batch/${lessonId}`,
      { method: "GET" },
    );
  },

  // ===== SENTENCE EXERCISE =====
  submitSentenceAnswer: async (
    input: CheckSentenceAnswerRequest,
  ): Promise<boolean> => {
    return apiClient<boolean>("/api/app/sentence-exercise/check-answer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getDialogueByChapter: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-dialogue/${chapterId}`,
      { method: "GET" },
    );
  },

  getCheckpointExercises: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-checkpoint/${chapterId}?count=20`,
      { method: "GET" },
    );
  },

  // ===== LISTENING PASSAGE =====
  getPassageByChapter: async (
    chapterId: string,
  ): Promise<ListeningPassageClientDto> => {
    return apiClient<ListeningPassageClientDto>(
      `/api/app/listening-passage/by-chapter/${chapterId}`,
      { method: "GET" },
    );
  },

  submitMultipleChoice: async (
    input: SubmitListeningMultipleChoiceRequest,
  ): Promise<SubmitListeningMultipleChoiceResponse> => {
    return apiClient<SubmitListeningMultipleChoiceResponse>(
      "/api/app/user-listening-answer/submit-multiple-choice",
      { method: "POST", body: JSON.stringify(input) },
    );
  },

  submitEssay: async (
    input: SubmitListeningEssayRequest,
  ): Promise<SubmitListeningEssayResponse> => {
    return apiClient<SubmitListeningEssayResponse>(
      "/api/app/user-listening-answer/submit-essay",
      { method: "POST", body: JSON.stringify(input) },
    );
  },

  // ===== GRAMMAR NOTE =====
  getGrammarNoteByLesson: async (
    lessonId: string,
  ): Promise<GrammarNoteDto | null> => {
    try {
      return await apiClient<GrammarNoteDto>(
        `/api/app/grammar-note/get-by-lesson?lessonId=${encodeURIComponent(lessonId)}`,
        { method: "GET" },
      );
    } catch (error) {
      const apiError = error as Error & { status?: number };
      if (apiError.status === 204 || apiError.status === 404) {
        return null;
      }
      throw error;
    }
  },
  // ===== WRITING TOPIC =====
  getAvailableWritingTopic: async (
    chapterId: string,
    topicType: WritingTopicType,
  ): Promise<WritingTopicDto> => {
    return apiClient<WritingTopicDto>(
      `/api/app/writing-topic/available-topic/${chapterId}?topicType=${topicType}`,
      { method: "GET" },
    );
  },

  submitWriting: async (
    input: SubmitWritingRequest,
  ): Promise<UserWritingDto> => {
    return apiClient<UserWritingDto>("/api/app/user-writing/submit-writing", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  markLessonCompleted: async (lessonId: string): Promise<void> => {
    return apiClient<void>(
      `/api/app/user-progress/mark-lesson-completed/${lessonId}`,
      { method: "POST" },
    );
  },
  getProgressByChapter: async (
    chapterId: string,
  ): Promise<UserProgressDto[]> => {
    return apiClient<UserProgressDto[]>(
      `/api/app/user-progress/progress-by-chapter/${chapterId}`,
      { method: "GET" },
    );
  },

  // ===== MATCHING GAME (Passive Recall) =====
  getMatchingGameForSummary: async (
    currentLessonId: string,
  ): Promise<MatchingGameDto> => {
    return apiClient<MatchingGameDto>(
      `/api/app/matching-game/game-for-summary/${currentLessonId}`,
      { method: "GET" },
    );
  },

  checkMatchingAnswer: async (
    input: CheckMatchingAnswerRequest,
  ): Promise<boolean> => {
    return apiClient<boolean>("/api/app/matching-game/check-answer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  getMatchingGameForChapter: async (
    chapterId: string,
    count?: number,
  ): Promise<MatchingGameDto> => {
    const query = count ? `?count=${count}` : "";
    return apiClient<MatchingGameDto>(
      `/api/app/matching-game/game-for-chapter/${chapterId}${query}`,
      { method: "GET" },
    );
  },
};
