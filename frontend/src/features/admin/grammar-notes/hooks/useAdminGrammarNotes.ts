"use client";

import { useCallback, useEffect, useState } from "react";
import { LessonDto } from "@/features/admin/lessons/types/lesson";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { grammarNoteService } from "@/features/admin/grammar-notes/services/grammarNoteService";
import {
  CreateUpdateGrammarNoteDto,
  GrammarFormType,
  GrammarNoteDto,
  GrammarStructureItemDto,
} from "@/features/admin/grammar-notes/types/grammar-note";

const createStructureItem = (): GrammarStructureItemDto => ({
  formType: GrammarFormType.Affirmative,
  formula: "",
  example: "",
  orderIndex: 1,
});

export function useAdminGrammarNotes() {
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [grammarNotes, setGrammarNotes] = useState<GrammarNoteDto[]>([]);
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

  useEffect(() => {
    let isMounted = true;

    const fetchLessons = async () => {
      try {
        const data = await lessonService.getList();
        if (!isMounted) return;
        setLessons(data);

        if (data.length > 0) {
          setSelectedLessonId((prev) => prev || data[0].id);
          setModalLessonId((prev) => prev || data[0].id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách lesson:", error);
      }
    };

    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedLessonId) {
      setGrammarNotes([]);
      return;
    }

    let isMounted = true;

    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const data = await grammarNoteService.getByLessonId(selectedLessonId);
        if (isMounted) setGrammarNotes(data);
      } catch (error) {
        console.error("Lỗi lấy grammar note theo lesson:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNotes();
    return () => {
      isMounted = false;
    };
  }, [selectedLessonId]);

  const refetchNotes = useCallback(async () => {
    if (!selectedLessonId) {
      setGrammarNotes([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await grammarNoteService.getByLessonId(selectedLessonId);
      setGrammarNotes(data);
    } catch (error) {
      console.error("Lỗi refresh grammar note:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLessonId]);

  const openCreateModal = useCallback(() => {
    setEditingNote(null);
    setTitle("");
    setUsageNote("");
    setStructures([
      {
        formType: GrammarFormType.Affirmative,
        formula: "",
        example: "",
        orderIndex: 1,
      },
    ]);
    setModalLessonId(selectedLessonId || lessons[0]?.id || "");
    setIsModalOpen(true);
  }, [selectedLessonId, lessons]);

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
    setModalLessonId(selectedLessonId || lessons[0]?.id || "");
  }, [selectedLessonId, lessons]);

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
        payload.structures = [
          {
            formType: GrammarFormType.Affirmative,
            formula: "",
            example: "",
            orderIndex: 1,
          },
        ];
      }

      try {
        setIsSubmitting(true);

        if (editingNote) {
          await grammarNoteService.update(editingNote.id, payload);
        } else {
          await grammarNoteService.create(payload);
        }

        closeModal();
        await refetchNotes();
      } catch (error) {
        console.error("Lỗi khi lưu Grammar Note:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      modalLessonId,
      title,
      usageNote,
      structures,
      editingNote,
      closeModal,
      refetchNotes,
    ],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa Grammar Note này?")) return;

      try {
        await grammarNoteService.delete(noteId);
        await refetchNotes();
      } catch (error) {
        console.error("Lỗi khi xóa Grammar Note:", error);
      }
    },
    [refetchNotes],
  );

  return {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    grammarNotes,
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
    handleStructureFieldChange,
    addStructure,
    removeStructure,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}
