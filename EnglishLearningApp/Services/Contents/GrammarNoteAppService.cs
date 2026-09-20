using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.Services.Contents
{
    public class GrammarNoteAppService : EnglishLearningAppAppService, IGrammarNoteAppService
    {
        private readonly IRepository<GrammarNote, Guid> _grammarNoteRepo;
        private readonly IRepository<GrammarStructureItem, Guid> _structureRepo;

        public GrammarNoteAppService(
            IRepository<GrammarNote, Guid> grammarNoteRepo,
            IRepository<GrammarStructureItem, Guid> structureRepo)
        {
            _grammarNoteRepo = grammarNoteRepo;
            _structureRepo = structureRepo;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<GrammarNoteDto> CreateAsync(CreateUpdateGrammarNoteDto input)
        {
            var grammarNote = new GrammarNote(
                GuidGenerator.Create(),
                input.LessonId,
                input.Title,
                input.UsageNote);

            await _grammarNoteRepo.InsertAsync(grammarNote);

            var structures = BuildStructures(input.Structures, grammarNote.Id);
            await _structureRepo.InsertManyAsync(structures);

            return await BuildDtoAsync(grammarNote);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<GrammarNoteDto> UpdateAsync(Guid id, CreateUpdateGrammarNoteDto input)
        {
            var grammarNote = await _grammarNoteRepo.GetAsync(id);
            grammarNote.Title = input.Title;
            grammarNote.UsageNote = input.UsageNote;
            await _grammarNoteRepo.UpdateAsync(grammarNote);

            // Xoá t?t c? Structures c? và t?o l?i theo input m?i (gi?ng pattern ListeningPassageAppService)
            await _structureRepo.DeleteAsync(x => x.GrammarNoteId == id);
            var structures = BuildStructures(input.Structures, grammarNote.Id);
            await _structureRepo.InsertManyAsync(structures);

            return await BuildDtoAsync(grammarNote);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            // Xoá t?t c? Structures con trý?c
            await _structureRepo.DeleteAsync(x => x.GrammarNoteId == id);
            // Sau ðó xoá GrammarNote
            await _grammarNoteRepo.DeleteAsync(id);
        }

        [AllowAnonymous]
        public async Task<GrammarNoteDto> GetByLessonAsync(Guid lessonId)
        {
            var grammarNoteQueryable = await _grammarNoteRepo.GetQueryableAsync();
            var grammarNote = await AsyncExecuter.FirstOrDefaultAsync(
                grammarNoteQueryable.Where(x => x.LessonId == lessonId));

            if (grammarNote == null)
            {
                throw new UserFriendlyException(L["GrammarNoteNotFound"]);
            }

            return await BuildDtoAsync(grammarNote);
        }

        // ================= PRIVATE =================

        private List<GrammarStructureItem> BuildStructures(List<CreateUpdateGrammarStructureItemDto> inputs, Guid grammarNoteId)
        {
            if (inputs == null || !inputs.Any())
            {
                return new List<GrammarStructureItem>();
            }

            return inputs.Select(x => new GrammarStructureItem(
                GuidGenerator.Create(),
                grammarNoteId,
                x.FormType,
                x.Formula,
                x.Example,
                x.OrderIndex)).ToList();
        }

        private async Task<GrammarNoteDto> BuildDtoAsync(GrammarNote grammarNote)
        {
            var structureQueryable = await _structureRepo.GetQueryableAsync();
            var structures = await AsyncExecuter.ToListAsync(
                structureQueryable.Where(x => x.GrammarNoteId == grammarNote.Id).OrderBy(x => x.OrderIndex));

            var dto = ObjectMapper.Map<GrammarNote, GrammarNoteDto>(grammarNote);
            dto.Structures = structures.Select(s => ObjectMapper.Map<GrammarStructureItem, GrammarStructureItemDto>(s)).ToList();
            return dto;
        }
    }
}
