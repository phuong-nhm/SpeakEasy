import { mockLessonMap } from "../mock/mockLessonData";
import {
  AiFeedbackDto,
  ExerciseType,
  GrammarFormType,
  GrammarNoteDto,
  SentenceExerciseDto,
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

const createCheckpointMockPool = (chapterId: string): SentenceExerciseDto[] => [
  {
    id: `${chapterId}-cp-1`,
    lessonId: `${chapterId}-lesson-1`,
    sectionType: 1,
    exerciseType: ExerciseType.WordOrder,
    promptText: "Sắp xếp từ thành câu hoàn chỉnh.",
    questionText: "Sắp xếp từ thành câu hoàn chỉnh.",
    correctSentence: "She goes to school by bus.",
    correctAnswer: "She goes to school by bus.",
    wordBank: ["goes", "to", "school", "She", "by", "bus."],
  },
  {
    id: `${chapterId}-cp-2`,
    lessonId: `${chapterId}-lesson-1`,
    sectionType: 1,
    exerciseType: ExerciseType.FillInBlank,
    promptText: "Điền từ còn thiếu.",
    questionText: "He ____ English every evening.",
    correctSentence: "studies",
    correctAnswer: "studies",
    options: ["study", "studies", "studied", "studying"],
  },
  {
    id: `${chapterId}-cp-3`,
    lessonId: `${chapterId}-lesson-1`,
    sectionType: 1,
    exerciseType: ExerciseType.AnswerQuestion,
    promptText: "Trả lời đầy đủ một câu tiếng Anh.",
    questionText: "What do you do after school?",
    correctSentence: "I do my homework after school.",
    correctAnswer: "I do my homework after school.",
  },
  {
    id: `${chapterId}-cp-4`,
    lessonId: `${chapterId}-lesson-2`,
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    promptText: "Dịch câu sau sang tiếng Anh.",
    vietnameseTranslation: "Tôi thường dậy lúc sáu giờ.",
    correctSentence: "I usually wake up at six o'clock.",
    correctAnswer: "I usually wake up at six o'clock.",
  },
  {
    id: `${chapterId}-cp-5`,
    lessonId: `${chapterId}-lesson-2`,
    sectionType: 1,
    exerciseType: ExerciseType.ListenChoose,
    dialogueGroupId: `${chapterId}-dialogue-a`,
    orderInGroup: 1,
    promptText: "Nghe và chọn câu đúng.",
    audioUrl: "/audio/checkpoint-dialogue-a1.mp3",
    listenOptions: [
      "I am going to the bookstore.",
      "I am going to the post office.",
    ],
    correctSentence: "I am going to the bookstore.",
  },
  {
    id: `${chapterId}-cp-6`,
    lessonId: `${chapterId}-lesson-2`,
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    dialogueGroupId: `${chapterId}-dialogue-a`,
    orderInGroup: 2,
    promptText: "Dịch câu tiếng Việt.",
    vietnameseTranslation: "Tôi sẽ mua một quyển từ điển.",
    correctSentence: "I will buy a dictionary.",
    shuffledWords: ["I", "will", "buy", "a", "dictionary."],
  },
  {
    id: `${chapterId}-cp-7`,
    lessonId: `${chapterId}-lesson-3`,
    sectionType: 1,
    exerciseType: ExerciseType.WordOrder,
    promptText: "Sắp xếp từ thành câu hoàn chỉnh.",
    questionText: "Sắp xếp từ thành câu hoàn chỉnh.",
    correctSentence: "We are planning a short trip.",
    correctAnswer: "We are planning a short trip.",
    wordBank: ["planning", "trip.", "are", "a", "short", "We"],
  },
  {
    id: `${chapterId}-cp-8`,
    lessonId: `${chapterId}-lesson-3`,
    sectionType: 1,
    exerciseType: ExerciseType.FillInBlank,
    promptText: "Điền từ còn thiếu.",
    questionText: "They ____ football every Sunday.",
    correctSentence: "play",
    correctAnswer: "play",
    options: ["plays", "play", "played", "playing"],
  },
  {
    id: `${chapterId}-cp-9`,
    lessonId: `${chapterId}-lesson-3`,
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    promptText: "Dịch câu sau sang tiếng Anh.",
    vietnameseTranslation: "Cô ấy đang đọc một cuốn sách mới.",
    correctSentence: "She is reading a new book.",
    correctAnswer: "She is reading a new book.",
  },
  {
    id: `${chapterId}-cp-10`,
    lessonId: `${chapterId}-lesson-4`,
    sectionType: 1,
    exerciseType: ExerciseType.AnswerQuestion,
    promptText: "Viết câu trả lời đầy đủ.",
    questionText: "Where do you usually study?",
    correctSentence: "I usually study in my room.",
    correctAnswer: "I usually study in my room.",
  },
  {
    id: `${chapterId}-cp-11`,
    lessonId: `${chapterId}-lesson-4`,
    sectionType: 1,
    exerciseType: ExerciseType.ListenChoose,
    dialogueGroupId: `${chapterId}-dialogue-b`,
    orderInGroup: 1,
    promptText: "Nghe và chọn câu đúng.",
    audioUrl: "/audio/checkpoint-dialogue-b1.mp3",
    listenOptions: ["Can we meet at 7 p.m.?", "Can we meet at 8 p.m.?"],
    correctSentence: "Can we meet at 7 p.m.?",
  },
  {
    id: `${chapterId}-cp-12`,
    lessonId: `${chapterId}-lesson-4`,
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    dialogueGroupId: `${chapterId}-dialogue-b`,
    orderInGroup: 2,
    promptText: "Dịch câu tiếng Việt.",
    vietnameseTranslation: "Được, tôi sẽ đến đúng giờ.",
    correctSentence: "Okay, I will be on time.",
    shuffledWords: ["Okay,", "I", "will", "be", "on", "time."],
  },
  {
    id: `${chapterId}-cp-13`,
    lessonId: `${chapterId}-lesson-5`,
    sectionType: 1,
    exerciseType: ExerciseType.WordOrder,
    promptText: "Sắp xếp từ thành câu hoàn chỉnh.",
    questionText: "Sắp xếp từ thành câu hoàn chỉnh.",
    correctSentence: "My father cooks dinner on weekends.",
    correctAnswer: "My father cooks dinner on weekends.",
    wordBank: ["cooks", "on", "father", "weekends.", "My", "dinner"],
  },
  {
    id: `${chapterId}-cp-14`,
    lessonId: `${chapterId}-lesson-5`,
    sectionType: 1,
    exerciseType: ExerciseType.FillInBlank,
    promptText: "Điền từ còn thiếu.",
    questionText: "The children ____ in the park now.",
    correctSentence: "are playing",
    correctAnswer: "are playing",
    options: ["play", "played", "are playing", "plays"],
  },
  {
    id: `${chapterId}-cp-15`,
    lessonId: `${chapterId}-lesson-5`,
    sectionType: 1,
    exerciseType: ExerciseType.AnswerQuestion,
    promptText: "Trả lời câu hỏi bằng một câu hoàn chỉnh.",
    questionText: "Why are you learning English?",
    correctSentence: "I am learning English to communicate better.",
    correctAnswer: "I am learning English to communicate better.",
  },
  {
    id: `${chapterId}-cp-16`,
    lessonId: `${chapterId}-lesson-6`,
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    promptText: "Dịch câu sau sang tiếng Anh.",
    vietnameseTranslation: "Chúng tôi sẽ hoàn thành bài tập vào tối nay.",
    correctSentence: "We will finish the homework tonight.",
    correctAnswer: "We will finish the homework tonight.",
  },
  {
    id: `${chapterId}-cp-17`,
    lessonId: `${chapterId}-lesson-6`,
    sectionType: 1,
    exerciseType: ExerciseType.WordOrder,
    promptText: "Sắp xếp từ thành câu hoàn chỉnh.",
    questionText: "Sắp xếp từ thành câu hoàn chỉnh.",
    correctSentence: "There is a new cafe near my house.",
    correctAnswer: "There is a new cafe near my house.",
    wordBank: ["my", "There", "house.", "new", "near", "a", "is", "cafe"],
  },
  {
    id: `${chapterId}-cp-18`,
    lessonId: `${chapterId}-lesson-6`,
    sectionType: 1,
    exerciseType: ExerciseType.FillInBlank,
    promptText: "Điền từ còn thiếu.",
    questionText: "I ____ my grandparents every month.",
    correctSentence: "visit",
    correctAnswer: "visit",
    options: ["visits", "visited", "visit", "visiting"],
  },
];

const shuffleItems = <T>(items: T[]): T[] => {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }

  return cloned;
};

