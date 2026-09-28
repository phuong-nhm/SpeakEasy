using EnglishLearningApp.Entities;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.Services.Contents
{
    public class ImageGenerationService : IImageGenerationService, ITransientDependency
    {
        private const string ReplicateModel = "black-forest-labs/flux-schnell";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ImageGenerationService> _logger;
        public ImageGenerationService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IWebHostEnvironment env,
    ILogger<ImageGenerationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _env = env;
            _logger = logger;
        }

        public async Task<string> GenerateImageUrlAsync(string word, string meaning, WordType wordType, string? imageHint = null)
        {
            if (string.IsNullOrWhiteSpace(word))
            {
                throw new UserFriendlyException("Không có từ để tạo ảnh minh họa.");
            }

            var imageBytes = await CallImageApiAsync(word, meaning, wordType, imageHint);
            return await SaveImageFileAsync(imageBytes, word);
        }

        private async Task<byte[]> CallImageApiAsync(string word, string meaning, WordType wordType, string? imageHint)
        {
            var apiToken = _configuration["Replicate:ApiToken"];
            if (string.IsNullOrWhiteSpace(apiToken))
            {
                throw new UserFriendlyException("Chưa cấu hình Replicate API Token.");
            }

            var prompt = BuildPrompt(word, meaning, wordType, imageHint);

            var requestBody = new
            {
                input = new
                {
                    prompt,
                    aspect_ratio = "1:1",
                    num_outputs = 1,
                    output_format = "png"
                }
            };

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(90);

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://api.replicate.com/v1/models/{ReplicateModel}/predictions")
            {
                Content = JsonContent.Create(requestBody)
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiToken);
            request.Headers.Add("Prefer", "wait"); // chờ tới khi xong (tối đa ~60s), khỏi phải tự poll

            var response = await client.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "Replicate lỗi khi sinh ảnh cho từ '{Word}': {StatusCode} - {ErrorContent}",
                    word, response.StatusCode, errorContent);
                throw new UserFriendlyException("Không gọi được dịch vụ sinh ảnh, thử lại sau.");
            }

            var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

            // Nếu chưa xong trong thời gian chờ thì poll thêm vài lần
            for (var i = 0; i < 10; i++)
            {
                var status = raw.GetProperty("status").GetString();

                if (status == "succeeded") break;

                if (status == "failed" || status == "canceled")
                {
                    var error = raw.TryGetProperty("error", out var e) ? e.ToString() : "unknown";
                    _logger.LogError("Replicate prediction thất bại cho từ '{Word}': {Error}", word, error);
                    throw new UserFriendlyException("Sinh ảnh thất bại, thử lại sau.");
                }

                await Task.Delay(TimeSpan.FromSeconds(2));

                var getUrl = raw.GetProperty("urls").GetProperty("get").GetString();
                var pollRequest = new HttpRequestMessage(HttpMethod.Get, getUrl);
                pollRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiToken);
                var pollResponse = await client.SendAsync(pollRequest);
                raw = await pollResponse.Content.ReadFromJsonAsync<JsonElement>();
            }

            if (raw.GetProperty("status").GetString() != "succeeded")
            {
                throw new UserFriendlyException("Sinh ảnh quá lâu, thử lại sau.");
            }

            // output của flux-schnell là mảng URL ảnh
            var output = raw.GetProperty("output");
            var imageUrl = output.ValueKind == JsonValueKind.Array
                ? output[0].GetString()
                : output.GetString();

            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                throw new UserFriendlyException("Replicate không trả về ảnh.");
            }

            // Tải file ảnh về (URL này công khai, không cần token)
            var imageBytes = await client.GetByteArrayAsync(imageUrl);

            if (imageBytes.Length == 0)
            {
                throw new UserFriendlyException("Dữ liệu ảnh rỗng.");
            }

            return imageBytes;
        }
        private static string BuildPrompt(string word, string meaning, WordType wordType, string? imageHint)
        {
            var noTextRule = "IMPORTANT: absolutely no text, no letters, no words, no captions, no watermark anywhere in the image.";
            var styleRule = "Simple flat illustration, clean vector art style, soft pastel colors, plain white or light background, centered composition.";

            if (!string.IsNullOrWhiteSpace(imageHint))
            {
                return $"An illustration depicting the scene: {imageHint}. This illustrates the English word '{word}' ({meaning}). {styleRule} {noTextRule}";
            }

            // Fallback: giữ nguyên switch theo WordType cũ khi không có hint
            var character = "a simple cartoon young student character (gender-neutral, generic design)";
            var subject = wordType switch
            {
                WordType.Noun => $"A clear, iconic illustration of a single {word} ({meaning}) as the main object, large and centered, easily recognizable at a glance.",
                WordType.Verb => $"An illustration of {character} actively performing the action '{word}' ({meaning}). Show the action clearly in progress through dynamic pose and motion lines.",
                WordType.Adjective => $"An illustration of {character} whose face and body language clearly express the quality of being '{word}' ({meaning}).",
                WordType.Adverb => $"An illustration of {character} performing a simple everyday action in the manner of '{word}' ({meaning}).",
                WordType.Preposition => $"An illustration of {character} positioned relative to a simple object to clearly demonstrate '{word}' ({meaning}).",
                WordType.Phrase => $"An illustration of {character} in a real-life scene that literally depicts '{meaning}'.",
                _ => $"An illustration of {character} in a simple scene representing '{word}' ({meaning}).",
            };

            return $"{subject} {styleRule} {noTextRule}";
        }

        private async Task<string> SaveImageFileAsync(byte[] imageBytes, string word)
        {
            var wwwRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDirectory = Path.Combine(wwwRoot, "uploads", "images");
            Directory.CreateDirectory(uploadDirectory);

            // Slug hoá từ, chỉ giữ chữ/số, thay khoảng trắng bằng gạch ngang
            var slug = new string(word.ToLowerInvariant()
                .Select(c => char.IsLetterOrDigit(c) ? c : '-')
                .ToArray());
            var fileName = $"{slug}-{Guid.NewGuid():N}.png";
            var filePath = Path.Combine(uploadDirectory, fileName);

            await File.WriteAllBytesAsync(filePath, imageBytes);

            return $"/uploads/images/{fileName}";
        }
    }
}
