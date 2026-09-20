using System;
using System.Collections.Generic;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    public class GrammarNoteDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public string Title { get; set; }
        public string UsageNote { get; set; }
        public List<GrammarStructureItemDto> Structures { get; set; }
    }

    public class GrammarStructureItemDto : EntityDto<Guid>
    {
        public GrammarFormType FormType { get; set; }
        public string Formula { get; set; }
        public string Example { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateUpdateGrammarNoteDto
    {
        public Guid LessonId { get; set; }
        public string Title { get; set; }
        public string UsageNote { get; set; }
        public List<CreateUpdateGrammarStructureItemDto> Structures { get; set; }
    }

    public class CreateUpdateGrammarStructureItemDto
    {
        public GrammarFormType FormType { get; set; }
        public string Formula { get; set; }
        public string Example { get; set; }
        public int OrderIndex { get; set; }
    }
}
