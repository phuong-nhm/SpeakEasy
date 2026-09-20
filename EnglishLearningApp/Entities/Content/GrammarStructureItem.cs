using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    public class GrammarStructureItem : Entity<Guid>
    {
        public Guid GrammarNoteId { get; set; }
        public GrammarFormType FormType { get; set; }
        public string Formula { get; set; } // "S + V(s/es) + O"
        public string Example { get; set; } // "She plays tennis."
        public int OrderIndex { get; set; }

        public GrammarNote GrammarNote { get; set; }

        protected GrammarStructureItem() { }

        public GrammarStructureItem(
            Guid id, Guid grammarNoteId, GrammarFormType formType,
            string formula, string example, int orderIndex) : base(id)
        {
            GrammarNoteId = grammarNoteId;
            FormType = formType;
            Formula = formula;
            Example = example;
            OrderIndex = orderIndex;
        }
    }
}
