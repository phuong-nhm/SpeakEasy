export enum GrammarFormType {
  Affirmative = 0,
  Negative = 1,
  Question = 2,
}

export interface GrammarStructureItemDto {
  id?: string;
  formType: GrammarFormType;
  formula: string;
  example: string;
  orderIndex: number;
}

export interface GrammarNoteDto {
  id: string;
  lessonId: string;
  title: string;
  usageNote?: string;
  structures: GrammarStructureItemDto[];
}

export interface CreateUpdateGrammarNoteDto {
  lessonId: string;
  title: string;
  usageNote?: string;
  structures: GrammarStructureItemDto[];
}
