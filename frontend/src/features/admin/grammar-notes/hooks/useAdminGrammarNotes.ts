"use client";

import { useCallback, useEffect, useState } from "react";
import { LessonDto } from "@/features/admin/lessons/types/lesson";
import { levelService } from "@/features/admin/levels/services/levelService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { grammarNoteService } from "@/features/admin/grammar-notes/services/grammarNoteService";
import {
  CreateUpdateGrammarNoteDto,
  GrammarFormType,
  GrammarNoteDto,
  GrammarStructureItemDto,
} from "@/features/admin/grammar-notes/types/grammar-note";
import { FilterOption } from "@/features/admin/sentence-exercises/types/sentence-exercise";

const ALL_CHAPTER_ID = "__all_chapters__";
const ALL_LESSON_ID = "__all_lessons__";

const createStructureItem = (): GrammarStructureItemDto => ({
  formType: GrammarFormType.Affirmative,
  formula: "",
  example: "",
  orderIndex: 1,
});

export function useAdminGrammarNotes() {
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [chapters, setChapters] = useState<FilterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [lessons, setLessons] = useState<FilterOption[]>([]);
  const [lessonEntities, setLessonEntities] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [grammarNotes, setGrammarNotes] = useState<GrammarNoteDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GrammarNoteDto | null>(null);
  const [modalLessonId, setModalLessonId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [usageNote, setUsageNote] = useState("");
  const [structures, setStructures] = useState<GrammarStructureItemDto[]>([
    createStructureItem(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [isImportSubmitting, setIsImportSubmitting] = useState(false);

  const loadGrammarNotes = useCallback(
    async (levelId: string, chapterId: string, lessonId: string, page = 1) => {
      if (!levelId || !chapterId || !lessonId) {
        setGrammarNotes([]);
        setTotalCount(0);
        return;
      }

      const isAllChapter = chapterId === ALL_CHAPTER_ID;
      const isAllLesson = lessonId === ALL_LESSON_ID;

      try {
        setIsLoading(true);

        if (isAllChapter) {
          const skipCount = (page - 1) * pageSize;
          const result = await grammarNoteService.getByLevelIdPaged(
            levelId,
            skipCount,
            pageSize,
          );

          setGrammarNotes(result.items ?? []);
          setTotalCount(result.totalCount ?? 0);
          return;
        }

        if (isAllLesson) {
          const items = await grammarNoteService.getByChapterId(chapterId);
          setGrammarNotes(items ?? []);
          setTotalCount((items ?? []).length);
          return;
        }

        const note = await grammarNoteService.getByLessonId(lessonId);
        const items = note ? [note] : [];
        setGrammarNotes(items);
        setTotalCount(items.length);
      } catch (error) {
        console.error("Lỗi lấy grammar note:", error);
        setGrammarNotes([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  const loadLessons = useCallback(
    async (levelId: string, chapterId: string) => {
      if (!chapterId) {
        setLessons([]);
        setLessonEntities([]);
        setSelectedLessonId("");
        setModalLessonId("");
        setGrammarNotes([]);
        setTotalCount(0);
        return;
      }

      setCurrentPage(1);

      if (chapterId === ALL_CHAPTER_ID) {
        const allLessonOption: FilterOption = {
          id: ALL_LESSON_ID,
          title: "Tất cả bài học",
        };

        setLessons([allLessonOption]);
        setLessonEntities([]);
        setSelectedLessonId(ALL_LESSON_ID);
        setModalLessonId("");
        await loadGrammarNotes(levelId, chapterId, ALL_LESSON_ID, 1);
        return;
      }

      try {
        const data = await lessonService.getByChapterId(chapterId);
        const allLessonOption: FilterOption = {
          id: ALL_LESSON_ID,
          title: "Tất cả bài học",
        };
        const options = [
          allLessonOption,
          ...data.map((item) => ({
            id: item.id,
            title: item.title,
          })),
        ];

        setLessonEntities(data);
        setLessons(options);

        const defaultLessonId = ALL_LESSON_ID;
        setSelectedLessonId(defaultLessonId);
        setModalLessonId(data[0]?.id || "");
        await loadGrammarNotes(levelId, chapterId, defaultLessonId, 1);
      } catch (error) {
        console.error("Lỗi lấy lesson theo chapter:", error);
      }
    },
    [loadGrammarNotes],
  );

  const loadChapters = useCallback(
    async (levelId: string) => {
      if (!levelId) {
        setChapters([]);
        setSelectedChapterId("");
        setLessons([]);
        setLessonEntities([]);
        setSelectedLessonId("");
        setModalLessonId("");
        setGrammarNotes([]);
        setTotalCount(0);
        return;
      }

      try {
        const data = await chapterService.getByLevelId(levelId);
        const allChapterOption: FilterOption = {
          id: ALL_CHAPTER_ID,
          title: "Tất cả chapter",
        };
        const options = [
          allChapterOption,
          ...data.map((item) => ({
            id: item.id,
            title: item.title,
          })),
        ];

        setChapters(options);

        const firstChapterId = data[0]?.id || ALL_CHAPTER_ID;
        setSelectedChapterId(firstChapterId);
        await loadLessons(levelId, firstChapterId);
      } catch (error) {
        console.error("Lỗi lấy chapter theo level:", error);
      }
    },
    [loadLessons],
  );

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const data = await levelService.getList();
        const options = data.map((item) => ({ id: item.id, title: item.name }));

        if (!isMounted) {
          return;
        }

        setLevels(options);

        if (options.length > 0) {
          const firstLevelId = options[0].id;
          setSelectedLevelId(firstLevelId);
          await loadChapters(firstLevelId);
        }
      } catch (error) {
        console.error("Lỗi lấy level:", error);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [loadChapters]);

  const handleLevelChange = useCallback(
    async (levelId: string) => {
      setSelectedLevelId(levelId);
      await loadChapters(levelId);
    },
    [loadChapters],
  );

  const handleChapterChange = useCallback(
    async (chapterId: string) => {
      setCurrentPage(1);
      setSelectedChapterId(chapterId);
      await loadLessons(selectedLevelId, chapterId);
    },
    [loadLessons, selectedLevelId],
  );

  const handleLessonChange = useCallback(
    async (lessonId: string) => {
      setCurrentPage(1);
      setSelectedLessonId(lessonId);
      if (!isModalOpen && lessonId !== ALL_LESSON_ID) {
        setModalLessonId(lessonId);
      }
      await loadGrammarNotes(selectedLevelId, selectedChapterId, lessonId, 1);
    },
    [isModalOpen, loadGrammarNotes, selectedChapterId, selectedLevelId],
  );

  const openCreateModal = useCallback(() => {
    setEditingNote(null);
    setTitle("");
    setUsageNote("");
    setStructures([createStructureItem()]);
    const fallbackLessonId =
      selectedLessonId && selectedLessonId !== ALL_LESSON_ID
        ? selectedLessonId
        : lessonEntities[0]?.id || "";
    setModalLessonId(fallbackLessonId);
    setIsModalOpen(true);
  }, [lessonEntities, selectedLessonId]);

  const openEditModal = useCallback((note: GrammarNoteDto) => {
    setEditingNote(note);
    setModalLessonId(note.lessonId);
    setTitle(note.title);
    setUsageNote(note.usageNote ?? "");
    setStructures(
      (note.structures ?? []).map((item, index) => ({
        ...item,
        orderIndex: index + 1,
      })),
    );
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingNote(null);
    setTitle("");
    setUsageNote("");
    setStructures([createStructureItem()]);
    const fallbackLessonId =
      selectedLessonId && selectedLessonId !== ALL_LESSON_ID
        ? selectedLessonId
        : lessonEntities[0]?.id || "";
    setModalLessonId(fallbackLessonId);
  }, [lessonEntities, selectedLessonId]);

  const handlePageChange = useCallback(
    async (nextPage: number) => {
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
      setCurrentPage(normalizedPage);
      await loadGrammarNotes(
        selectedLevelId,
        selectedChapterId,
        selectedLessonId,
        normalizedPage,
      );
    },
    [
      loadGrammarNotes,
      pageSize,
      selectedChapterId,
      selectedLessonId,
      selectedLevelId,
      totalCount,
    ],
  );

  const openImportModal = useCallback(() => {
    setImportJsonText("");
    setImportError(null);
    setIsImportModalOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
    setImportError(null);
  }, []);

  const handleStructureFieldChange = useCallback(
    (index: number, field: keyof GrammarStructureItemDto, value: string) => {
      setStructures((prev) =>
        prev.map((item, itemIndex) => {
          if (itemIndex !== index) return item;
          if (field === "formType") {
            return { ...item, [field]: value as unknown as GrammarFormType };
          }
          return { ...item, [field]: value };
        }),
      );
    },
    [],
  );

  const addStructure = useCallback(() => {
    setStructures((prev) => [
      ...prev,
      {
        ...createStructureItem(),
        orderIndex: prev.length + 1,
      },
    ]);
  }, []);

  const removeStructure = useCallback((index: number) => {
    setStructures((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0
        ? next.map((item, itemIndex) => ({
            ...item,
            orderIndex: itemIndex + 1,
          }))
        : [createStructureItem()];
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!modalLessonId || !title.trim()) return;

      const payload: CreateUpdateGrammarNoteDto = {
        lessonId: modalLessonId,
        title: title.trim(),
        usageNote: usageNote.trim() || undefined,
        structures: structures
          .filter((item) => item.formula.trim() || item.example.trim())
          .map((item, index) => ({
            ...item,
            formType: item.formType,
            formula: item.formula.trim(),
            example: item.example.trim(),
            orderIndex: index + 1,
          })),
      };

      if (payload.structures.length === 0) {
        payload.structures = [createStructureItem()];
      }

      try {
        setIsSubmitting(true);

        if (editingNote) {
          await grammarNoteService.update(editingNote.id, payload);
        } else {
          await grammarNoteService.create(payload);
        }

        closeModal();

        if (selectedLessonId !== modalLessonId) {
          setSelectedLessonId(modalLessonId);
        }
        await loadGrammarNotes(
          selectedLevelId,
          selectedChapterId,
          modalLessonId,
          currentPage,
        );
      } catch (error) {
        console.error("Lỗi khi lưu Grammar Note:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      closeModal,
      editingNote,
      loadGrammarNotes,
      modalLessonId,
      selectedLessonId,
      structures,
      title,
      usageNote,
    ],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa Grammar Note này?")) return;

      try {
        await grammarNoteService.delete(noteId);
        await loadGrammarNotes(
          selectedLevelId,
          selectedChapterId,
          selectedLessonId,
          currentPage,
        );
      } catch (error) {
        console.error("Lỗi khi xóa Grammar Note:", error);
      }
    },
    [
      currentPage,
      loadGrammarNotes,
      selectedChapterId,
      selectedLessonId,
      selectedLevelId,
    ],
  );

  const handleImportSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setImportError(null);

      let parsed: unknown;
      try {
        parsed = JSON.parse(importJsonText);
      } catch {
        setImportError(
          "JSON không hợp lệ. Vui lòng kiểm tra dấu ngoặc, dấu phẩy và chuỗi ký tự.",
        );
        return;
      }

      if (!Array.isArray(parsed)) {
        setImportError("Dữ liệu import phải là một mảng JSON (array).");
        return;
      }

      const rawInputs = parsed as CreateUpdateGrammarNoteDto[];
      if (rawInputs.length === 0) {
        setImportError("Danh sách import đang rỗng.");
        return;
      }

      const inputs = rawInputs.map((item) => ({
        ...item,
        lessonId: item.lessonId || selectedLessonId,
      }));

      const invalidItemIndex = inputs.findIndex(
        (item) =>
          !item ||
          !item.lessonId ||
          !item.title ||
          !Array.isArray(item.structures) ||
          item.structures.length === 0 ||
          item.structures.some((structure) => !structure.formula?.trim()),
      );

      if (invalidItemIndex >= 0) {
        setImportError(
          `Phần tử thứ ${invalidItemIndex + 1} không hợp lệ: cần lessonId, title, structures và mỗi structure phải có formula không rỗng.`,
        );
        return;
      }

      try {
        setIsImportSubmitting(true);
        await grammarNoteService.createMany(inputs);
        closeImportModal();
        await loadGrammarNotes(
          selectedLevelId,
          selectedChapterId,
          selectedLessonId || inputs[0].lessonId,
          currentPage,
        );
      } catch (error) {
        const rawMessage =
          error instanceof Error
            ? error.message
            : "Import thất bại do lỗi không xác định.";

        if (rawMessage.toLowerCase().includes("lesson")) {
          setImportError(
            `Import thất bại do trùng Grammar Note theo Lesson. Chi tiết từ backend: ${rawMessage}`,
          );
          return;
        }

        setImportError(`Import thất bại: ${rawMessage}`);
      } finally {
        setIsImportSubmitting(false);
      }
    },
    [
      closeImportModal,
      currentPage,
      importJsonText,
      loadGrammarNotes,
      selectedChapterId,
      selectedLessonId,
      selectedLevelId,
    ],
  );

  const isAllChapterSelected = selectedChapterId === ALL_CHAPTER_ID;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    handleLessonChange,
    grammarNotes,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    isAllChapterSelected,
    isLoading,
    isModalOpen,
    editingNote,
    modalLessonId,
    setModalLessonId,
    title,
    setTitle,
    usageNote,
    setUsageNote,
    structures,
    isSubmitting,
    isImportModalOpen,
    importJsonText,
    setImportJsonText,
    importError,
    isImportSubmitting,
    handleStructureFieldChange,
    addStructure,
    removeStructure,
    handlePageChange,
    openCreateModal,
    openImportModal,
    openEditModal,
    closeModal,
    closeImportModal,
    handleSubmit,
    handleImportSubmit,
    handleDelete,
    modalLessons: lessonEntities,
  };
}
