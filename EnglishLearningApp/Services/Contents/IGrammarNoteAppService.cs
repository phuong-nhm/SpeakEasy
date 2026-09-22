using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Contents
{
    public interface IGrammarNoteAppService : IApplicationService
    {
        Task<GrammarNoteDto> CreateAsync(CreateUpdateGrammarNoteDto input);
        Task<GrammarNoteDto> UpdateAsync(Guid id, CreateUpdateGrammarNoteDto input);
        Task<GrammarNoteDto> GetByLessonAsync(Guid lessonId);
        Task<List<GrammarNoteDto>> GetListByChapterAsync(Guid chapterId);
        Task<PagedResultDto<GrammarNoteDto>> GetListByLevelPagedAsync(Guid levelId, PagedAndSortedResultRequestDto input);
        Task DeleteAsync(Guid id);
        Task<List<GrammarNoteDto>> CreateManyAsync(List<CreateUpdateGrammarNoteDto> inputs);
        Task<PagedResultDto<GrammarNoteDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    }
}
