using EnglishLearningApp.Entities;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.Services.Contents
{
    public class ImageGenerationService : IImageGenerationService, ITransientDependency
    {
        private const string ImageModel = "gemini-3.1-flash-image-preview";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        public ImageGenerationService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IWebHostEnvironment env)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _env = env;
        }

        private static string GetWordTypeHint(WordType wordType) => wordType switch
        {
            WordType.Verb => "an action showing",
            WordType.Adjective => "a scene depicting the quality/state of",
            WordType.Adverb => "an action performed in the manner of",
            WordType.Preposition => "the spatial/positional relationship of",
            WordType.Phrase => "a scene depicting the meaning of",
            _ => "an object or concept representing"
        };
        public async Task<string> GenerateImageUrlAsync(string word, string meaning, WordType wordType)
        {
            if (string.IsNullOrWhiteSpace(word))
            {
                throw new UserFriendlyException("Không có từ để tạo ảnh minh họa.");
            }

            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new UserFriendlyException("Chưa cấu hình Gemini API Key.");
            }

            var imageBytes = await CallImageApiAsync(word, meaning, wordType, apiKey);

            return await SaveImageFileAsync(imageBytes);
        }
        private async Task<byte[]> CallImageApiAsync(string word, string meaning, WordType wordType, string apiKey)
        {
            var typeHint = GetWordTypeHint(wordType);
            var prompt = $"A simple, clear educational flashcard illustration showing {typeHint} the English word " +
                         $"'{word}' (meaning: '{meaning}'). Plain background, no text in the image, " +
                         $"minimalist, friendly cartoon style suitable for language learning app.";

            var requestBody = new
            {
                contents = new object[]
                {
                    new
                    {
                        parts = new object[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    responseModalities = new[] { "IMAGE" }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{ImageModel}:generateContent?key={apiKey}";

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new UserFriendlyException("Không gọi được Gemini Image, thử lại sau.");
            }

            var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

            if (!raw.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                throw new UserFriendlyException("Gemini không trả về kết quả.");
            }

            var parts = candidates[0].GetProperty("content").GetProperty("parts");
            if (parts.GetArrayLength() == 0)
            {
                throw new UserFriendlyException("Gemini không trả về dữ liệu ảnh.");
            }

            var firstPart = parts[0];
            if (!firstPart.TryGetProperty("inlineData", out var inlineData))
            {
                throw new UserFriendlyException("Đầu ra không chứa dữ liệu ảnh.");
            }

            var base64Image = inlineData.GetProperty("data").GetString();

            if (string.IsNullOrEmpty(base64Image))
            {
                throw new UserFriendlyException("Dữ liệu ảnh rỗng.");
            }

            return Convert.FromBase64String(base64Image);
        }

        private async Task<string> SaveImageFileAsync(byte[] imageBytes)
        {
            var wwwRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDirectory = Path.Combine(wwwRoot, "uploads", "images");
            Directory.CreateDirectory(uploadDirectory);

            var fileName = $"{Guid.NewGuid()}.png";
            var filePath = Path.Combine(uploadDirectory, fileName);

            await File.WriteAllBytesAsync(filePath, imageBytes);

            return $"/uploads/images/{fileName}";
        }
    }
}
