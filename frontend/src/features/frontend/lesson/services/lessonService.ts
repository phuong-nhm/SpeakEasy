import { apiClient, resolveMediaUrl } from "@/lib/apiClient";
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
const normalizeVocabulary = (vocab: VocabularyDto): VocabularyDto => ({
  ...vocab,
  imageUrl: resolveMediaUrl(vocab.imageUrl),
  audioUrl: resolveMediaUrl(vocab.audioUrl),
});

const normalizeVocabularyQuiz = (
  quiz: VocabularyQuizDto,
): VocabularyQuizDto => ({
  ...quiz,
  imageUrl: resolveMediaUrl(quiz.imageUrl),
  audioUrl: resolveMediaUrl(quiz.audioUrl),
});

const normalizeSentenceExercise = (
  exercise: SentenceExerciseDto,
): SentenceExerciseDto => ({
  ...exercise,
  audioUrl: resolveMediaUrl(exercise.audioUrl),
});

const normalizeLessonContent = (
  content: LessonContentDto,
): LessonContentDto => ({
  ...content,
  vocabularies: content.vocabularies.map(normalizeVocabulary),
  sentences: content.sentences.map(normalizeSentenceExercise),
});

const normalizePassage = (
  passage: ListeningPassageClientDto,
): ListeningPassageClientDto => ({
  ...passage,
  audioUrl: resolveMediaUrl(passage.audioUrl) ?? passage.audioUrl,
});
export const lessonService = {
  // ===== LESSON CONTENT (gộp Lesson + Vocabularies + Sentences) =====
  getLessonContent: async (lessonId: string): Promise<LessonContentDto> => {
    const data = await apiClient<LessonContentDto>(
      `/api/app/lesson/lesson-content/${lessonId}`,
      { method: "GET" },
    );
    return normalizeLessonContent(data);
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
    const data = await apiClient<VocabularyDto[]>(
      `/api/app/vocabulary/by-lesson/${lessonId}`,
      { method: "GET" },
    );
    return data.map(normalizeVocabulary);
  },

  getVocabularyQuizBatch: async (
    lessonId: string,
  ): Promise<VocabularyQuizDto[]> => {
    const data = await apiClient<VocabularyQuizDto[]>(
      `/api/app/vocabulary/quiz-batch/${lessonId}`,
      { method: "GET" },
    );
    return data.map(normalizeVocabularyQuiz);
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
    const data = await apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-dialogue/${chapterId}`,
      { method: "GET" },
    );
    return data.map(normalizeSentenceExercise);
  },

  getCheckpointExercises: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    const data = await apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-checkpoint/${chapterId}?count=20`,
      { method: "GET" },
    );
    return data.map(normalizeSentenceExercise);
  },
  // ===== LISTENING PASSAGE =====
  getPassageByChapter: async (
    chapterId: string,
  ): Promise<ListeningPassageClientDto> => {
    const data = await apiClient<ListeningPassageClientDto>(
      `/api/app/listening-passage/for-learner/${chapterId}`,
      { method: "GET" },
    );
    return normalizePassage(data);
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
        `/api/app/grammar-note/by-lesson/${encodeURIComponent(lessonId)}`,
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
  getPartProgress: async (lessonId: string) => {
    return apiClient<{
      lessonId: string;
      isVocabularyCompleted: boolean;
      isGrammarCompleted: boolean;
      isComprehensiveCompleted: boolean;
    }>(`/api/app/user-lesson-part-progress/by-lesson/${lessonId}`, {
      method: "GET",
    });
  },

  markPartCompleted: async (
    lessonId: string,
    part: 0 | 1 | 2,
  ): Promise<void> => {
    return apiClient<void>(
      "/api/app/user-lesson-part-progress/mark-part-completed",
      {
        method: "POST",
        body: JSON.stringify({ lessonId, part }),
      },
    );
  },
};
