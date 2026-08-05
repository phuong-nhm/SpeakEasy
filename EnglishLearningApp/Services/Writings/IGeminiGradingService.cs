using System.Threading.Tasks;

namespace EnglishLearningApp.AppServices.Writings
{
    // Interface tạm cho service gọi Gemini - implement ở file riêng (gọi HttpClient tới Gemini API)
    public interface IGeminiGradingService
    {
        Task<string> GradeWritingAsync(string userContent);
    }
}
