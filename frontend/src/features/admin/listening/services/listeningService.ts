import { apiClient } from "@/lib/apiClient";
import {
  CreateUpdateListeningPassageDto,
  ListeningPassageDto,
} from "@/features/admin/listening/types/listening";

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

    return apiClient<ListeningPassageDto[]>(
      `/api/app/listening-passage/by-level/${levelId}`,
    );
  },

  getByChapterId: async (chapterId: string): Promise<ListeningPassageDto[]> => {
    if (!chapterId) {
      return [];
    }

    return apiClient<ListeningPassageDto[]>(
      `/api/app/listening-passage/by-chapter/${chapterId}`,
    );
  },

  create: async (
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    return apiClient<ListeningPassageDto>("/api/app/listening-passage", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update: async (
    id: string,
    input: CreateUpdateListeningPassageDto,
  ): Promise<ListeningPassageDto> => {
    return apiClient<ListeningPassageDto>(`/api/app/listening-passage/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/listening-passage/${id}`, {
      method: "DELETE",
    });
  },
};
