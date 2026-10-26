using EnglishLearningApp.Infrastructure;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services.UploadFile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace EnglishLearningApp.Controllers
{
    [Route("api/app/media-upload")]
    [Authorize] // Chỉ Admin CMS được gọi API này
    public class MediaUploadController : AbpController
    {
        private readonly ICloudinaryService _cloudinaryService;

        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private static readonly string[] AllowedAudioExtensions = { ".mp3", ".wav" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
        private const int MaxFilesPerBatch = 50;

        public MediaUploadController(ICloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Upload 1 file ảnh hoặc audio. type = "image" hoặc "audio".
        /// Trả về URL Cloudinary để Admin gán vào ImageUrl/AudioUrl của Vocabulary, SentenceExercise...
        /// </summary>
        [HttpPost]
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        [CustomRateLimit(20, 0.5)]
        public async Task<IActionResult> UploadAsync(IFormFile file, [FromQuery] string type = "image")
        {
            var url = await SaveFileAsync(file, type);
            return Ok(new { url });
        }

        /// <summary>
        /// Upload nhiều file cùng lúc (dùng cho import hàng loạt Vocabulary/SentenceExercise).
        /// </summary>
        [HttpPost("many")]
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        [CustomRateLimit(20, 0.5)]
        public async Task<IActionResult> UploadManyAsync(List<IFormFile> files, [FromQuery] string type = "image")
        {
            if (files == null || !files.Any())
            {
                throw new UserFriendlyException(L["NoFilesUploaded"]);
            }

            if (files.Count > MaxFilesPerBatch)
            {
                throw new UserFriendlyException(L["TooManyFilesInBatch"]);
            }

            var results = new List<object>();

            foreach (var file in files)
            {
                var url = await SaveFileAsync(file, type);
                results.Add(new
                {
                    fileName = Path.GetFileNameWithoutExtension(file.FileName), // để FE khớp theo "word"
                    originalFileName = file.FileName,
                    url
                });
            }

            return Ok(results);
        }

        private async Task<string> SaveFileAsync(IFormFile file, string type)
        {
            if (file == null || file.Length == 0)
            {
                throw new UserFriendlyException(L["NoFilesUploaded"]);
            }

            if (file.Length > MaxFileSizeBytes)
            {
                throw new UserFriendlyException(L["FileTooLarge"]);
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = type == "audio" ? AllowedAudioExtensions : AllowedImageExtensions;

            if (!allowedExtensions.Contains(extension))
            {
                throw new UserFriendlyException(L["UnsupportedFileExtension", extension]);
            }

            var folder = type == "audio" ? "uploads/audio" : "uploads/images";

            var url = await _cloudinaryService.UploadFileAsync(file, folder);

            if (string.IsNullOrWhiteSpace(url))
            {
                throw new UserFriendlyException("Upload lên Cloudinary thất bại, thử lại sau.");
            }

            return url;
        }
    }
}