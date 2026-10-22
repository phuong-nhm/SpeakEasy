import {
  CheckSentenceAnswerRequest,
  ExerciseType,
  SentenceExerciseDto,
} from "../types/lesson";

// So sánh local, thay cho gọi API submitSentenceAnswer - logic phải khớp
// 100% với CheckAnswerAsync bên backend (SentenceExerciseAppService.cs)
export function checkSentenceAnswerLocal(
  question: SentenceExerciseDto,
  input: Omit<CheckSentenceAnswerRequest, "exerciseId">,
): boolean {
  const correctSentence = question.correctSentence?.trim() ?? "";

  switch (question.exerciseType) {
    case ExerciseType.FillInBlank: {
      const words = correctSentence.split(" ");
      const blankIndex = input.blankIndex;
      if (
        blankIndex === undefined ||
        blankIndex === null ||
        blankIndex < 0 ||
        blankIndex >= words.length
      ) {
        return false;
      }
      const correctWord = words[blankIndex];
      return (
        (input.userAnswerText ?? "").trim().toLowerCase() ===
        correctWord.trim().toLowerCase()
      );
    }

    case ExerciseType.AnswerQuestion: {
      return (
        (input.userAnswerText ?? "").trim().toLowerCase() ===
        correctSentence.toLowerCase()
      );
    }

    case ExerciseType.ListenChoose: {
      return (
        (input.userSelectedSentence ?? "").trim().toLowerCase() ===
        correctSentence.toLowerCase()
      );
    }

    default: {
      // WordOrder, TranslateFromVietnamese
      const userAnswer = (input.userOrderedWords ?? []).join(" ").trim();
      return userAnswer.toLowerCase() === correctSentence.toLowerCase();
    }
  }
}
