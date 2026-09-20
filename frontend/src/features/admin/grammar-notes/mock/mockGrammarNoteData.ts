import {
  GrammarFormType,
  GrammarNoteDto,
} from "@/features/admin/grammar-notes/types/grammar-note";

export const mockGrammarNotes: GrammarNoteDto[] = [
  {
    id: "gn-001",
    lessonId: "les-001",
    title: 'To Be – Động từ "To be"',
    usageNote:
      "Dùng để giới thiệu bản thân, mô tả nghề nghiệp, địa điểm và trạng thái hiện tại.",
    structures: [
      {
        id: "gs-001",
        formType: GrammarFormType.Affirmative,
        formula: "I am / You are / He is ...",
        example: "I am a student.",
        orderIndex: 1,
      },
      {
        id: "gs-002",
        formType: GrammarFormType.Negative,
        formula: "Subject + am not / is not / are not",
        example: "She is not at home.",
        orderIndex: 2,
      },
      {
        id: "gs-003",
        formType: GrammarFormType.Question,
        formula: "Am / Is / Are + subject + ... ?",
        example: "Are you ready?",
        orderIndex: 3,
      },
    ],
  },
  {
    id: "gn-002",
    lessonId: "les-002",
    title: "Present Simple – Thì hiện tại đơn",
    usageNote:
      "Dùng để diễn tả thói quen, sự thật hiển nhiên và lịch trình cố định.",
    structures: [
      {
        id: "gs-004",
        formType: GrammarFormType.Affirmative,
        formula: "Subject + V(s/es) + object",
        example: "He plays football every weekend.",
        orderIndex: 1,
      },
      {
        id: "gs-005",
        formType: GrammarFormType.Negative,
        formula: "Subject + do/does + not + V-inf",
        example: "They do not like coffee.",
        orderIndex: 2,
      },
      {
        id: "gs-006",
        formType: GrammarFormType.Question,
        formula: "Do/Does + subject + V-inf ?",
        example: "Does she work here?",
        orderIndex: 3,
      },
    ],
  },
];
