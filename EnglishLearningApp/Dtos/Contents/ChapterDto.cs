using System;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    public class ChapterDto : EntityDto<Guid>
    {
        public Guid LevelId { get; set; }
        public string Title { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateUpdateChapterDto
    {
        public Guid LevelId { get; set; }
        public string Title { get; set; }
        public int OrderIndex { get; set; }
    }
}
