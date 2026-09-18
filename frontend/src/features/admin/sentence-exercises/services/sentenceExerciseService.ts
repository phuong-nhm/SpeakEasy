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
  {
    id: "ex-5",
    lessonId: "les-001",
    sectionType: SectionType.Grammar,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "Could you speak a little slower, please?",
    audioUrl: "https://example.com/audio/ex5.mp3",
    distractorSentence: "Could you speak a little louder, please?",
    dialogueGroupId: "dlg-001",
    orderInGroup: 1,
  },
  {
    id: "ex-6",
    lessonId: "les-001",
    sectionType: SectionType.Grammar,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    correctSentence: "Could you speak a little slower, please?",
    vietnameseTranslation: "Bạn có thể nói chậm hơn một chút được không?",
    dialogueGroupId: "dlg-001",
    orderInGroup: 2,
  },
  {
    id: "ex-7",
    lessonId: "les-002",
    sectionType: SectionType.Review,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "I need a taxi to the airport.",
    audioUrl: "https://example.com/audio/ex7.mp3",
    distractorSentence: "I need a ticket to the airport.",
    dialogueGroupId: "dlg-002",
    orderInGroup: 1,
  },
];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const generateExerciseId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeOptionalText = (value?: string) => value?.trim() || undefined;

const sortExercises = (items: SentenceExerciseDto[]) =>
  [...items].sort((a, b) => {
    const groupA = a.dialogueGroupId ?? "";
    const groupB = b.dialogueGroupId ?? "";

    if (groupA !== groupB) {
      return groupA.localeCompare(groupB);
    }

    const orderA = a.orderInGroup ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.orderInGroup ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.correctSentence.localeCompare(b.correctSentence);
  });

const validateInput = (input: CreateUpdateSentenceExerciseDto) => {
  if (
    input.exerciseType === ExerciseType.AnswerQuestion &&
    !input.promptText?.trim()
  ) {
    throw new Error("Bài tập dạng AnswerQuestion bắt buộc phải có promptText");
  }

  if (
    input.exerciseType === ExerciseType.TranslateFromVietnamese &&
    !input.vietnameseTranslation?.trim()
  ) {
    throw new Error(
      "Bài tập dạng TranslateFromVietnamese bắt buộc phải có vietnameseTranslation",
    );
  }

  if (
    input.exerciseType === ExerciseType.ListenChoose &&
    !input.distractorSentence?.trim()
  ) {
    throw new Error(
      "Bài tập dạng ListenChoose bắt buộc phải có distractorSentence",
    );
  }
};

export const sentenceExerciseService = {
  getByLessonId: async (lessonId: string): Promise<SentenceExerciseDto[]> => {
    await delay();
    return sortExercises(
      mockExercises.filter((ex) => ex.lessonId === lessonId),
    );
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
      validateInput(input);

      const newExercise: SentenceExerciseDto = {
        id: generateExerciseId(),
        lessonId: input.lessonId,
        sectionType: input.sectionType,
        correctSentence: input.correctSentence,
        audioUrl:
          input.audioUrl?.trim() || "https://example.com/audio/default.mp3",
        exerciseType: input.exerciseType,
        promptText: normalizeOptionalText(input.promptText),
        vietnameseTranslation: normalizeOptionalText(
          input.vietnameseTranslation,
        ),
        distractorSentence: normalizeOptionalText(input.distractorSentence),
        dialogueGroupId: normalizeOptionalText(input.dialogueGroupId),
        orderInGroup: input.orderInGroup,
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
    validateInput(input);
    const newExercise: SentenceExerciseDto = {
      id: generateExerciseId(),
      ...input,
      audioUrl:
        input.audioUrl?.trim() || "https://example.com/audio/default.mp3",
      promptText: normalizeOptionalText(input.promptText),
      vietnameseTranslation: normalizeOptionalText(input.vietnameseTranslation),
      distractorSentence: normalizeOptionalText(input.distractorSentence),
      dialogueGroupId: normalizeOptionalText(input.dialogueGroupId),
    };
    mockExercises.push(newExercise);
    return newExercise;
  },

  update: async (
    id: string,
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    await delay();
    validateInput(input);
    let updatedItem: SentenceExerciseDto | null = null;
    mockExercises = mockExercises.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...input,
          audioUrl:
            input.audioUrl?.trim() || "https://example.com/audio/default.mp3",
          promptText: normalizeOptionalText(input.promptText),
          vietnameseTranslation: normalizeOptionalText(
            input.vietnameseTranslation,
          ),
          distractorSentence: normalizeOptionalText(input.distractorSentence),
          dialogueGroupId: normalizeOptionalText(input.dialogueGroupId),
        };
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
