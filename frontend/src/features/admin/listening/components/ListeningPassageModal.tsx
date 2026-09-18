"use client";

import { useState } from "react";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import {
  CreateUpdateListeningPassageDto,
  CreateUpdateListeningQuestionDto,
  ListeningPassageDto,
  ListeningQuestionType,
} from "@/features/admin/listening/types/listening";

interface ListeningQuestionForm extends CreateUpdateListeningQuestionDto {
  clientId: string;
}

interface ListeningPassageFormState {
  chapterId: string;
  title: string;
  transcript: string;
  audioUrl: string;
  questions: ListeningQuestionForm[];
}

interface ListeningPassageModalProps {
  isOpen: boolean;
  editingPassage: ListeningPassageDto | null;
  chapters: ChapterDto[];
  defaultChapterId: string;
  isSubmitting: boolean;
  isGeneratingAudio: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUpdateListeningPassageDto) => void;
  onGenerateAudio: (transcript: string) => Promise<string>;
}

const createQuestion = (
  orderIndex: number,
  questionType: ListeningQuestionType = ListeningQuestionType.MultipleChoice,
): ListeningQuestionForm => ({
  clientId:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  questionType,
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOptionKey: "A",
  orderIndex,
});

const buildInitialFormState = (
  editingPassage: ListeningPassageDto | null,
  defaultChapterId: string,
): ListeningPassageFormState => {
  if (editingPassage) {
    return {
      chapterId: editingPassage.chapterId,
      title: editingPassage.title,
      transcript: editingPassage.transcript,
      audioUrl: editingPassage.audioUrl ?? "",
      questions: editingPassage.questions.map((question) => ({
        clientId: question.id,
        questionType: question.questionType,
        questionText: question.questionText,
        optionA: question.optionA ?? "",
        optionB: question.optionB ?? "",
        optionC: question.optionC ?? "",
        optionD: question.optionD ?? "",
        correctOptionKey: question.correctOptionKey ?? "A",
        orderIndex: question.orderIndex,
      })),
    };
  }

  return {
    chapterId: defaultChapterId,
    title: "",
    transcript: "",
    audioUrl: "",
    questions: [createQuestion(1)],
  };
};

const rebalanceQuestions = (questions: ListeningQuestionForm[]) =>
  questions.map((question, index) => ({
    ...question,
    orderIndex: index + 1,
  }));

const validateQuestion = (question: ListeningQuestionForm) => {
  if (!question.questionText.trim()) {
    return "Mỗi câu hỏi phải có QuestionText.";
  }

  if (question.questionType === ListeningQuestionType.MultipleChoice) {
    if (
      !question.optionA?.trim() ||
      !question.optionB?.trim() ||
      !question.optionC?.trim() ||
      !question.optionD?.trim()
    ) {
      return "MultipleChoice phải có đủ Option A-D.";
    }

    if (!question.correctOptionKey?.trim()) {
      return "MultipleChoice phải chọn đáp án đúng.";
    }
  }

  return null;
};

