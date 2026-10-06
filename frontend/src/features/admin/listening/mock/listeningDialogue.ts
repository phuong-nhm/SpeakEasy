import {
  ExerciseType,
  SectionType,
  SentenceExerciseDto,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

export const mockListeningDialogues: SentenceExerciseDto[] = [
  {
    id: "d0ee9b65-4572-4d3f-9bf8-157d0586f31b",
    lessonId: "4af56f99-e7a5-472a-a808-e02088fe2e32",
    sectionType: SectionType.Dialogue,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "Could you speak slower?",
    distractorSentence: "Could you speak louder?",
    dialogueGroupId: "f4d9f194-5c4b-4db6-a6af-2f5bd4c5f22b",
    orderInGroup: 1,
    audioUrl:
      "https://localhost:44326/uploads/audio/9f2622e4-b542-4a09-9fe4-69b808467838.wav",
    listenOptions: ["Could you speak slower?", "Could you speak louder?"],
  },
  {
    id: "767d3f7e-cfcb-4ed6-b95f-7fbd09fb37ad",
    lessonId: "4af56f99-e7a5-472a-a808-e02088fe2e32",
    sectionType: SectionType.Dialogue,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "Sure, I will speak more slowly.",
    distractorSentence: "Sure, I will speak more loudly.",
    dialogueGroupId: "f4d9f194-5c4b-4db6-a6af-2f5bd4c5f22b",
    orderInGroup: 2,
    audioUrl:
      "https://localhost:44326/uploads/audio/0d8125a7-951d-4605-ad52-f6d924e154f4.wav",
    listenOptions: [
      "Sure, I will speak more slowly.",
      "Sure, I will speak more loudly.",
    ],
  },
  {
    id: "7d2805d2-c805-4d6c-8ed3-f4fdd8a53296",
    lessonId: "4af56f99-e7a5-472a-a808-e02088fe2e32",
    sectionType: SectionType.Dialogue,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "Where is the nearest bus stop?",
    distractorSentence: "Where is the nearest train station?",
    dialogueGroupId: "1d84095f-16ea-4727-98aa-78d1d8dcb8f0",
    orderInGroup: 1,
    audioUrl:
      "https://localhost:44326/uploads/audio/6a1f1f9d-0589-4b7f-b423-7ca10ea5d326.wav",
    listenOptions: [
      "Where is the nearest bus stop?",
      "Where is the nearest train station?",
    ],
  },
  {
    id: "8fd0f462-b678-4fca-9b90-aa95fda75d2b",
    lessonId: "4af56f99-e7a5-472a-a808-e02088fe2e32",
    sectionType: SectionType.Dialogue,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "It is two blocks from here.",
    distractorSentence: "It is two miles from here.",
    dialogueGroupId: "1d84095f-16ea-4727-98aa-78d1d8dcb8f0",
    orderInGroup: 2,
    audioUrl:
      "https://localhost:44326/uploads/audio/1a0d0f6d-8196-4de4-a10d-53cb39e3891b.wav",
    listenOptions: [
      "It is two blocks from here.",
      "It is two miles from here.",
    ],
  },
  {
    id: "a4f96e95-844f-4b32-af74-e6f53bdf89a6",
    lessonId: "4af56f99-e7a5-472a-a808-e02088fe2e32",
    sectionType: SectionType.Dialogue,
    exerciseType: ExerciseType.ListenChoose,
    correctSentence: "Would you like to join us for dinner tonight?",
    distractorSentence: "Would you like to join us for lunch tomorrow?",
    dialogueGroupId: "e772b85c-af49-4384-80cc-07f9438f2234",
    orderInGroup: 1,
    audioUrl:
      "https://localhost:44326/uploads/audio/6d6d9d2d-ec36-42f9-abaf-a50f62985249.wav",
    listenOptions: [
      "Would you like to join us for dinner tonight?",
      "Would you like to join us for lunch tomorrow?",
    ],
  },
];