const mockGrammarNoteMap: Record<string, GrammarNoteDto | null> = {
  "lesson-1": {
    id: "gn-lesson-1",
    lessonId: "lesson-1",
    title: "To be - Câu khẳng định, phủ định, nghi vấn",
    usageNote:
      "Dùng để giới thiệu bản thân, mô tả nghề nghiệp, địa điểm và trạng thái hiện tại.",
    structures: [
      {
        id: "gn-lesson-1-a",
        formType: GrammarFormType.Affirmative,
        formula: "I am / You are / He is ...",
        example: "I am a student.",
        orderIndex: 1,
      },
      {
        id: "gn-lesson-1-b",
        formType: GrammarFormType.Negative,
        formula: "Subject + am not / is not / are not",
        example: "She is not at home.",
        orderIndex: 2,
      },
      {
        id: "gn-lesson-1-c",
        formType: GrammarFormType.Question,
        formula: "Am / Is / Are + subject + ... ?",
        example: "Are you ready?",
        orderIndex: 3,
      },
    ],
  },
  "lesson-2": null,
};

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

  getCheckpointExercises: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const pool = createCheckpointMockPool(chapterId);
          const count = 15 + Math.floor(Math.random() * 6);
          resolve(shuffleItems(pool).slice(0, count));
        }, 260);
      });
    }

    const response = await fetch(
      `/api/app/sentence-exercise/for-checkpoint?chapterId=${encodeURIComponent(chapterId)}&count=20`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load checkpoint exercises.");
    }

    return response.json();
  },

  getGrammarNoteByLesson: async (
    lessonId: string,
  ): Promise<GrammarNoteDto | null> => {
    if (!USE_MOCK) {
      const response = await fetch(
        `/api/app/grammar-note/get-by-lesson?lessonId=${encodeURIComponent(lessonId)}`,
        {
          method: "GET",
        },
      );

      if (response.status === 204 || response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to load grammar note.");
      }

      const data = await response.json();
      return data ?? null;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockGrammarNoteMap[lessonId] ?? null);
      }, 200);
    });
  },
};
