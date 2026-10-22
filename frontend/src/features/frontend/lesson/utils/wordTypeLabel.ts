import { WordType } from "../types/lesson";

export const WORD_TYPE_LABELS: Record<WordType, string> = {
  [WordType.Noun]: "n",
  [WordType.Verb]: "v",
  [WordType.Adjective]: "adj",
  [WordType.Adverb]: "adv",
  [WordType.Preposition]: "prep",
  [WordType.Phrase]: "phr",
  [WordType.Other]: "",
};
