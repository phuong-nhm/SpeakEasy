import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";

type GetListForAdminParams = {
  userId?: string;
  topicId?: string;
  skipCount?: number;
  maxResultCount?: number;
};

type AdminWritingListResult = {
  totalCount: number;
  items: UserWritingDto[];
};

const mockUserWritings: UserWritingDto[] = [
  {
    id: "writing-001",
    topicId: "topic-01",
    topicTitle: "Describe your favorite holiday",
    userName: "alice.nguyen",
    userContent:
      "My favorite holiday is Tet holiday because I can spend time with my family and eat traditional foods.",
    feedback: {
      isCorrect: true,
      score: 88,
      errors: [],
      explanation:
        "Bài viết có cấu trúc rõ ràng, từ vựng phù hợp và diễn đạt ý tưởng tốt.",
      suggestedCorrection: "",
    },
    creationTime: "2026-09-12T09:15:00Z",
  },
  {
    id: "writing-002",
    topicId: "topic-02",
    topicTitle: "Write about your daily routine",
    userName: "minh.tran",
    userContent:
      "I usually wake up at six o clock, have breakfast, and go to school by bus. After class, I study and play football with my friends.",
    feedback: {
      isCorrect: false,
      score: 72,
      errors: [
        {
          errorType: "Grammar",
          originalText: "six o clock",
          suggestion: "six o'clock",
        },
        {
          errorType: "Vocabulary",
          originalText: "football",
          suggestion: "soccer",
        },
      ],
      explanation:
        "Một số lỗi ngữ pháp và từ vựng cần được chỉnh sửa để câu văn tự nhiên hơn.",
      suggestedCorrection:
        "I usually wake up at six o'clock, have breakfast, and go to school by bus. After class, I study and play soccer with my friends.",
    },
    creationTime: "2026-09-13T14:20:00Z",
  },
  {
    id: "writing-003",
    topicId: "topic-01",
    topicTitle: "Describe your favorite holiday",
    userName: "hoang.le",
    userContent:
      "During summer vacation, I visited my grandparents in the countryside and learned how to cook local dishes.",
    feedback: {
      isCorrect: true,
      score: 91,
      errors: [],
      explanation:
        "Bài viết mạch lạc, thông tin hợp lý và có nhiều từ vựng phong phú.",
      suggestedCorrection: "",
    },
    creationTime: "2026-09-14T08:40:00Z",
  },
];

export const userWritingService = {
  getListForAdmin: async (
    params: GetListForAdminParams = {},
  ): Promise<AdminWritingListResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filteredWritings = mockUserWritings.filter((writing) => {
      const matchesUser = params.userId
        ? writing.userName?.toLowerCase() === params.userId.toLowerCase()
        : true;
      const matchesTopic = params.topicId
        ? writing.topicId === params.topicId
        : true;

      return matchesUser && matchesTopic;
    });

    const skipCount = params.skipCount ?? 0;
    const maxResultCount = params.maxResultCount ?? filteredWritings.length;

    return {
      totalCount: filteredWritings.length,
      items: filteredWritings.slice(skipCount, skipCount + maxResultCount),
    };
  },

  getDetailForAdmin: async (
    writingId: string,
  ): Promise<UserWritingDto | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockUserWritings.find((writing) => writing.id === writingId);
  },

  deleteWriting: async (writingId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockUserWritings.findIndex(
      (writing) => writing.id === writingId,
    );

    if (index === -1) {
      return false;
    }

    mockUserWritings.splice(index, 1);
    return true;
  },
};

export default userWritingService;
