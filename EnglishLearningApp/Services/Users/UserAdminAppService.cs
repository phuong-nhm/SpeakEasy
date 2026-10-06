using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Data;
using EnglishLearningApp.Dtos.Users;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Identity;

namespace EnglishLearningApp.AppServices.Users
{
    [Authorize(IdentityPermissions.Users.Default)]
    [Route("api/app/admin-users")]
    public class UserAdminAppService : EnglishLearningAppAppService, IUserAdminAppService
    {
        private readonly IDbContextProvider<EnglishLearningAppDbContext> _dbContextProvider;

        public UserAdminAppService(IDbContextProvider<EnglishLearningAppDbContext> dbContextProvider)
        {
            _dbContextProvider = dbContextProvider;
        }

        [HttpGet("list-with-roles")]
        public async Task<PagedResultDto<UserWithRolesDto>> GetListWithRolesAsync([FromQuery] GetUserListWithRolesInput input)
        {
            var dbContext = await _dbContextProvider.GetDbContextAsync();
            var maxResultCount = input.MaxResultCount <= 0 ? 10 : input.MaxResultCount;
            var skipCount = input.SkipCount < 0 ? 0 : input.SkipCount;

            var usersQuery = dbContext.Set<IdentityUser>().AsNoTracking();

            if (!string.IsNullOrWhiteSpace(input.Filter))
            {
                var keyword = input.Filter.Trim();
                usersQuery = usersQuery.Where(user =>
                    (user.UserName != null && user.UserName.Contains(keyword)) ||
                    (user.Name != null && user.Name.Contains(keyword)) ||
                    (user.Surname != null && user.Surname.Contains(keyword)) ||
                    (user.Email != null && user.Email.Contains(keyword)) ||
                    (user.PhoneNumber != null && user.PhoneNumber.Contains(keyword))
                );
            }

            if (!string.IsNullOrWhiteSpace(input.RoleName))
            {
                var roleName = input.RoleName.Trim();
                var userRolesQuery = dbContext.Set<IdentityUserRole>().AsNoTracking();
                var rolesQuery = dbContext.Set<IdentityRole>().AsNoTracking();

                usersQuery = (
                    from user in usersQuery
                    join userRole in userRolesQuery on user.Id equals userRole.UserId
                    join role in rolesQuery on userRole.RoleId equals role.Id
                    where role.Name == roleName
                    select user
                ).Distinct();
            }

            var totalCount = await usersQuery.LongCountAsync();
            var sortedUsersQuery = ApplySorting(usersQuery, input.Sorting);
            var pageUsers = await sortedUsersQuery
                .Skip(skipCount)
                .Take(maxResultCount)
                .ToListAsync();

            var userIds = pageUsers.Select(user => user.Id).ToList();
            var roleLookup = new Dictionary<Guid, List<string>>();

            if (userIds.Count > 0)
            {
                var userRolesQuery = dbContext.Set<IdentityUserRole>().AsNoTracking();
                var rolesQuery = dbContext.Set<IdentityRole>().AsNoTracking();

                var roleRows = await (
                    from userRole in userRolesQuery
                    join role in rolesQuery on userRole.RoleId equals role.Id
                    where userIds.Contains(userRole.UserId)
                    select new { userRole.UserId, role.Name }
                ).ToListAsync();

                roleLookup = roleRows
                    .Where(row => !string.IsNullOrWhiteSpace(row.Name))
                    .GroupBy(row => row.UserId)
                    .ToDictionary(
                        group => group.Key,
                        group => group
                            .Select(row => row.Name!)
                            .Distinct()
                            .OrderBy(name => name)
                            .ToList()
                    );
            }

            var items = pageUsers.Select(user =>
            {
                roleLookup.TryGetValue(user.Id, out var roleNames);

                return new UserWithRolesDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    IsActive = user.IsActive,
                    LockoutEnabled = user.LockoutEnabled,
                    CreationTime = user.CreationTime,
                    ConcurrencyStamp = user.ConcurrencyStamp,
                    RoleNames = roleNames ?? new List<string>()
                };
            }).ToList();

            return new PagedResultDto<UserWithRolesDto>(totalCount, items);
        }

        private static IQueryable<IdentityUser> ApplySorting(
            IQueryable<IdentityUser> query,
            string? sorting)
        {
            var sortingValue = sorting?.Trim();
            if (string.IsNullOrWhiteSpace(sortingValue))
            {
                return query.OrderBy(user => user.UserName);
            }

            var parts = sortingValue.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var field = parts[0].ToLowerInvariant();
            var isDescending =
                parts.Length > 1 &&
                parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);

            return field switch
            {
                "username" => isDescending
                    ? query.OrderByDescending(user => user.UserName)
                    : query.OrderBy(user => user.UserName),
                "name" => isDescending
                    ? query.OrderByDescending(user => user.Name)
                    : query.OrderBy(user => user.Name),
                "surname" => isDescending
                    ? query.OrderByDescending(user => user.Surname)
                    : query.OrderBy(user => user.Surname),
                "email" => isDescending
                    ? query.OrderByDescending(user => user.Email)
                    : query.OrderBy(user => user.Email),
                "creationtime" => isDescending
                    ? query.OrderByDescending(user => user.CreationTime)
                    : query.OrderBy(user => user.CreationTime),
                _ => query.OrderBy(user => user.UserName)
            };
        }
    }
}
