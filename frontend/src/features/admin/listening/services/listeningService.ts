import {
  CreateUpdateListeningPassageDto,
  CreateUpdateListeningQuestionDto,
  ListeningPassageDto,
  ListeningQuestionType,
} from "@/features/admin/listening/types/listening";
import { mockListeningPassages } from "@/features/admin/listening/mock/mockListeningData";

const USE_MOCK = true;

let listeningPassages: ListeningPassageDto[] = [...mockListeningPassages];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = (prefix: string) =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const cloneQuestion = (question: ListeningPassageDto["questions"][number]) => ({
  ...question,
});

const clonePassage = (passage: ListeningPassageDto): ListeningPassageDto => ({
  ...passage,
  questions: [...passage.questions]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(cloneQuestion),
});

const normalizeQuestion = (
  question: CreateUpdateListeningQuestionDto,
  passageId: string,
  index: number,
) => {
  const normalizedQuestionText = question.questionText.trim();
  const normalized: ListeningPassageDto["questions"][number] = {
    id: generateId("listen-q"),
    passageId,
    questionType: question.questionType,
    questionText: normalizedQuestionText,
    optionA: question.optionA?.trim() || undefined,
    optionB: question.optionB?.trim() || undefined,
    optionC: question.optionC?.trim() || undefined,
    optionD: question.optionD?.trim() || undefined,
    correctOptionKey: question.correctOptionKey?.trim() || undefined,
    orderIndex: question.orderIndex || index + 1,
  };

  return normalized;
};

const validateQuestion = (question: CreateUpdateListeningQuestionDto) => {
  if (!question.questionText?.trim()) {
    throw new Error("QuestionText là bắt buộc cho mọi câu hỏi nghe.");
  }

  if (question.questionType === ListeningQuestionType.MultipleChoice) {
    if (
      !question.optionA?.trim() ||
      !question.optionB?.trim() ||
      !question.optionC?.trim() ||
      !question.optionD?.trim()
    ) {
      throw new Error(
        "MultipleChoice cần đủ Option A-D trước khi lưu bài nghe.",
      );
    }

    if (!question.correctOptionKey?.trim()) {
      throw new Error("MultipleChoice cần chọn đáp án đúng.");
    }
  }
};

const validatePassage = (input: CreateUpdateListeningPassageDto) => {
  if (!input.chapterId?.trim()) {
    throw new Error("Chapter là bắt buộc.");
  }

  if (!input.title?.trim()) {
    throw new Error("Tiêu đề bài nghe là bắt buộc.");
  }

  if (!input.transcript?.trim()) {
    throw new Error("Transcript là bắt buộc.");
  }

  if (!Array.isArray(input.questions) || input.questions.length === 0) {
    throw new Error("Bài nghe phải có ít nhất 1 câu hỏi.");
  }

  input.questions.forEach(validateQuestion);
};

const sortPassages = (passages: ListeningPassageDto[]) =>
  [...passages].sort((a, b) => a.title.localeCompare(b.title));

export const listeningService = {
  generateAudioFromTranscript: async (transcript: string): Promise<string> => {
    await delay(500);

    if (!transcript.trim()) {
      throw new Error("Transcript không được để trống.");
    }

    if (USE_MOCK) {
      const slug = transcript
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

      return `https://example.com/audio/generated/${slug || "listening"}.mp3`;
    }

    throw new Error("Real API for listening audio generation is not wired.");
  },

  getList: async (): Promise<ListeningPassageDto[]> => {
    await delay();
    return sortPassages(listeningPassages).map(clonePassage);
  },

  getByChapterId: async (chapterId: string): Promise<ListeningPassageDto[]> => {
    await delay();
    return sortPassages(
      listeningPassages.filter((passage) => passage.chapterId === chapterId),
    ).map(clonePassage);
  },

  create: async (
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    await delay();
    validatePassage(input);

    if (
      listeningPassages.some((passage) => passage.chapterId === input.chapterId)
    ) {
      throw new Error("Mỗi Chapter chỉ được phép có 1 bài nghe.");
    }

    const passageId = generateId("listen");
    const newPassage: ListeningPassageDto = {
      id: passageId,
      chapterId: input.chapterId,
      title: input.title.trim(),
      transcript: input.transcript.trim(),
      audioUrl: input.audioUrl?.trim() || undefined,
      questions: input.questions.map((question, index) =>
        normalizeQuestion(question, passageId, index),
      ),
    };

    listeningPassages.push(newPassage);
    return clonePassage(newPassage);
  },

  update: async (
    id: string,
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    await delay();
    validatePassage(input);

    const existingIndex = listeningPassages.findIndex(
      (passage) => passage.id === id,
    );
    if (existingIndex === -1) {
      throw new Error("Listening passage not found.");
    }

    const duplicateChapter = listeningPassages.find(
      (passage) => passage.chapterId === input.chapterId && passage.id !== id,
    );
    if (duplicateChapter) {
      throw new Error("Mỗi Chapter chỉ được phép có 1 bài nghe.");
    }

    const updatedPassage: ListeningPassageDto = {
      id,
      chapterId: input.chapterId,
      title: input.title.trim(),
      transcript: input.transcript.trim(),
      audioUrl: input.audioUrl?.trim() || undefined,
      questions: input.questions.map((question, index) =>
        normalizeQuestion(question, id, index),
      ),
    };

    listeningPassages[existingIndex] = updatedPassage;
    return clonePassage(updatedPassage);
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    listeningPassages = listeningPassages.filter(
      (passage) => passage.id !== id,
    );
  },
};
