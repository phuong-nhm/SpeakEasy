// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";

// import { lessonService } from "../services/lessonService";
// import {
//   CheckSentenceAnswerRequest,
//   ExerciseType,
//   GrammarNoteDto,
//   LessonDto,
//   SectionType,
//   SentenceExerciseDto,
//   VocabularyDto,
//   VocabularyQuizDto,
// } from "../types/lesson";
// import { reviewService } from "../../review/services/reviewService";
// import { checkSentenceAnswerLocal } from "../services/checkSentenceAnswer";

// const shuffleItems = <T>(items: T[]) => {
//   const next = [...items];
//   for (let index = next.length - 1; index > 0; index -= 1) {
//     const randomIndex = Math.floor(Math.random() * (index + 1));
//     [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
//   }
//   return next;
// };

// type LessonPart = "vocabulary" | "grammar" | "comprehensive";
// type CompletedParts = Record<LessonPart, boolean>;
// type VocabSubStep = "intro" | "flashcard" | "matching";

// const PART_INDEX_MAP: Record<LessonPart, 0 | 1 | 2> = {
//   vocabulary: 0,
//   grammar: 1,
//   comprehensive: 2,
// };

// const defaultCompletedParts: CompletedParts = {
//   vocabulary: false,
//   grammar: false,
//   comprehensive: false,
// };

// const DEFAULT_HEARTS = 10;
// const XP_PER_CORRECT = 30;
// const XP_PER_HEART_LEFT = 10;

// export function useLessonFlow(lessonId: string) {
//   const queryClient = useQueryClient();

//   // ==========================================
//   // BÀI TẬP: Khởi tạo các Query tải nội dung bài học
//   // ==========================================
//   const lessonContentQuery = useQuery({
//     queryKey: /* TODO: Điền queryKey cho lesson-content kèm lessonId */,
//     queryFn: /* TODO: Gọi service lấy nội dung lesson theo lessonId */,
//     enabled: /* TODO: Chỉ chạy khi có lessonId */,
//   });

//   const grammarNoteQuery = useQuery({
//     queryKey: /* TODO: Điền queryKey cho grammar-note kèm lessonId */,
//     queryFn: /* TODO: Gọi service lấy ghi chú ngữ pháp theo lessonId */,
//     enabled: /* TODO: Chỉ chạy khi có lessonId */,
//   });

//   const partProgressQuery = useQuery({
//     queryKey: /* TODO: Điền queryKey cho part-progress kèm lessonId */,
//     queryFn: /* TODO: Gọi service lấy tiến độ từng phần theo lessonId */,
//     enabled: /* TODO: Chỉ chạy khi có lessonId */,
//   });

//   const lesson: LessonDto | null = lessonContentQuery.data?.lesson ?? null;
//   const vocabularies: VocabularyDto[] =
//     lessonContentQuery.data?.vocabularies ?? [];
//   const sentences = useMemo<SentenceExerciseDto[]>(
//     () => lessonContentQuery.data?.sentences ?? [],
//     [lessonContentQuery.data],
//   );
//   const grammarNote: GrammarNoteDto | null = grammarNoteQuery.data ?? null;

//   const loading =
//     lessonContentQuery.isLoading ||
//     grammarNoteQuery.isLoading ||
//     partProgressQuery.isLoading;

//   const loadError =
//     lessonContentQuery.isError ||
//     grammarNoteQuery.isError ||
//     partProgressQuery.isError
//       ? "Không thể tải dữ liệu bài học."
//       : null;

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [selectedPart, setSelectedPart] = useState<LessonPart | null>(null);
//   const [completedParts, setCompletedParts] = useState<CompletedParts>(
//     defaultCompletedParts,
//   );

//   const [selectedWords, setSelectedWords] = useState<string[]>([]);
//   const [selectedText, setSelectedText] = useState("");
//   const [selectedSentence, setSelectedSentence] = useState<string | null>(null);

//   const [isChecking, setIsChecking] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [resultType, setResultType] = useState<"correct" | "incorrect" | null>(
//     null,
//   );
//   const [showPassiveRecall, setShowPassiveRecall] = useState(false);
//   const [hearts, setHearts] = useState(DEFAULT_HEARTS);
//   const [correctAnswers, setCorrectAnswers] = useState(0);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isLessonFailed, setIsLessonFailed] = useState(false);
//   const [showExitConfirm, setShowExitConfirm] = useState(false);

