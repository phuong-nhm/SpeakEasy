using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace EnglishLearningApp.Services.UploadFile
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration config)
        {
            var cloudName = config["CloudinarySettings:CloudName"];
            var apiKey = config["CloudinarySettings:ApiKey"];
            var apiSecret = config["CloudinarySettings:ApiSecret"];

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0) return null;

            using var stream = file.OpenReadStream();

            RawUploadParams uploadParams;

            // Nếu là file Audio (.mp3, .wav...) hoặc Video
            if (file.ContentType.StartsWith("audio") || file.ContentType.StartsWith("video"))
            {
                uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName
                };
            }
            else // Nếu là file Ảnh (jpg, png...)
            {
                uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName
                };
            }

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            // Trả về link URL công khai đầy đủ (https://res.cloudinary.com/...)
            return uploadResult.SecureUrl?.ToString();
        }
        public async Task<string> UploadBytesAsync(byte[] fileBytes, string fileName, string folderName, bool isAudio)
        {
            if (fileBytes == null || fileBytes.Length == 0) return null;

            using var stream = new MemoryStream(fileBytes);

            RawUploadParams uploadParams = isAudio
                ? new VideoUploadParams // Cloudinary coi audio là "video" resource type
                {
                    File = new FileDescription(fileName, stream),
                    Folder = folderName
                }
                : new ImageUploadParams
                {
                    File = new FileDescription(fileName, stream),
                    Folder = folderName
                };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl?.ToString();
        }
    }
}