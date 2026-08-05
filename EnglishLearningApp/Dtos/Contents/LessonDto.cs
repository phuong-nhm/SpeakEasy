using System;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    public class LessonDto : EntityDto<Guid>
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; }
        public LessonType LessonType { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateUpdateLessonDto
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; }
        public LessonType LessonType { get; set; }
        public int OrderIndex { get; set; }
    }
}