//   const [vocabSubStep, setVocabSubStep] = useState<VocabSubStep>("intro");
//   const [isVocabularyMatchingCompleted, setIsVocabularyMatchingCompleted] =
//     useState(false);

//   const startedAtRef = useRef<number>(0);

//   const [summary, setSummary] = useState<{
//     xpEarned: number;
//     accuracyPercent: number;
//     elapsedSeconds: number;
//   } | null>(null);

//   const lessonParts: LessonPart[] = ["vocabulary", "grammar", "comprehensive"];

//   const isPartUnlocked = (part: LessonPart) => {
//     if (part === "vocabulary") return true;
//     if (part === "grammar") return completedParts.vocabulary;
//     return completedParts.grammar;
//   };

//   const resetCurrentState = () => {
//     setSelectedWords([]);
//     setSelectedText("");
//     setSelectedSentence(null);
//     setIsChecked(false);
//     setResultType(null);
//   };

//   const recordAttemptResult = (isCorrect: boolean) => {
//     if (isCorrect) {
//       setCorrectAnswers((prev) => prev + 1);
//       return;
//     }
//     setHearts((prev) => Math.max(0, prev - 1));
//   };

//   const openPart = (part: LessonPart) => {
//     if (!isPartUnlocked(part)) return;

//     setSelectedPart(part);
//     if (part === "vocabulary") {
//       setVocabSubStep("intro");
//       setIsVocabularyMatchingCompleted(false);
//     }
//     setCurrentIndex(0);
//     resetCurrentState();
//   };

//   // ===== RESET state phiên học mỗi khi đổi sang Lesson khác =====
//   const [syncedLessonId, setSyncedLessonId] = useState(lessonId);
//   if (syncedLessonId !== lessonId) {
//     setSyncedLessonId(lessonId);
//     setHearts(DEFAULT_HEARTS);
//     setSelectedPart(null);
//     setCurrentIndex(0);
//     setSelectedWords([]);
//     setSelectedText("");
//     setSelectedSentence(null);
//     setIsChecked(false);
//     setResultType(null);
//     setCorrectAnswers(0);
//     setIsCompleted(false);
//     setIsLessonFailed(false);
//     setSummary(null);
//     setVocabSubStep("intro");
//     setIsVocabularyMatchingCompleted(false);
//   }
//   useEffect(() => {
//     startedAtRef.current = Date.now();
//   }, [lessonId]);

//   // Đồng bộ completedParts từ server - chỉ sync đúng 1 lần cho mỗi Lesson
//   const [completedPartsSyncedId, setCompletedPartsSyncedId] = useState<
//     string | null
//   >(null);
//   if (partProgressQuery.data && completedPartsSyncedId !== lessonId) {
//     setCompletedPartsSyncedId(lessonId);
//     setCompletedParts({
//       vocabulary: partProgressQuery.data.isVocabularyCompleted,
//       grammar: partProgressQuery.data.isGrammarCompleted,
//       comprehensive: partProgressQuery.data.isComprehensiveCompleted,
//     });
//   }

//   // ===== PHÂN LOẠI SENTENCES THEO PHẦN =====
//   const grammarQuestions = useMemo<SentenceExerciseDto[]>(() => {
//     return sentences.filter((s) => s.sectionType === SectionType.Grammar);
//   }, [sentences]);

//   const comprehensiveQuestions = useMemo<SentenceExerciseDto[]>(() => {
//     const questions = sentences.filter(
//       (s) => s.sectionType === SectionType.Review,
//     );
//     return shuffleItems(questions);
//   }, [sentences]);

//   const currentPart = selectedPart ?? "vocabulary";

//   const partQuestions = useMemo<SentenceExerciseDto[]>(() => {
//     if (currentPart === "grammar") return grammarQuestions;
//     if (currentPart === "comprehensive") return comprehensiveQuestions;
//     return [];
//   }, [comprehensiveQuestions, currentPart, grammarQuestions]);

//   const currentQuestion = useMemo<SentenceExerciseDto | null>(() => {
//     if (!lesson || !selectedPart || currentPart === "vocabulary") return null;
//     return partQuestions[currentIndex] ?? null;
//   }, [currentIndex, currentPart, lesson, partQuestions, selectedPart]);

//   const totalQuestions =
//     currentPart === "grammar"
//       ? grammarQuestions.length
//       : currentPart === "comprehensive"
//         ? comprehensiveQuestions.length
//         : 0;

