using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Contents
{
    public interface IGrammarNoteAppService : IApplicationService
    {
        Task<GrammarNoteDto> CreateAsync(CreateUpdateGrammarNoteDto input);
        Task<GrammarNoteDto> UpdateAsync(Guid id, CreateUpdateGrammarNoteDto input);
        Task<GrammarNoteDto> GetByLessonAsync(Guid lessonId);
        Task DeleteAsync(Guid id);
    }
}
