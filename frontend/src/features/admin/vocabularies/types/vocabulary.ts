export enum WordType {
  Noun = 0, // Danh từ
  Verb = 1, // Động từ
  Adjective = 2, // Tính từ
  Adverb = 3, // Trạng từ
  Preposition = 4, // Giới từ
  Phrase = 5, // Cụm từ
  Other = 6, // Khác
}

// Map nhãn tiếng Việt hiển thị trên UI CMS
export const WordTypeLabels: Record<WordType, string> = {
  [WordType.Noun]: "Danh từ (n)",
  [WordType.Verb]: "Động từ (v)",
  [WordType.Adjective]: "Tính từ (adj)",
  [WordType.Adverb]: "Trạng từ (adv)",
  [WordType.Preposition]: "Giới từ (prep)",
  [WordType.Phrase]: "Cụm từ (phrase)",
  [WordType.Other]: "Khác (other)",
};
export interface VocabularyDto {
  id: string; // Guid
  lessonId: string; // Guid
  word: string;
  meaning: string;
  imageUrl?: string;
  audioUrl?: string;
  wordType: WordType;
}

export interface CreateUpdateVocabularyDto {
  lessonId: string;
  word: string;
  meaning: string;
  distractor: string; // Từ gây nhiễu cho Quiz
  imageUrl?: string;
  audioUrl?: string;
  wordType: WordType;
}

// Dùng cho Admin paste JSON Import hàng loạt
export interface BatchImportVocabularyItem {
  lessonId?: string;
  word: string;
  meaning: string;
  distractor: string;
  imageUrl?: string;
  audioUrl?: string;
  wordType: WordType;
}
