using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        public MediaUploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Upload 1 file ảnh hoặc audio. type = "image" hoặc "audio".
        /// Trả về URL để Admin gán vào ImageUrl/AudioUrl của Vocabulary, SentenceExercise...
        /// </summary>
        [HttpPost]
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
    }
}
