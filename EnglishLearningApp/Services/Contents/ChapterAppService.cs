using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class ChapterAppService : EnglishLearningAppAppService, IChapterAppService
    {
        private readonly IRepository<Chapter, Guid> _chapterRepo;

        public ChapterAppService(IRepository<Chapter, Guid> chapterRepo)
        {
            _chapterRepo = chapterRepo;
        }

        public async Task<List<ChapterDto>> GetListByLevelAsync(Guid levelId)
        {
            var queryable = await _chapterRepo.GetQueryableAsync();
            var query = queryable
                .Where(x => x.LevelId == levelId)
                .OrderBy(x => x.OrderIndex);

            var chapters = await AsyncExecuter.ToListAsync(query);
            return ObjectMapper.Map<List<Chapter>, List<ChapterDto>>(chapters);
        }

        public async Task<ChapterDto> GetAsync(Guid id)
        {
            var chapter = await _chapterRepo.GetAsync(id);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }

        public async Task<ChapterDto> CreateAsync(CreateUpdateChapterDto input)
        {
            var chapter = ObjectMapper.Map<CreateUpdateChapterDto, Chapter>(input);
            await _chapterRepo.InsertAsync(chapter);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }

        public async Task<ChapterDto> UpdateAsync(Guid id, CreateUpdateChapterDto input)
        {
            var chapter = await _chapterRepo.GetAsync(id);
            ObjectMapper.Map(input, chapter);
            await _chapterRepo.UpdateAsync(chapter);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _chapterRepo.DeleteAsync(id);
        }
    }
}
