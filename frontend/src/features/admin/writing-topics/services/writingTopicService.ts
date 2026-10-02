import { apiClient } from "@/lib/apiClient";
import { levelService } from "@/features/admin/levels/services/levelService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import {
  WritingTopicDto,
  CreateUpdateWritingTopicDto,
  WritingTopicType,
} from "@/features/admin/writing-topics/types/writing-topic";

const mapTopic = (
  topic: Partial<WritingTopicDto> | null | undefined,
): WritingTopicDto | null => {
  if (!topic) return null;

  return {
    id: String(topic.id ?? topic.id ?? ""),
    chapterId: String(topic.chapterId ?? topic.chapterId ?? ""),
    topicType: Number(
      topic.topicType ?? topic.topicType ?? WritingTopicType.Weekly,
    ),
    promptTitle: String(topic.promptTitle ?? topic.promptTitle ?? ""),
  };
};

export const writingTopicService = {
  async getTopics(): Promise<WritingTopicDto[]> {
    const levels = await levelService.getList();
    const topicMap = new Map<string, WritingTopicDto>();

    for (const level of levels) {
      const chapters = await chapterService.getByLevelId(level.id);

      for (const chapter of chapters) {
        for (const topicType of [
          WritingTopicType.Weekly,
          WritingTopicType.Monthly,
        ]) {
          try {
            const topic = await apiClient<WritingTopicDto | null>(
              `/api/app/writing-topic/available-topic/${encodeURIComponent(chapter.id)}`,
            );

            const normalized = mapTopic(topic);
            if (!normalized || !normalized.id) {
              continue;
            }

            topicMap.set(normalized.id, normalized);
          } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (!/TopicNotAvailable|404|Not Found/i.test(message)) {
              throw error;
            }
          }
        }
      }
    }

    return Array.from(topicMap.values()).sort((a, b) =>
      a.chapterId.localeCompare(b.chapterId),
    );
  },

  async createTopic(
    input: CreateUpdateWritingTopicDto,
  ): Promise<WritingTopicDto> {
    return apiClient<WritingTopicDto>("/api/app/writing-topic", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateTopic(
    id: string,
    input: CreateUpdateWritingTopicDto,
  ): Promise<WritingTopicDto> {
    return apiClient<WritingTopicDto>(`/api/app/writing-topic/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient<void>(`/api/app/writing-topic/${id}`, {
      method: "DELETE",
    });
  },
};

export default writingTopicService;
