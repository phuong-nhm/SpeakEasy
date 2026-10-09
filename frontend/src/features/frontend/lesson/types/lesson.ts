// ===== ENUMS (khớp backend) =====
export enum LessonType {
  Vocabulary = 0,
  Grammar = 1,
  Listening = 2,
  Writing = 3,
  Checkpoint = 4,
}

export enum SectionType {
  Vocabulary = 0,
  Grammar = 1,
  Review = 2,
  Dialogue = 3,
}

export enum ExerciseType {
  WordOrder = 0,
  FillInBlank = 1,
  AnswerQuestion = 2,
  TranslateFromVietnamese = 3,
  ListenChoose = 4,
}

export enum WordType {
  Noun = 0,
  Verb = 1,
  Adjective = 2,
  Adverb = 3,
  Preposition = 4,
  Phrase = 5,
  Other = 6,
}

export enum GrammarFormType {
  Affirmative = 0,
  Negative = 1,
  Question = 2,
}

// ===== LESSON =====
export interface LessonDto {
  id: string;
  chapterId: string;
  title: string;
  lessonType: LessonType;
  orderIndex: number;
  grammarTopic?: string;
}

// ===== VOCABULARY =====
export interface VocabularyDto {
  id: string;
  lessonId: string;
  word: string;
  meaning: string;
  distractor: string;
  imageUrl?: string;
  audioUrl?: string;
  imageHint?: string;
  wordType: WordType;
}

export type VocabularyQuizOptionKey = "A" | "B";

export interface VocabularyQuizDto {
  vocabularyId: string;
  word: string;
  imageUrl?: string;
  audioUrl?: string;
  optionA: string;
  optionB: string;
  correctOption: VocabularyQuizOptionKey;
}

// ===== SENTENCE EXERCISE =====
export interface SentenceExerciseDto {
  id: string;
  lessonId: string;
  sectionType: SectionType;
  correctSentence?: string; // chỉ có ở Admin CMS, FE learner không nên dựa vào field này để check
  audioUrl?: string;
  exerciseType: ExerciseType;
  shuffledWords?: string[]; // WordOrder, TranslateFromVietnamese
  displaySentence?: string; // FillInBlank - câu đã thay chỗ trống bằng "_____"
  blankIndex?: number; // FillInBlank - gửi lại khi check-answer
  promptText?: string; // AnswerQuestion
  vietnameseTranslation?: string; // TranslateFromVietnamese
  listenOptions?: string[]; // ListenChoose
  dialogueGroupId?: string;
  orderInGroup?: number; // 1 = câu A (ListenChoose), 2 = câu B (TranslateFromVietnamese)
}

// ===== LESSON CONTENT (gộp 3 phần) =====
export interface LessonContentDto {
  lesson: LessonDto;
  vocabularies: VocabularyDto[];
  sentences: SentenceExerciseDto[];
}

// ===== CHECK ANSWER =====
export interface CheckSentenceAnswerRequest {
  exerciseId: string;
  userOrderedWords?: string[]; // WordOrder, TranslateFromVietnamese
  userAnswerText?: string; // AnswerQuestion, FillInBlank
  blankIndex?: number; // chỉ cần cho FillInBlank
  userSelectedSentence?: string; // ListenChoose
}

// ===== GRAMMAR NOTE =====
export interface GrammarStructureItemDto {
  id: string;
  formType: GrammarFormType;
  formula: string;
  example: string;
  orderIndex: number;
}

export interface GrammarNoteDto {
  id: string;
  lessonId: string;
  title: string;
  usageNote?: string;
  structures: GrammarStructureItemDto[];
}

// ===== LESSON SUBMIT =====
export interface LessonSubmitRequest {
  lessonId: string;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  heartsLeft: number;
  accuracyPercent: number;
  elapsedSeconds: number;
}

export interface LessonSubmitResponse {
  success: boolean;
  xpEarned: number;
  accuracyPercent: number;
  lessonsCompleted: number;
  streakUpdated: boolean;
}

// ===== LISTENING PASSAGE (giữ nguyên, đã confirm trước đó) =====
export type ListeningOptionKey = "A" | "B" | "C" | "D";

export interface ListeningPassageQuestionDto {
  id: string;
  questionType: "MultipleChoice" | "Essay";
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  orderIndex: number;
}

export interface ListeningPassageClientDto {
  title: string;
  audioUrl: string;
  questions: ListeningPassageQuestionDto[];
}

export interface SubmitListeningMultipleChoiceRequest {
  questionId: string;
  selectedOptionKey: ListeningOptionKey;
}

export interface SubmitListeningMultipleChoiceResponse {
  isCorrect: boolean;
  correctOptionKey: ListeningOptionKey;
}

export interface SubmitListeningEssayRequest {
  questionId: string;
  userContent: string;
}

export interface WritingErrorDto {
  errorType: string;
  originalText: string;
  suggestion: string;
}

export interface AiFeedbackDto {
  isCorrect: boolean;
  score: number;
  band?: string;
  errors: WritingErrorDto[];
  explanation: string;
  suggestedCorrection: string;
}

export interface SubmitListeningEssayResponse {
  aiFeedback: AiFeedbackDto;
}
// ===== WRITING TOPIC =====
export enum WritingTopicType {
  Weekly = 0,
  Monthly = 1,
}

export interface WritingTopicDto {
  id: string;
  chapterId: string;
  topicType: WritingTopicType;
  promptTitle: string;
}

export interface SubmitWritingRequest {
  topicId: string;
  userContent: string;
}

export interface UserWritingDto {
  id: string;
  topicId: string;
  topicTitle?: string;
  userName?: string;
  userContent: string;
  feedback: AiFeedbackDto;
  creationTime: string;
}