//   const overviewProgress =
//     (Object.values(completedParts).filter(Boolean).length /
//       lessonParts.length) *
//     100;
//   const currentPartProgress =
//     totalQuestions === 0 ? 0 : (currentIndex / totalQuestions) * 33;
//   const progressPercent =
//     selectedPart === null
//       ? overviewProgress
//       : Math.min(
//           100,
//           33 * lessonParts.indexOf(currentPart) + currentPartProgress,
//         );

//   const hasAnswerSelected = () => {
//     if (!currentQuestion) return false;
//     switch (currentQuestion.exerciseType) {
//       case ExerciseType.WordOrder:
//       case ExerciseType.TranslateFromVietnamese:
//         return selectedWords.length > 0;
//       case ExerciseType.FillInBlank:
//       case ExerciseType.AnswerQuestion:
//         return selectedText.trim().length > 0;
//       case ExerciseType.ListenChoose:
//         return Boolean(selectedSentence);
//       default:
//         return false;
//     }
//   };

//   const canCheck =
//     selectedPart !== null &&
//     selectedPart !== "vocabulary" &&
//     hasAnswerSelected() &&
//     !isChecked &&
//     !isChecking &&
//     !isCompleted;

//   const handleSelectWords = (words: string[]) => {
//     if (isChecked || isCompleted) return;
//     setSelectedWords(words);
//   };

//   const handleSelectText = (text: string) => {
//     if (isChecked || isCompleted) return;
//     setSelectedText(text);
//   };

//   const handleSelectSentence = (sentence: string) => {
//     if (isChecked || isCompleted) return;
//     setSelectedSentence(sentence);
//   };

//   const handleCheckAnswer = () => {
//     if (!currentQuestion || isChecked || isChecking || isCompleted) return;

//     const request: Omit<CheckSentenceAnswerRequest, "exerciseId"> = {};

//     switch (currentQuestion.exerciseType) {
//       case ExerciseType.WordOrder:
//       case ExerciseType.TranslateFromVietnamese:
//         request.userOrderedWords = selectedWords;
//         break;
//       case ExerciseType.FillInBlank:
//         request.userAnswerText = selectedText;
//         request.blankIndex = currentQuestion.blankIndex;
//         break;
//       case ExerciseType.AnswerQuestion:
//         request.userAnswerText = selectedText;
//         break;
//       case ExerciseType.ListenChoose:
//         request.userSelectedSentence = selectedSentence ?? "";
//         break;
//     }

