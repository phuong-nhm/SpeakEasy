import { useState, useMemo } from "react";
import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";

// Mock Data khớp chuẩn UserWritingDto C#
const mockUserWritings: UserWritingDto[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    topicId: "11111111-2222-3333-4444-555555555555",
    topicTitle: "Describe your daily routine",
    userName: "Nguyễn Văn A",
    userContent:
      "Every day I wakes up at 6 AM. I eats breakfast and go to school by bus.",
    creationTime: "2026-03-28T08:30:00Z",
    feedback: {
      isCorrect: false,
      score: 75,
      explanation:
        "Bài viết khá rõ ràng nhưng còn mắc một số lỗi chia động từ cơ bản ở thì hiện tại đơn.",
      suggestedCorrection:
        "Every day I wake up at 6 AM. I eat breakfast and go to school by bus.",
      errors: [
        {
          errorType: "Grammar",
          originalText: "I wakes up",
          suggestion: "I wake up",
        },
        {
          errorType: "Grammar",
          originalText: "I eats",
          suggestion: "I eat",
        },
      ],
    },
  },
  {
    id: "4ba85f64-5717-4562-b3fc-2c963f66afa7",
    topicId: "22222222-3333-4444-5555-666666666666",
    topicTitle: "My favorite hobby",
    userName: "Trần Thị B",
    userContent:
      "My favorite hobby is reading books because it helps me relax after a stressful day.",
    creationTime: "2026-03-28T09:15:00Z",
    feedback: {
      isCorrect: true,
      score: 95,
      explanation:
        "Bài viết rất tốt, câu đúng cấu trúc ngữ pháp và từ vựng hợp lý.",
      suggestedCorrection:
        "My favorite hobby is reading books because it helps me relax after a stressful day.",
      errors: [],
    },
  },
];

export function useUserWriting() {
  const [writings, setWritings] = useState<UserWritingDto[]>(mockUserWritings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWriting, setSelectedWriting] = useState<UserWritingDto | null>(
    null,
  );

  const filteredWritings = useMemo(() => {
    return writings.filter((item) => {
      const matchSearch =
        (item.userName?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (item.topicTitle?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        item.userContent.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [writings, searchQuery]);

  const openDetailModal = (item: UserWritingDto) => {
    setSelectedWriting(item);
  };

  const closeDetailModal = () => {
    setSelectedWriting(null);
  };

  return {
    writings: filteredWritings,
    searchQuery,
    setSearchQuery,
    selectedWriting,
    openDetailModal,
    closeDetailModal,
  };
}
