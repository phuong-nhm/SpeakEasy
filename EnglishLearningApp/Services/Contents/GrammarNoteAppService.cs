using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.Services.Contents
{
    public class GrammarNoteAppService : EnglishLearningAppAppService, IGrammarNoteAppService
    {
        private const int MaxBatchSize = 200;

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

            // Xoá tất cả Structures cũ và tạo lại theo input mới (giống pattern ListeningPassageAppService)
            await _structureRepo.DeleteAsync(x => x.GrammarNoteId == id);
            var structures = BuildStructures(input.Structures, grammarNote.Id);
            await _structureRepo.InsertManyAsync(structures);

            return await BuildDtoAsync(grammarNote);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            // Xoá tất cả Structures con trước
            await _structureRepo.DeleteAsync(x => x.GrammarNoteId == id);
            // Sau đó xoá GrammarNote
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

        // Nhập hàng loạt - validate đủ field bắt buộc trước, rồi insert
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<List<GrammarNoteDto>> CreateManyAsync(List<CreateUpdateGrammarNoteDto> inputs)
        {
            if (inputs == null || !inputs.Any())
            {
                throw new UserFriendlyException(L["ImportListCannotBeEmpty"]);
            }

            if (inputs.Count > MaxBatchSize)
            {
                throw new UserFriendlyException(L["ImportBatchTooLarge"]);
            }

            // Validate: không cho LessonId trùng trong danh sách input
            var inputLessonIds = inputs.Select(x => x.LessonId).ToList();
            var duplicateCount = inputLessonIds.Count - inputLessonIds.Distinct().Count();
            if (duplicateCount > 0)
            {
                throw new UserFriendlyException(L["DuplicateLessonIdInGrammarNote"]);
            }

            // Validate: check LessonId đã có GrammarNote trong DB chưa
            var grammarNoteQueryable = await _grammarNoteRepo.GetQueryableAsync();
            var existingLessonIds = await AsyncExecuter.ToListAsync(
                grammarNoteQueryable.Where(x => inputLessonIds.Contains(x.LessonId)).Select(x => x.LessonId));

            if (existingLessonIds.Any())
            {
                var duplicateLessonId = existingLessonIds.First();
                throw new UserFriendlyException(L["GrammarNoteAlreadyExistsForLesson", duplicateLessonId.ToString()]);
            }

            // Validate: mỗi GrammarNote phải có đủ Formula cho từng FormType (Affirmative, Negative, Question)
            foreach (var input in inputs)
            {
                ValidateStructures(input, input.LessonId.ToString());
            }

            // Tất cả validation pass -> insert
            var grammarNotes = new List<GrammarNote>();
            var allStructures = new List<GrammarStructureItem>();

            foreach (var input in inputs)
            {
                var grammarNote = new GrammarNote(
                    GuidGenerator.Create(),
                    input.LessonId,
                    input.Title,
                    input.UsageNote);

                grammarNotes.Add(grammarNote);

                var structures = BuildStructures(input.Structures, grammarNote.Id);
                allStructures.AddRange(structures);
            }

            await _grammarNoteRepo.InsertManyAsync(grammarNotes);
            await _structureRepo.InsertManyAsync(allStructures);

            // Build DTO trả về
            return (await Task.WhenAll(grammarNotes.Select(BuildDtoAsync))).ToList();
        }

        // Danh sách phân trang - dùng cho màn CMS Admin
        [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<PagedResultDto<GrammarNoteDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            var grammarNoteQueryable = await _grammarNoteRepo.GetQueryableAsync();

            // Mặc định sort theo LessonId nếu Sorting rỗng
            grammarNoteQueryable = grammarNoteQueryable.OrderBy(x => x.LessonId);

            // Phân trang
            var totalCount = await AsyncExecuter.CountAsync(grammarNoteQueryable);
            var items = await AsyncExecuter.ToListAsync(
                grammarNoteQueryable.Skip(input.SkipCount).Take(input.MaxResultCount));

            // Build DTO
            var itemDtos = await Task.WhenAll(items.Select(BuildDtoAsync));

            return new PagedResultDto<GrammarNoteDto>(
                totalCount,
                itemDtos.ToList());
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

        // Validate input structures cho CreateManyAsync
        private void ValidateStructures(CreateUpdateGrammarNoteDto input, string lessonIdentifier)
        {
            if (input.Structures == null || !input.Structures.Any())
            {
                return;
            }

            // Kiểm tra mỗi FormType (Affirmative=0, Negative=1, Question=2) đều có Formula không rỗng
            var formTypes = new[] 
            { 
                GrammarFormType.Affirmative, 
                GrammarFormType.Negative, 
                GrammarFormType.Question 
            };

            foreach (var formType in formTypes)
            {
                var hasFormula = input.Structures.Any(x => 
                    x.FormType == formType && !string.IsNullOrWhiteSpace(x.Formula));

                if (!hasFormula)
                {
                    throw new UserFriendlyException(
                        L["MissingFormulaForGrammarFormType", lessonIdentifier, formType.ToString()]);
                }
            }
        }
    }
}
