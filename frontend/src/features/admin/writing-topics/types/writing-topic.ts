export enum WritingTopicType {
  Weekly = 0,
  Monthly = 1,
}

// DTO nhận từ API (GET) -> EntityDto<Guid>
export interface WritingTopicDto {
  id: string;
  chapterId: string;
  topicType: WritingTopicType;
  promptTitle: string;
}

// DTO tạo mới hoặc cập nhật -> CreateUpdateWritingTopicDto
export interface CreateUpdateWritingTopicDto {
  chapterId: string;
  topicType: WritingTopicType;
  promptTitle: string;
}

// DTO chi tiết lỗi bài viết từ AI -> WritingErrorDto
export interface WritingErrorDto {
  errorType: string; // Grammar, Vocabulary, Structure...
  originalText: string;
  suggestion: string;
}

// DTO phản hồi từ AI -> AiFeedbackDto
export interface AiFeedbackDto {
  isCorrect: boolean;
  score: number;
  errors: WritingErrorDto[];
  explanation: string;
  suggestedCorrection: string;
}

// DTO bài làm của User -> UserWritingDto
export interface UserWritingDto {
  id: string;
  topicId: string;
  userContent: string;
  feedback: AiFeedbackDto;
  creationTime: string;
}

// DTO khi nộp bài -> SubmitWritingDto
export interface SubmitWritingDto {
  topicId: string;
  userContent: string;
}

// Option cho Dropdown chọn Chapter
export interface ChapterOption {
  id: string;
  title: string;
}

// Mapping UI Badge & Label cho TopicType
export const TopicTypeLabels: Record<
  WritingTopicType,
  { label: string; color: string }
> = {
  [WritingTopicType.Weekly]: {
    label: "Weekly",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [WritingTopicType.Monthly]: {
    label: "Monthly",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};
