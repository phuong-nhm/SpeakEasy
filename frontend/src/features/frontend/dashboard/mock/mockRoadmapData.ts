import { LevelDto } from "../types/roadmap";

const createChapter = (
  id: string,
  title: string,
  description: string,
  order: number,
  lessons: LevelDto["chapters"][number]["lessons"],
) => ({
  id,
  title,
  description,
  order,
  lessons,
});

export const mockRoadmapLevels: LevelDto[] = [
  {
    id: "level-1",
    title: "Starter English Path",
    levelNumber: 1,
    chapters: [
      createChapter(
        "chapter-1",
        "Foundation Basics",
        "Build confidence with core words, pronouns, and beginner sentence patterns.",
        1,
        [
          {
            id: "lesson-1",
            title: "Greetings & Self Introduction",
            order: 1,
            isCompleted: true,
            isLocked: false,
            totalQuestions: 10,
          },
          {
            id: "lesson-2",
            title: "Daily Routines",
            order: 2,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 12,
          },
          {
            id: "lesson-3",
            title: "Numbers & Time",
            order: 3,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 14,
          },
        ],
      ),
      createChapter(
        "chapter-2",
        "Everyday Communication",
        "Practice useful phrases and sentence building for real-life situations.",
        2,
        [
          {
            id: "lesson-4",
            title: "Ordering Food",
            order: 4,
            isCompleted: true,
            isLocked: false,
            totalQuestions: 11,
          },
          {
            id: "lesson-5",
            title: "Asking for Directions",
            order: 5,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 13,
          },
          {
            id: "lesson-6",
            title: "Travel Conversation",
            order: 6,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 15,
          },
        ],
      ),
    ],
  },
  {
    id: "level-2",
    title: "Conversation Boost",
    levelNumber: 2,
    chapters: [
      createChapter(
        "chapter-3",
        "Short Talking Skills",
        "Use practical conversational patterns for daily interactions.",
        1,
        [
          {
            id: "lesson-7",
            title: "Making small talk",
            order: 7,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 12,
          },
          {
            id: "lesson-8",
            title: "Phone conversations",
            order: 8,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 11,
          },
          {
            id: "lesson-9",
            title: "Meeting new people",
            order: 9,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 10,
          },
        ],
      ),
      createChapter(
        "chapter-4",
        "Real World English",
        "Speak more naturally in social and travel situations.",
        2,
        [
          {
            id: "lesson-10",
            title: "At the café",
            order: 10,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 13,
          },
          {
            id: "lesson-11",
            title: "In the market",
            order: 11,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 12,
          },
          {
            id: "lesson-12",
            title: "Expressing opinions",
            order: 12,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 14,
          },
        ],
      ),
    ],
  },
  {
    id: "level-3",
    title: "Fluency Builder",
    levelNumber: 3,
    chapters: [
      createChapter(
        "chapter-5",
        "Storytelling Flow",
        "Turn short ideas into polished spoken English.",
        1,
        [
          {
            id: "lesson-13",
            title: "Telling a story",
            order: 13,
            isCompleted: false,
            isLocked: false,
            totalQuestions: 15,
          },
          {
            id: "lesson-14",
            title: "Describing an event",
            order: 14,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 12,
          },
          {
            id: "lesson-15",
            title: "Narrating past experiences",
            order: 15,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 14,
          },
        ],
      ),
      createChapter(
        "chapter-6",
        "Writing for Speaking",
        "Connect grammar and vocabulary into natural communication.",
        2,
        [
          {
            id: "lesson-16",
            title: "Sentence structure",
            order: 16,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 16,
          },
          {
            id: "lesson-17",
            title: "Linking ideas",
            order: 17,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 15,
          },
          {
            id: "lesson-18",
            title: "Mini presentation",
            order: 18,
            isCompleted: false,
            isLocked: true,
            totalQuestions: 18,
          },
        ],
      ),
    ],
  },
];

export const mockRoadmapLevel = mockRoadmapLevels[0];
