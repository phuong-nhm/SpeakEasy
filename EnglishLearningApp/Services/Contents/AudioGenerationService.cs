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
        // private const string TtsModel = "gemini-3.1-flash-tts-preview";
        private const string TtsModel = "gemini-3.1-flash-tts-preview";
        private const string VoiceName = "Puck"; // Giọng chuẩn (Puck / Kore / Aoede)

        private const int SampleRate = 24000;
        private const int BitsPerSample = 16;
        private const int Channels = 1;

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<AudioGenerationService> _logger;
        public AudioGenerationService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IWebHostEnvironment env,
            ILogger<AudioGenerationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _env = env;
            _logger = logger;
        }
        public async Task<string> GenerateAudioUrlAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new UserFriendlyException("Không có nội dung để tạo audio.");
            }

            // Đọc cấu hình Azure Speech từ appsettings.json
            var apiKey = _configuration["AzureSpeech:Key"];
            var region = _configuration["AzureSpeech:Region"];

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(region))
            {
                throw new UserFriendlyException("Chưa cấu hình Azure Speech Key hoặc Region.");
            }

            var wavBytes = await CallAzureTtsApiAsync(text, apiKey, region);

            return await SaveAudioFileAsync(wavBytes);
        }

        private async Task<byte[]> CallAzureTtsApiAsync(string text, string apiKey, string region)
        {
            var url = $"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1";

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", apiKey);
            client.DefaultRequestHeaders.Add("X-Microsoft-OutputFormat", "riff-16khz-16bit-mono-pcm");
            client.DefaultRequestHeaders.Add("User-Agent", "EnglishLearningApp");
            var voice = Voices[Random.Shared.Next(Voices.Length)];
            string ssml = $"""
    <speak version="1.0"
           xmlns="http://www.w3.org/2001/10/synthesis"
           xml:lang="en-US">
        <voice name="{voice}">
            {System.Security.SecurityElement.Escape(text)}
        </voice>
    </speak>
    """;

            _logger.LogInformation("Azure TTS URL: {Url}", url);
            _logger.LogInformation("Azure TTS Text: {Text}", text);
            _logger.LogInformation("Azure TTS SSML: {SSML}", ssml);

            var content = new StringContent(
                ssml,
                System.Text.Encoding.UTF8,
                "application/ssml+xml");

            var response = await client.PostAsync(url, content);

            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "Azure TTS Response Status: {Status}",
                (int)response.StatusCode);

            _logger.LogInformation(
                "Azure TTS Response Body: {Body}",
                responseBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new UserFriendlyException(
                    $"Azure TTS Error: {(int)response.StatusCode} - {responseBody}");
            }

            return await response.Content.ReadAsByteArrayAsync();
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // public async Task<string> GenerateAudioUrlAsync(string text)
        // {
        //     if (string.IsNullOrWhiteSpace(text))
        //     {
        //         throw new UserFriendlyException("Không có nội dung để tạo audio.");
        //     }

        //     var apiKey = _configuration["Gemini:ApiKey"];
        //     if (string.IsNullOrWhiteSpace(apiKey))
        //     {
        //         throw new UserFriendlyException("Chưa cấu hình Gemini API Key.");
        //     }

        //     var pcmBytes = await CallTtsApiAsync(text, apiKey);
        //     var wavBytes = WrapPcmAsWav(pcmBytes);

        //     return await SaveAudioFileAsync(wavBytes);
        // }

        //         private async Task<byte[]> CallTtsApiAsync(string text, string apiKey)
        //         {
        //             var requestBody = new
        //             {
        //                 contents = new object[]
        //                 {
        //                     new
        //                     {
        //                         parts = new object[] { new { text = $"Read clearly: {text}" } }
        //                     }
        //                 },
        //                 generationConfig = new
        //                 {
        //                     responseModalities = new[] { "AUDIO" },
        //                     speechConfig = new
        //                     {
        //                         voiceConfig = new
        //                         {
        //                             prebuiltVoiceConfig = new { voiceName = VoiceName }
        //                         }
        //                     }
        //                 }
        //             };

        //         var url = $"https://generativelanguage.googleapis.com/v1beta/models/{TtsModel}:generateContent?key={apiKey}";

        //         var client = _httpClientFactory.CreateClient();
        //         var response = await client.PostAsJsonAsync(url, requestBody);

        //             if (!response.IsSuccessStatusCode)
        //             {
        //                 throw new UserFriendlyException("Không gọi được Gemini TTS, thử lại sau.");
        //             }

        //             var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

        //             // Safe parsing JSON
        //             if (!raw.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
        //             {
        //                 throw new UserFriendlyException("Gemini không trả về kết quả.");
        // }

        // var parts = candidates[0].GetProperty("content").GetProperty("parts");
        // if (parts.GetArrayLength() == 0)
        // {
        //     throw new UserFriendlyException("Gemini không trả về dữ liệu âm thanh.");
        // }

        // var firstPart = parts[0];
        // if (!firstPart.TryGetProperty("inlineData", out var inlineData))
        // {
        //     throw new UserFriendlyException("Đầu ra không chứa dữ liệu audio.");
        // }

        // var base64Audio = inlineData.GetProperty("data").GetString();

        // if (string.IsNullOrEmpty(base64Audio))
        // {
        //     throw new UserFriendlyException("Dữ liệu audio rỗng.");
        // }

        // return Convert.FromBase64String(base64Audio);
        //         }
        /////////////////////////////////////////////////////////////////////////////////
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
        private static readonly string[] Voices =
        {
        "en-US-JennyNeural",
        "en-US-GuyNeural",
        "en-US-AriaNeural",
        "en-US-DavisNeural"
        };
    }
}