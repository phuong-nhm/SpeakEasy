import {
  WritingTopicDto,
  CreateUpdateWritingTopicDto,
  WritingTopicType,
} from "@/features/admin/writing-topics/types/writing-topic";

// Mock Data duy nhất cho WritingTopic
let mockWritingTopics: WritingTopicDto[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    chapterId: "chap-001",
    topicType: WritingTopicType.Weekly,
    promptTitle: "Describe your best friend and why they are important to you.",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    chapterId: "chap-002",
    topicType: WritingTopicType.Monthly,
    promptTitle:
      "Write an essay about the impact of social media on modern relationships.",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    chapterId: "4ba85f64-5717-4562-b3fc-2c963f66afa7",
    topicType: WritingTopicType.Weekly,
    promptTitle: "Discuss the pros and cons of working remotely from home.",
  },
];

// Helper giả lập delay API 200ms
const delay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const writingTopicService = {
  // GET /api/app/writing-topic
  async getTopics(): Promise<WritingTopicDto[]> {
    await delay();
    return [...mockWritingTopics];
  },

  // POST /api/app/writing-topic
  async createTopic(
    input: CreateUpdateWritingTopicDto,
  ): Promise<WritingTopicDto> {
    await delay();
    const newTopic: WritingTopicDto = {
      id: crypto.randomUUID(),
      ...input,
    };
    mockWritingTopics.push(newTopic);
    return newTopic;
  },

  // PUT /api/app/writing-topic/{id}
  async updateTopic(
    id: string,
    input: CreateUpdateWritingTopicDto,
  ): Promise<WritingTopicDto> {
    await delay();
    const index = mockWritingTopics.findIndex(
      (t) => String(t.id) === String(id),
    );
    if (index === -1) {
      throw new Error("Writing topic not found");
    }

    const updatedTopic = { ...mockWritingTopics[index], ...input };
    mockWritingTopics[index] = updatedTopic;
    return updatedTopic;
  },

  // DELETE /api/app/writing-topic/{id}
  async deleteTopic(id: string): Promise<void> {
    await delay();
    mockWritingTopics = mockWritingTopics.filter(
      (t) => String(t.id) !== String(id),
    );
  },
};
