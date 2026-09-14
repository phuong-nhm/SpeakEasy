import {
  SentenceExerciseDto,
  CreateUpdateSentenceExerciseDto,
  SectionType,
  ExerciseType,
} from "../types/sentence-exercise";

let mockExercises: SentenceExerciseDto[] = [
  {
    id: "ex-1",
    lessonId: "les-001",
    sectionType: SectionType.Grammar,
    exerciseType: ExerciseType.WordOrder,
    correctSentence: "My name is John Smith",
    audioUrl: "https://example.com/audio/ex1.mp3",
  },
  {
    id: "ex-2",
    lessonId: "les-001",
    sectionType: SectionType.Grammar,
    exerciseType: ExerciseType.FillInBlank,
    correctSentence: "She is a teacher",
    audioUrl: "",
  },
  {
    id: "ex-3",
    lessonId: "les-001",
    sectionType: SectionType.Review,
    exerciseType: ExerciseType.AnswerQuestion,
    correctSentence: "I am fine thank you",
    promptText: "How are you today?",
  },
  {
    id: "ex-4",
    lessonId: "les-001",
    sectionType: SectionType.Vocabulary,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    correctSentence: "Nice to meet you",
    vietnameseTranslation: "Rất vui được gặp bạn",
  },
];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const generateExerciseId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const sentenceExerciseService = {
  getByLessonId: async (lessonId: string): Promise<SentenceExerciseDto[]> => {
    await delay();
    return mockExercises.filter((ex) => ex.lessonId === lessonId);
  },

  createMany: async (
    inputs: CreateUpdateSentenceExerciseDto[],
  ): Promise<SentenceExerciseDto[]> => {
    await delay();

    if (!inputs || inputs.length === 0) {
      throw new Error("Danh sách import không được để trống");
    }

    const createdExercises: SentenceExerciseDto[] = [];

    for (const input of inputs) {
      if (
        input.exerciseType === ExerciseType.AnswerQuestion &&
        !input.promptText?.trim()
      ) {
        throw new Error(
          "Bài tập dạng AnswerQuestion bắt buộc phải có promptText",
        );
      }

      if (
        input.exerciseType === ExerciseType.TranslateFromVietnamese &&
        !input.vietnameseTranslation?.trim()
      ) {
        throw new Error(
          "Bài tập dạng TranslateFromVietnamese bắt buộc phải có vietnameseTranslation",
        );
      }

      const newExercise: SentenceExerciseDto = {
        id: generateExerciseId(),
        lessonId: input.lessonId,
        sectionType: input.sectionType,
        correctSentence: input.correctSentence,
        audioUrl:
          input.audioUrl?.trim() || "https://example.com/audio/default.mp3",
        exerciseType: input.exerciseType,
        promptText: input.promptText,
        vietnameseTranslation: input.vietnameseTranslation,
      };

      createdExercises.push(newExercise);
    }

    mockExercises.push(...createdExercises);
    return createdExercises;
  },

  create: async (
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    await delay();
    const newExercise: SentenceExerciseDto = {
      id: generateExerciseId(),
      ...input,
      audioUrl:
        input.audioUrl?.trim() || "https://example.com/audio/default.mp3",
    };
    mockExercises.push(newExercise);
    return newExercise;
  },

  update: async (
    id: string,
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    await delay();
    let updatedItem: SentenceExerciseDto | null = null;
    mockExercises = mockExercises.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...input };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) throw new Error("Exercise not found");
    return updatedItem;
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    mockExercises = mockExercises.filter((item) => item.id !== id);
  },
};
