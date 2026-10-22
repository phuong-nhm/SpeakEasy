import { apiClient, resolveMediaUrl } from "@/lib/apiClient";
import {
  CreateUpdateListeningPassageDto,
  ListeningPassageDto,
} from "@/features/admin/listening/types/listening";

const normalizePassage = (
  passage: ListeningPassageDto,
): ListeningPassageDto => ({
  ...passage,
  audioUrl: resolveMediaUrl(passage.audioUrl),
});

export const listeningService = {
  generateAudioFromTranscript: async (transcript: string): Promise<string> => {
    if (!transcript?.trim()) {
      throw new Error("Transcript không được để trống.");
    }

    const slug = transcript
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);

    return `https://example.com/audio/generated/${slug || "listening"}.mp3`;
  },

  getList: async (levelId: string): Promise<ListeningPassageDto[]> => {
    if (!levelId) {
      return [];
    }

    const data = await apiClient<ListeningPassageDto[]>(
      `/api/app/listening-passage/by-level/${levelId}`,
    );
    return data.map(normalizePassage);
  },

  getByChapterId: async (chapterId: string): Promise<ListeningPassageDto[]> => {
    if (!chapterId) {
      return [];
    }

    const data = await apiClient<ListeningPassageDto[]>(
      `/api/app/listening-passage/by-chapter/${chapterId}`,
    );
    return data.map(normalizePassage);
  },

  create: async (
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    const data = await apiClient<ListeningPassageDto>(
      "/api/app/listening-passage",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    return normalizePassage(data);
  },
  createMany: async (
    inputs: CreateUpdateListeningPassageDto[],
  ): Promise<ListeningPassageDto[]> => {
    const data = await apiClient<ListeningPassageDto[]>(
      "/api/app/listening-passage/many",
      {
        method: "POST",
        body: JSON.stringify(inputs),
      },
    );
    return data.map(normalizePassage);
  },
  update: async (
    id: string,
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    const data = await apiClient<ListeningPassageDto>(
      `/api/app/listening-passage/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
    return normalizePassage(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/listening-passage/${id}`, {
      method: "DELETE",
    });
  },
};