//     setIsChecking(true);
//     try {
//       const isCorrect = checkSentenceAnswerLocal(currentQuestion, request);
//       setIsChecked(true);
//       setResultType(isCorrect ? "correct" : "incorrect");
//       recordAttemptResult(isCorrect);
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   const handleAdvanceQuestions = (step = 1) => {
//     if (!lesson || !selectedPart) return;

//     const totalLength =
//       selectedPart === "grammar"
//         ? grammarQuestions.length
//         : selectedPart === "comprehensive"
//           ? comprehensiveQuestions.length
//           : 0;

//     if (totalLength === 0) return;

//     const nextIndex = currentIndex + step;

//     if (nextIndex >= totalLength) {
//       completeCurrentPart();
//       return;
//     }

//     setCurrentIndex(nextIndex);
//     resetCurrentState();
//   };

//   // ===== FINALIZE (gọi API submit kết quả thật) =====
//   const finalizeLesson = async () => {
//     if (!lesson) return;

//     const totalAnswered =
//       grammarQuestions.length + comprehensiveQuestions.length;
//     const elapsedSeconds = Math.max(
//       1,
//       Math.round((Date.now() - startedAtRef.current) / 1000),
//     );
//     const accuracyPercent =
//       totalAnswered === 0
//         ? 0
//         : Math.round((correctAnswers / totalAnswered) * 100);
//     const xpEarned =
//       correctAnswers * XP_PER_CORRECT + hearts * XP_PER_HEART_LEFT;

//     setSummary({ xpEarned, accuracyPercent, elapsedSeconds });
//     setIsCompleted(true);
//     setSelectedPart(null);
//     setCurrentIndex(0);
//     resetCurrentState();

//     try {
//       let wasCompletedBefore = false;
//       try {
//         const chapterProgress = await lessonService.getProgressByChapter(
//           lesson.chapterId,
//         );
//         wasCompletedBefore = chapterProgress.some(
//           (p) => p.lessonId === lesson.id && p.isCompleted,
//         );
//       } catch {
//         wasCompletedBefore = false;
//       }

//       const tasks: Promise<unknown>[] = [
//         lessonService.markLessonCompleted(lesson.id),
//       ];

//       if (!wasCompletedBefore) {
//         tasks.push(reviewService.initReview(lesson.id));
//       }

//       await Promise.all(tasks);

//       // ==========================================
//       // BÀI TẬP: Invalidate cache "user-progress" sau khi hoàn thành lesson
//       // ==========================================
//       /* TODO: Gọi queryClient.invalidateQueries để làm mới cache "user-progress" */

//     } catch {
//       // Không chặn UI nếu submit lỗi
//     }
//   };

//   const completeCurrentPart = () => {
//     if (!selectedPart || !lesson) return;

//     lessonService
//       .markPartCompleted(lesson.id, PART_INDEX_MAP[selectedPart])
//       .catch(() => {});

//     setCompletedParts((prev) => ({
//       ...prev,
//       [selectedPart]: true,
//     }));

//     if (selectedPart === "comprehensive") {
//       setSelectedPart(null);
//       setCurrentIndex(0);
//       resetCurrentState();
//       setShowPassiveRecall(true);
//       return;
//     }

//     if (selectedPart === "vocabulary") {
//       setVocabSubStep("intro");
//       setIsVocabularyMatchingCompleted(false);
//     }

//     setSelectedPart(null);
//     setCurrentIndex(0);
//     resetCurrentState();
//   };

//   const handlePassiveRecallComplete = () => {
//     setShowPassiveRecall(false);
//     finalizeLesson();
//   };

//   const handleVocabularyContinueToFlashcard = () => {
//     if (!selectedPart || selectedPart !== "vocabulary") return;
//     setVocabSubStep("flashcard");
//   };

//   const handleVocabularyFlashcardComplete = () => {
//     if (!selectedPart || selectedPart !== "vocabulary") return;
//     setVocabSubStep("matching");
//   };

//   const handleVocabularyMatchingComplete = () => {
//     if (!selectedPart || selectedPart !== "vocabulary") return;
//     setIsVocabularyMatchingCompleted(true);
//   };

//   const canStartGrammarFromVocabulary =
//     selectedPart === "vocabulary" &&
//     vocabSubStep === "matching" &&
//     isVocabularyMatchingCompleted;

//   const retryComprehensivePart = () => {
//     setIsLessonFailed(false);
//     setHearts(DEFAULT_HEARTS);
//     setCurrentIndex(0);
//     resetCurrentState();
//   };

//   const handleContinue = () => {
//     if (!lesson || !selectedPart) return;

//     if (selectedPart === "vocabulary") {
//       if (!canStartGrammarFromVocabulary) return;
//       completeCurrentPart();
//       return;
//     }

//     if (selectedPart === "grammar") {
//       handleAdvanceQuestions(1);
//       return;
//     }

//     if (selectedPart === "comprehensive") {
//       if (hearts === 0) {
//         setIsLessonFailed(true);
//         return;
//       }
//       handleAdvanceQuestions(1);
//     }
//   };

//   const handleExit = () => setShowExitConfirm(true);
//   const confirmExit = () => {
//     setShowExitConfirm(false);
//     window.location.href = "/dashboard";
//   };
//   const cancelExit = () => setShowExitConfirm(false);

//   return {
//     lesson,
//     grammarNote,
//     loading,
//     loadError,
//     currentPart,
//     currentQuestion,
//     currentIndex,
//     totalQuestions,
//     selectedWords,
//     selectedText,
//     selectedSentence,
//     isChecking,
//     isChecked,
//     resultType,
//     hearts,
//     correctAnswers,
//     isCompleted,
//     isLessonFailed,
//     summary,
//     progressPercent,
//     canCheck,
//     showExitConfirm,
//     vocabSubStep,
//     isVocabularyMatchingCompleted,
//     canStartGrammarFromVocabulary,
//     lessonParts,
//     vocabularies,
//     grammarQuestions,
//     comprehensiveQuestions,
//     selectedPart,
//     completedParts,
//     isPartUnlocked,
//     openPart,
//     handleSelectWords,
//     handleSelectText,
//     handleSelectSentence,
//     handleCheckAnswer,
//     handleAdvanceQuestions,
//     handleVocabularyContinueToFlashcard,
//     handleVocabularyFlashcardComplete,
//     handleVocabularyMatchingComplete,
//     handleContinue,
//     handleExit,
//     confirmExit,
//     cancelExit,
//     recordAttemptResult,
//     showPassiveRecall,
//     handlePassiveRecallComplete,
//     retryComprehensivePart,
//   };
// }