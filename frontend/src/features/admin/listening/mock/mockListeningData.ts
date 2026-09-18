import {
  ListeningPassageDto,
  ListeningQuestionType,
} from "@/features/admin/listening/types/listening";

export const mockListeningPassages: ListeningPassageDto[] = [
  {
    id: "listen-001",
    chapterId: "chap-001",
    title: "Greetings at the reception",
    transcript:
      "Good morning. Welcome to Sunrise English Center. My name is Anna and I will help you with the registration form today. Please have a seat and tell me your full name, email address, and preferred study schedule.",
    audioUrl: "https://example.com/audio/listening/reception.mp3",
    questions: [
      {
        id: "listen-q-001",
        passageId: "listen-001",
        questionType: ListeningQuestionType.MultipleChoice,
        questionText: "What does Anna ask the learner to do first?",
        optionA: "Fill in the registration form",
        optionB: "Read a short story",
        optionC: "Buy a textbook",
        optionD: "Go home immediately",
        correctOptionKey: "A",
        orderIndex: 1,
      },
      {
        id: "listen-q-002",
        passageId: "listen-001",
        questionType: ListeningQuestionType.Essay,
        questionText: "What information does Anna want from the learner?",
        orderIndex: 2,
      },
    ],
  },
  {
    id: "listen-002",
    chapterId: "chap-002",
    title: "Ordering lunch at a cafe",
    transcript:
      "Hi, can I get a chicken sandwich and a small orange juice, please? Sure. Would you like the sandwich toasted? Yes, please. That will be ready in about ten minutes.",
    audioUrl: "https://example.com/audio/listening/cafe-order.mp3",
    questions: [
      {
        id: "listen-q-003",
        passageId: "listen-002",
        questionType: ListeningQuestionType.MultipleChoice,
        questionText: "What does the customer order?",
        optionA: "A chicken sandwich and orange juice",
        optionB: "A burger and tea",
        optionC: "A salad and coffee",
        optionD: "Pizza and water",
        correctOptionKey: "A",
        orderIndex: 1,
      },
      {
        id: "listen-q-004",
        passageId: "listen-002",
        questionType: ListeningQuestionType.MultipleChoice,
        questionText: "How long will the food take?",
        optionA: "About ten minutes",
        optionB: "About one hour",
        optionC: "Tomorrow morning",
        optionD: "Right away",
        correctOptionKey: "A",
        orderIndex: 2,
      },
      {
        id: "listen-q-005",
        passageId: "listen-002",
        questionType: ListeningQuestionType.Essay,
        questionText: "What question does the cashier ask about the sandwich?",
        orderIndex: 3,
      },
    ],
  },
];
