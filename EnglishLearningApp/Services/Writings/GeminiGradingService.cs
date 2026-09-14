using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Services;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.AppServices.Writings
{
    public class GeminiGradingService : IGeminiGradingService, ITransientDependency
    {
        // Sử dụng model Flash 3.6/3.5 tối ưu tốc độ và chi phí cho chấm văn bản
        private const string GradingModel = "gemini-3.6-flash";

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

            var requestBody = BuildRequestBody(promptTitle, userContent);

            var url = $"[https://generativelanguage.googleapis.com/v1beta/models/](https://generativelanguage.googleapis.com/v1beta/models/){GradingModel}:generateContent?key={apiKey}";

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new UserFriendlyException($"Không gọi được AI chấm bài ({response.StatusCode}): {errorMsg}");
            }

            var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

            var jsonText = raw
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return ParseFeedback(jsonText);
        }

        private static object BuildRequestBody(string promptTitle, string userContent)
        {
            var prompt = $@"Đề bài: {promptTitle}
Bài làm của học viên:
{userContent}";

            return new
            {
                // Tách role thành System Instruction chuẩn Gemini
                systemInstruction = new
                {
                    parts = new object[]
                    {
                        new { text = "Bạn là giáo viên tiếng Anh, chấm bài viết theo chuẩn B1/B2, chấm nương tay và khích lệ người học. Hãy tìm ra các lỗi về Grammar, Vocabulary, Structure và đưa ra bản sửa hoàn chỉnh." }
                    }
                },
                contents = new object[]
                {
                    new
                    {
                        parts = new object[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    // Tăng độ chính xác cho chấm điểm
                    temperature = 0.2,
                    // Ép Gemini trả về JSON thuần túy (không dính markdown ```json)
                    responseMimeType = "application/json",
                    // Khai báo Schema bắt buộc cho Output
                    responseSchema = new
                    {
                        type = "OBJECT",
                        properties = new
                        {
                            isCorrect = new { type = "BOOLEAN" },
                            score = new { type = "NUMBER", description = "Thang điểm từ 0 đến 10" },
                            explanation = new { type = "STRING", description = "Giải thích ngắn gọn bằng tiếng Việt" },
                            suggestedCorrection = new { type = "STRING", description = "Bản sửa lại hoàn chỉnh của cả bài viết" },
                            errors = new
                            {
                                type = "ARRAY",
                                items = new
                                {
                                    type = "OBJECT",
                                    properties = new
                                    {
                                        errorType = new { type = "STRING", description = "Grammar, Vocabulary hoặc Structure" },
                                        originalText = new { type = "STRING" },
                                        suggestion = new { type = "STRING" }
                                    },
                                    required = new[] { "errorType", "originalText", "suggestion" }
                                }
                            }
                        },
                        required = new[] { "isCorrect", "score", "errors", "explanation", "suggestedCorrection" }
                    }
                }
            };
        }

        private static AiFeedbackDto ParseFeedback(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText))
            {
                throw new UserFriendlyException("AI không trả về nội dung chấm bài.");
            }

            try
            {
                // Do đã dùng responseMimeType="application/json", không cần xử lý chuỗi ```json nữa
                return JsonSerializer.Deserialize<AiFeedbackDto>(rawText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException)
            {
                throw new UserFriendlyException("AI chấm bài trả về sai định dạng JSON, thử lại sau.");
            }
        }
    }
}