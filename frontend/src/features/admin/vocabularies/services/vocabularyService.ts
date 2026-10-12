import {
  VocabularyDto,
  CreateUpdateVocabularyDto,
} from "@/features/admin/vocabularies/types/vocabulary";
import { API_BASE_URL, apiClient, resolveMediaUrl } from "@/lib/apiClient";

const API_BASE_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

const normalizeVocabulary = (vocab: VocabularyDto): VocabularyDto => ({
  ...vocab,
  imageUrl: resolveMediaUrl(vocab.imageUrl),
  audioUrl: resolveMediaUrl(vocab.audioUrl),
});

const toRelativeMediaUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("/")) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === API_BASE_ORIGIN) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return url;
    }
  }

  return `/${url}`;
};

const normalizeInputForWrite = (
  input: CreateUpdateVocabularyDto,
): CreateUpdateVocabularyDto => ({
  ...input,
  imageUrl: toRelativeMediaUrl(input.imageUrl),
  audioUrl: toRelativeMediaUrl(input.audioUrl),
});

export const vocabularyService = {
  getByLessonId: async (lessonId: string): Promise<VocabularyDto[]> => {
    let data: VocabularyDto[];
    try {
      data = await apiClient<VocabularyDto[]>(
        `/api/app/vocabulary/by-lesson/${lessonId}`,
      );
    } catch {
      data = await apiClient<VocabularyDto[]>(
        `/api/app/vocabulary/get-list-by-lesson?lessonId=${encodeURIComponent(lessonId)}`,
      );
    }
    return data.map(normalizeVocabulary);
  },

  create: async (data: CreateUpdateVocabularyDto): Promise<VocabularyDto> => {
    const normalizedInput = normalizeInputForWrite(data);
    const result = await apiClient<VocabularyDto>("/api/app/vocabulary", {
      method: "POST",
      body: JSON.stringify(normalizedInput),
    });
    return normalizeVocabulary(result);
  },

  update: async (
    id: string,
    data: CreateUpdateVocabularyDto,
  ): Promise<VocabularyDto> => {
    const normalizedInput = normalizeInputForWrite(data);
    const result = await apiClient<VocabularyDto>(`/api/app/vocabulary/${id}`, {
      method: "PUT",
      body: JSON.stringify(normalizedInput),
    });
    return normalizeVocabulary(result);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/vocabulary/${id}`, {
      method: "DELETE",
    });
  },

  createMany: async (
    items: CreateUpdateVocabularyDto[],
  ): Promise<VocabularyDto[]> => {
    const normalizedItems = items.map(normalizeInputForWrite);
    const data = await apiClient<VocabularyDto[]>("/api/app/vocabulary/many", {
      method: "POST",
      body: JSON.stringify(normalizedItems),
    });
    return data.map(normalizeVocabulary);
  },
};

export default vocabularyService;
