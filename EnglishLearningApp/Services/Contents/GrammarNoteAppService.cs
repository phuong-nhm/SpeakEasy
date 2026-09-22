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
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly IRepository<Chapter, Guid> _chapterRepo;

        public GrammarNoteAppService(
            IRepository<GrammarNote, Guid> grammarNoteRepo,
            IRepository<GrammarStructureItem, Guid> structureRepo,
            IRepository<Lesson, Guid> lessonRepo,
            IRepository<Chapter, Guid> chapterRepo)
        {
            _grammarNoteRepo = grammarNoteRepo;
            _structureRepo = structureRepo;
            _lessonRepo = lessonRepo;
            _chapterRepo = chapterRepo;
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

        [AllowAnonymous]
        public async Task<List<GrammarNoteDto>> GetListByChapterAsync(Guid chapterId)
        {
            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var lessonIds = await AsyncExecuter.ToListAsync(
                lessonQueryable
                    .Where(x => x.ChapterId == chapterId)
                    .Select(x => x.Id));

            if (!lessonIds.Any())
            {
                return new List<GrammarNoteDto>();
            }

            var grammarNoteQueryable = await _grammarNoteRepo.GetQueryableAsync();
            var grammarNotes = await AsyncExecuter.ToListAsync(
                grammarNoteQueryable
                    .Where(x => lessonIds.Contains(x.LessonId))
                    .OrderBy(x => x.LessonId));

            if (!grammarNotes.Any())
            {
                return new List<GrammarNoteDto>();
            }

            // 1. Query 1 LẦN duy nhất lấy tất cả Structure của các Note này
            var noteIds = grammarNotes.Select(x => x.Id).ToList();
            var structureQueryable = await _structureRepo.GetQueryableAsync();
            var allStructures = await AsyncExecuter.ToListAsync(
                structureQueryable.Where(x => noteIds.Contains(x.GrammarNoteId))
            );

            // 2. Map sang DTO và gán Structures trên RAM
            var itemDtos = ObjectMapper.Map<List<GrammarNote>, List<GrammarNoteDto>>(grammarNotes);

            foreach (var dto in itemDtos)
            {
                dto.Structures = allStructures
                    .Where(s => s.GrammarNoteId == dto.Id)
                    .Select(s => ObjectMapper.Map<GrammarStructureItem, GrammarStructureItemDto>(s))
                    .ToList();
            }

            return itemDtos;
        }
        [AllowAnonymous]
        public async Task<PagedResultDto<GrammarNoteDto>> GetListByLevelPagedAsync(Guid levelId, PagedAndSortedResultRequestDto input)
        {
            var chapterQueryable = await _chapterRepo.GetQueryableAsync();
            var chapterIds = await AsyncExecuter.ToListAsync(
                chapterQueryable
                    .Where(x => x.LevelId == levelId)
                    .Select(x => x.Id));

            if (!chapterIds.Any())
            {
                return new PagedResultDto<GrammarNoteDto>(0, new List<GrammarNoteDto>());
            }

            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var lessonIds = await AsyncExecuter.ToListAsync(
                lessonQueryable
                    .Where(x => chapterIds.Contains(x.ChapterId))
                    .Select(x => x.Id));

            if (!lessonIds.Any())
            {
                return new PagedResultDto<GrammarNoteDto>(0, new List<GrammarNoteDto>());
            }

            var grammarNoteQueryable = await _grammarNoteRepo.GetQueryableAsync();
            var filteredQuery = grammarNoteQueryable
                .Where(x => lessonIds.Contains(x.LessonId))
                .OrderBy(x => x.LessonId);

            var totalCount = await AsyncExecuter.CountAsync(filteredQuery);
            var items = await AsyncExecuter.ToListAsync(
                filteredQuery.Skip(input.SkipCount).Take(input.MaxResultCount));

            if (!items.Any())
            {
                return new PagedResultDto<GrammarNoteDto>(totalCount, new List<GrammarNoteDto>());
            }

            // 1. Lấy tất cả Structure của danh sách items phân trang chỉ bằng 1 câu Query
            var itemIds = items.Select(x => x.Id).ToList();
            var structureQueryable = await _structureRepo.GetQueryableAsync();
            var allStructures = await AsyncExecuter.ToListAsync(
                structureQueryable.Where(x => itemIds.Contains(x.GrammarNoteId))
            );

            // 2. Map sang DTO và gom nhóm Structures trên bộ nhớ RAM
            var itemDtos = ObjectMapper.Map<List<GrammarNote>, List<GrammarNoteDto>>(items);

            foreach (var dto in itemDtos)
            {
                dto.Structures = allStructures
                    .Where(s => s.GrammarNoteId == dto.Id)
                    .Select(s => ObjectMapper.Map<GrammarStructureItem, GrammarStructureItemDto>(s))
                    .ToList();
            }

            return new PagedResultDto<GrammarNoteDto>(totalCount, itemDtos);
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
            // foreach (var input in inputs)
            // {
            //     ValidateStructures(input, input.LessonId.ToString());
            // }

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

            // 1. Map danh sách GrammarNote sang GrammarNoteDto (Structures lúc này sẽ rỗng/null do Profile Ignored)
            var resultDtos = ObjectMapper.Map<List<GrammarNote>, List<GrammarNoteDto>>(grammarNotes);

            // 2. Tự gán Structures đã map vào từng DTO tương ứng
            foreach (var dto in resultDtos)
            {
                dto.Structures = allStructures
                    .Where(s => s.GrammarNoteId == dto.Id)
                    .Select(s => ObjectMapper.Map<GrammarStructureItem, GrammarStructureItemDto>(s))
                    .ToList();
            }

            return resultDtos;
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
