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

export const sentenceExerciseService = {
  getByLessonId: async (lessonId: string): Promise<SentenceExerciseDto[]> => {
    await delay();
    return mockExercises.filter((ex) => ex.lessonId === lessonId);
  },

  create: async (
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    await delay();
    const newExercise: SentenceExerciseDto = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `ex-${Date.now()}`,
      ...input,
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
