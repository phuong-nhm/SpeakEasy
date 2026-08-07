using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Services;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.AppServices.Writings
{

    public class GeminiGradingService :  IGeminiGradingService, ITransientDependency
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public GeminiGradingService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<AiFeedbackDto> GradeWritingAsync(string promptTitle, string userContent)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new UserFriendlyException("Chưa cấu hình Gemini API Key.");
            }

            var prompt = BuildPrompt(promptTitle, userContent);

            var requestBody = new
            {
                contents = new object[]
                {
                    new
                    {
                        parts = new object[] { new { text = prompt } }
                    }
                }
            };

            var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new UserFriendlyException("Không gọi được AI chấm bài, thử lại sau.");
            }

            var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

            var text = raw
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return ParseFeedback(text);
        }

        private static string BuildPrompt(string promptTitle, string userContent)
        {
            return $@"Bạn là giáo viên tiếng Anh, chấm bài viết theo chuẩn B1/B2, chấm nương tay và khích lệ người học.
            Đề bài: {promptTitle}
            Bài làm của học viên:
            {userContent}

            Chỉ trả về DUY NHẤT một JSON object (không markdown, không giải thích thêm) đúng format sau:
            {{
              ""isCorrect"": true hoặc false,
              ""score"": 0-10,
              ""errors"": [
                {{ ""errorType"": ""Grammar hoặc Vocabulary hoặc Structure"", ""originalText"": ""đoạn text bị sai"", ""suggestion"": ""cách sửa"" }}
              ],
              ""explanation"": ""giải thích ngắn gọn bằng tiếng Việt"",
              ""suggestedCorrection"": ""bản sửa lại hoàn chỉnh của cả bài viết""
            }}
            Nếu bài viết không có lỗi thì để errors là mảng rỗng [].";
                    }

        private static AiFeedbackDto ParseFeedback(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText))
            {
                throw new UserFriendlyException("AI không trả về nội dung chấm bài.");
            }

            // Gemini thỉnh thoảng bọc kết quả trong ```json ... ``` nên phải lột ra trước khi parse
            var cleaned = rawText.Trim();
            if (cleaned.StartsWith("```"))
            {
                cleaned = cleaned.Trim('`');
                if (cleaned.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                {
                    cleaned = cleaned.Substring(4);
                }
                cleaned = cleaned.Trim();
            }

            try
            {
                return JsonSerializer.Deserialize<AiFeedbackDto>(cleaned, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException)
            {
                throw new UserFriendlyException("AI chấm bài trả về sai định dạng, thử lại sau.");
            }
        }
    }
}