using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Progresses
{
    public class UserProgressDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class UserLessonReviewDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public int CurrentIntervalStage { get; set; } // 0=3h,1=1d,2=3d,3=1w,4=2w,5=1m
        public DateTime NextReviewTime { get; set; }
        public bool IsCompletedAllStages { get; set; }
    }

    // Input khi user hoàn thành 1 lượt ôn tập
    public class CompleteReviewDto
    {
        public Guid LessonId { get; set; }
        public bool IsCorrect { get; set; }
    }

    // Dùng cho badge "Đến hạn ôn tập" - chỉ trả gọn, không cần đủ field như UserLessonReviewDto
    public class DueReviewSummaryDto
    {
        public int Count { get; set; }
        public List<DueReviewItemDto> Items { get; set; }
    }

    public class DueReviewItemDto
    {
        public Guid LessonId { get; set; }
        public string LessonTitle { get; set; }
        public DateTime NextReviewTime { get; set; }
    }
}
