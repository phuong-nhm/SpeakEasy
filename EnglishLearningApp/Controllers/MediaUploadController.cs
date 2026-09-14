using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
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
        private readonly IWebHostEnvironment _env;

        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private static readonly string[] AllowedAudioExtensions = { ".mp3", ".wav" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
        private const int MaxFilesPerBatch = 50;
        public MediaUploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Upload 1 file ảnh hoặc audio. type = "image" hoặc "audio".
        /// Trả về URL để Admin gán vào ImageUrl/AudioUrl của Vocabulary, SentenceExercise...
        /// </summary>
        [HttpPost]
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<IActionResult> UploadAsync(IFormFile file, [FromQuery] string type = "image")
        {
            if (file == null || file.Length == 0)
            {
                throw new UserFriendlyException("Chưa có file nào được gửi lên.");
            }

            if (file.Length > MaxFileSizeBytes)
            {
                throw new UserFriendlyException("File vượt quá dung lượng cho phép (5MB).");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = type == "audio" ? AllowedAudioExtensions : AllowedImageExtensions;

            if (!allowedExtensions.Contains(extension))
            {
                throw new UserFriendlyException($"Định dạng file '{extension}' không được hỗ trợ.");
            }

            var subFolder = type == "audio" ? "audio" : "images";
            var uploadDirectory = Path.Combine(_env.WebRootPath, "uploads", subFolder);
            Directory.CreateDirectory(uploadDirectory);

            // Đặt tên file random để tránh trùng / ghi đè file cũ
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/uploads/{subFolder}/{fileName}";

            return Ok(new { url });
        }
        /// <summary>
        /// Upload nhiều file cùng lúc (dùng cho import hàng loạt Vocabulary/SentenceExercise).
        /// Trả về danh sách kèm tên file gốc để FE tự khớp vào đúng dòng theo quy ước đặt tên
        /// (ví dụ file "abandon.jpg" sẽ khớp với item có Word = "abandon").
        /// </summary>
        [HttpPost("many")]
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
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

            var subFolder = type == "audio" ? "audio" : "images";
            var uploadDirectory = Path.Combine(_env.WebRootPath, "uploads", subFolder);
            Directory.CreateDirectory(uploadDirectory);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{subFolder}/{fileName}";
        }
    }
}
