using System;
using System.Collections.Generic;

namespace EnglishLearningApp.Dtos.Users
{
    public class UserWithRolesDto
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string? Name { get; set; }

        public string? Surname { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public bool IsActive { get; set; }

        public bool LockoutEnabled { get; set; }

        public DateTime CreationTime { get; set; }

        public string? ConcurrencyStamp { get; set; }

        public List<string> RoleNames { get; set; } = new();
    }
}
