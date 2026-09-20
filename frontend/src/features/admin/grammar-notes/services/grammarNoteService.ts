import {
  CreateUpdateGrammarNoteDto,
  GrammarNoteDto,
} from "@/features/admin/grammar-notes/types/grammar-note";
import { mockGrammarNotes } from "@/features/admin/grammar-notes/mock/mockGrammarNoteData";

const USE_MOCK = true;

let mockData: GrammarNoteDto[] = [...mockGrammarNotes];

export const grammarNoteService = {
  getByLessonId: async (lessonId: string): Promise<GrammarNoteDto[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!USE_MOCK) {
      return [];
    }

    return mockData
      .filter((note) => note.lessonId === lessonId)
      .sort((a, b) => a.title.localeCompare(b.title));
  },

  getList: async (): Promise<GrammarNoteDto[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!USE_MOCK) {
      return [];
    }

    return [...mockData].sort((a, b) => a.title.localeCompare(b.title));
  },

  create: async (
    input: CreateUpdateGrammarNoteDto,
  ): Promise<GrammarNoteDto> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!USE_MOCK) {
      throw new Error("Mock mode is disabled for grammar note service.");
    }

    const normalizedStructures = (input.structures ?? []).map(
      (item, index) => ({
        ...item,
        id:
          item.id ??
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `gs-${Date.now()}-${index}`),
        orderIndex: index + 1,
      }),
    );

    const duplicate = mockData.find((note) => note.lessonId === input.lessonId);
    if (duplicate) {
      const updated = {
        ...duplicate,
        title: input.title,
        usageNote: input.usageNote?.trim() || undefined,
        structures: normalizedStructures,
      };
      mockData = mockData.map((note) =>
        note.id === duplicate.id ? updated : note,
      );
      return updated;
    }

    const newItem: GrammarNoteDto = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `gn-${Date.now()}`,
      lessonId: input.lessonId,
      title: input.title,
      usageNote: input.usageNote?.trim() || undefined,
      structures: normalizedStructures,
    };

    mockData.push(newItem);
    return newItem;
  },

  update: async (
    id: string,
    input: CreateUpdateGrammarNoteDto,
  ): Promise<GrammarNoteDto> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!USE_MOCK) {
      throw new Error("Mock mode is disabled for grammar note service.");
    }

    const normalizedStructures = (input.structures ?? []).map(
      (item, index) => ({
        ...item,
        id:
          item.id ??
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `gs-${Date.now()}-${index}`),
        orderIndex: index + 1,
      }),
    );

    const updated: GrammarNoteDto = {
      id,
      lessonId: input.lessonId,
      title: input.title,
      usageNote: input.usageNote?.trim() || undefined,
      structures: normalizedStructures,
    };

    mockData = mockData.map((note) => (note.id === id ? updated : note));
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!USE_MOCK) {
      return;
    }

    mockData = mockData.filter((note) => note.id !== id);
  },
};