export function ListeningPassageModal({
  isOpen,
  editingPassage,
  chapters,
  defaultChapterId,
  isSubmitting,
  isGeneratingAudio,
  onClose,
  onSubmit,
  onGenerateAudio,
}: ListeningPassageModalProps) {
  const [prevProps, setPrevProps] = useState({
    isOpen,
    editingPassageId: editingPassage?.id ?? "",
    defaultChapterId,
  });
  const [formData, setFormData] = useState<ListeningPassageFormState>(() =>
    buildInitialFormState(editingPassage, defaultChapterId),
  );
  const [formError, setFormError] = useState("");

  if (
    prevProps.isOpen !== isOpen ||
    prevProps.editingPassageId !== (editingPassage?.id ?? "") ||
    prevProps.defaultChapterId !== defaultChapterId
  ) {
    setPrevProps({
      isOpen,
      editingPassageId: editingPassage?.id ?? "",
      defaultChapterId,
    });
    setFormData(buildInitialFormState(editingPassage, defaultChapterId));
    setFormError("");
  }

  if (!isOpen) return null;

  const handleQuestionTypeChange = (
    clientId: string,
    questionType: ListeningQuestionType,
  ) => {
    setFormData((current) => ({
      ...current,
      questions: rebalanceQuestions(
        current.questions.map((question) => {
          if (question.clientId !== clientId) return question;

          if (questionType === ListeningQuestionType.Essay) {
            return {
              ...question,
              questionType,
              optionA: "",
              optionB: "",
              optionC: "",
              optionD: "",
              correctOptionKey: "",
            };
          }

          return {
            ...question,
            questionType,
            correctOptionKey: question.correctOptionKey || "A",
          };
        }),
      ),
    }));
  };

  const handleQuestionChange = (
    clientId: string,
    partial: Partial<ListeningQuestionForm>,
  ) => {
    setFormData((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.clientId === clientId ? { ...question, ...partial } : question,
      ),
    }));
  };

  const addQuestion = () => {
    setFormData((current) => ({
      ...current,
      questions: rebalanceQuestions([
        ...current.questions,
        createQuestion(current.questions.length + 1),
      ]),
    }));
  };

  const removeQuestion = (clientId: string) => {
    setFormData((current) => ({
      ...current,
      questions: rebalanceQuestions(
        current.questions.filter((question) => question.clientId !== clientId),
      ),
    }));
  };

  const handleGenerateAudio = async () => {
    if (!formData.transcript.trim()) {
      setFormError("Vui lòng nhập Transcript trước khi sinh audio.");
      return;
    }

    setFormError("");
    try {
      const generatedAudioUrl = await onGenerateAudio(formData.transcript);
      setFormData((current) => ({ ...current, audioUrl: generatedAudioUrl }));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể sinh audio từ transcript.",
      );
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.chapterId.trim()) {
      setFormError("Vui lòng chọn Chapter.");
      return;
    }

    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề bài nghe.");
      return;
    }

    if (!formData.transcript.trim()) {
      setFormError("Vui lòng nhập transcript.");
      return;
    }

    if (formData.questions.length === 0) {
      setFormError("Bài nghe phải có ít nhất 1 câu hỏi.");
      return;
    }

    for (const question of formData.questions) {
      const error = validateQuestion(question);
      if (error) {
        setFormError(error);
        return;
      }
    }

    setFormError("");
    onSubmit({
      chapterId: formData.chapterId,
      title: formData.title.trim(),
      transcript: formData.transcript.trim(),
      audioUrl: formData.audioUrl.trim() || undefined,
      questions: formData.questions.map((question) => ({
        questionType: question.questionType,
        questionText: question.questionText.trim(),
        optionA: question.optionA?.trim() || undefined,
        optionB: question.optionB?.trim() || undefined,
        optionC: question.optionC?.trim() || undefined,
        optionD: question.optionD?.trim() || undefined,
        correctOptionKey: question.correctOptionKey?.trim() || undefined,
        orderIndex: question.orderIndex,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingPassage
                ? "Cập nhật Listening Passage"
                : "Tạo Listening Passage mới"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mỗi Chapter chỉ có 1 passage. Questions hỗ trợ MultipleChoice và
              Essay.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Chapter
              </label>
              <select
                value={formData.chapterId}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    chapterId: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.orderIndex}. {chapter.title}
                  </option>
                ))}
              </select>
              {chapters.length === 0 ? (
                <p className="mt-1 text-xs text-amber-600">
                  Chưa có chapter nào trong level hiện tại.
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Ví dụ: Ordering at the cafe"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">
                Transcript
              </label>
              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || !formData.transcript.trim()}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingAudio
                  ? "Đang sinh audio..."
                  : "Sinh Audio từ Transcript"}
              </button>
            </div>
            <textarea
              rows={7}
              value={formData.transcript}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  transcript: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              placeholder="Nhập transcript dài của bài nghe..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Audio URL
            </label>
            <input
              type="text"
              value={formData.audioUrl}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  audioUrl: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              placeholder="URL audio được sinh từ transcript hoặc nhập tay"
            />
            {formData.audioUrl ? (
              <p className="mt-1 break-all text-xs text-slate-400">
                Đang dùng: {formData.audioUrl}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Questions
                </h3>
                <p className="text-xs text-slate-500">
                  Thêm, sửa, xoá nhiều câu hỏi trong cùng passage.
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                + Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question) => (
                <div
                  key={question.clientId}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        Question #{question.orderIndex}
                      </p>
                      <p className="text-sm text-slate-500">
                        {question.questionType ===
                        ListeningQuestionType.MultipleChoice
                          ? "Multiple Choice"
                          : "Essay"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.clientId)}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Xoá câu hỏi
                    </button>
                  </div>

                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={
                          question.questionType ===
                          ListeningQuestionType.MultipleChoice
                        }
                        onChange={() =>
                          handleQuestionTypeChange(
                            question.clientId,
                            ListeningQuestionType.MultipleChoice,
                          )
                        }
                      />
                      Multiple Choice
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={
                          question.questionType === ListeningQuestionType.Essay
                        }
                        onChange={() =>
                          handleQuestionTypeChange(
                            question.clientId,
                            ListeningQuestionType.Essay,
                          )
                        }
                      />
                      Essay
                    </label>
                  </div>

                  <div className="space-y-4">
                    {question.questionType ===
                    ListeningQuestionType.MultipleChoice ? (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">
                            Question Text
                          </label>
                          <input
                            type="text"
                            value={question.questionText}
                            onChange={(event) =>
                              handleQuestionChange(question.clientId, {
                                questionText: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {(
                            [
                              ["optionA", "Option A"],
                              ["optionB", "Option B"],
                              ["optionC", "Option C"],
                              ["optionD", "Option D"],
                            ] as const
                          ).map(([fieldName, label]) => (
                            <div key={fieldName}>
                              <label className="mb-1 block text-sm font-medium text-slate-700">
                                {label}
                              </label>
                              <input
                                type="text"
                                value={question[fieldName] ?? ""}
                                onChange={(event) =>
                                  handleQuestionChange(question.clientId, {
                                    [fieldName]: event.target.value,
                                  } as Partial<ListeningQuestionForm>)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              Correct Option Key
                            </label>
                            <select
                              value={question.correctOptionKey ?? "A"}
                              onChange={(event) =>
                                handleQuestionChange(question.clientId, {
                                  correctOptionKey: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              Order Index
                            </label>
                            <input
                              type="number"
                              value={question.orderIndex}
                              readOnly
                              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Question Text
                        </label>
                        <textarea
                          rows={4}
                          value={question.questionText}
                          onChange={(event) =>
                            handleQuestionChange(question.clientId, {
                              questionText: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                          placeholder="Nhập câu hỏi essay cho phần listening..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu bài nghe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
