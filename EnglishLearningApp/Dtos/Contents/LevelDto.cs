using System;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    public class LevelDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class CreateUpdateLevelDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
