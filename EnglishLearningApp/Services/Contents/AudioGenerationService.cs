using EnglishLearningApp.Services.Contents;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.Services.Contents
{
    public class AudioGenerationService : IAudioGenerationService, ITransientDependency
    {
        // Model Gemini hỗ trợ Audio Output chuẩn
        private const string TtsModel = "gemini-3.1-flash-tts-preview";
        private const string VoiceName = "Puck"; // Giọng chuẩn (Puck / Kore / Aoede)

        private const int SampleRate = 24000;
        private const int BitsPerSample = 16;
        private const int Channels = 1;

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public AudioGenerationService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IWebHostEnvironment env)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _env = env;
        }

        public async Task<string> GenerateAudioUrlAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new UserFriendlyException("Không có nội dung để tạo audio.");
            }

            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new UserFriendlyException("Chưa cấu hình Gemini API Key.");
            }

            var pcmBytes = await CallTtsApiAsync(text, apiKey);
            var wavBytes = WrapPcmAsWav(pcmBytes);

            return await SaveAudioFileAsync(wavBytes);
        }

        private async Task<byte[]> CallTtsApiAsync(string text, string apiKey)
        {
            var requestBody = new
            {
                contents = new object[]
                {
                    new
                    {
                        parts = new object[] { new { text = $"Read clearly: {text}" } }
                    }
                },
                generationConfig = new
                {
                    responseModalities = new[] { "AUDIO" },
                    speechConfig = new
                    {
                        voiceConfig = new
                        {
                            prebuiltVoiceConfig = new { voiceName = VoiceName }
                        }
                    }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{TtsModel}:generateContent?key={apiKey}";

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new UserFriendlyException("Không gọi được Gemini TTS, thử lại sau.");
            }

            var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

            // Safe parsing JSON
            if (!raw.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                throw new UserFriendlyException("Gemini không trả về kết quả.");
            }

            var parts = candidates[0].GetProperty("content").GetProperty("parts");
            if (parts.GetArrayLength() == 0)
            {
                throw new UserFriendlyException("Gemini không trả về dữ liệu âm thanh.");
            }

            var firstPart = parts[0];
            if (!firstPart.TryGetProperty("inlineData", out var inlineData))
            {
                throw new UserFriendlyException("Đầu ra không chứa dữ liệu audio.");
            }

            var base64Audio = inlineData.GetProperty("data").GetString();

            if (string.IsNullOrEmpty(base64Audio))
            {
                throw new UserFriendlyException("Dữ liệu audio rỗng.");
            }

            return Convert.FromBase64String(base64Audio);
        }

        private static byte[] WrapPcmAsWav(byte[] pcmData)
        {
            var byteRate = SampleRate * Channels * BitsPerSample / 8;
            var blockAlign = (short)(Channels * BitsPerSample / 8);

            using var stream = new MemoryStream();
            using var writer = new BinaryWriter(stream);

            writer.Write(new[] { 'R', 'I', 'F', 'F' });
            writer.Write(36 + pcmData.Length);
            writer.Write(new[] { 'W', 'A', 'V', 'E' });
            writer.Write(new[] { 'f', 'm', 't', ' ' });
            writer.Write(16);
            writer.Write((short)1); // PCM Format
            writer.Write((short)Channels);
            writer.Write(SampleRate);
            writer.Write(byteRate);
            writer.Write(blockAlign);
            writer.Write((short)BitsPerSample);
            writer.Write(new[] { 'd', 'a', 't', 'a' });
            writer.Write(pcmData.Length);
            writer.Write(pcmData);

            return stream.ToArray();
        }

        private async Task<string> SaveAudioFileAsync(byte[] wavBytes)
        {
            var wwwRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDirectory = Path.Combine(wwwRoot, "uploads", "audio");
            Directory.CreateDirectory(uploadDirectory);

            var fileName = $"{Guid.NewGuid()}.wav";
            var filePath = Path.Combine(uploadDirectory, fileName);

            await File.WriteAllBytesAsync(filePath, wavBytes);

            return $"/uploads/audio/{fileName}";
        }
    }
}