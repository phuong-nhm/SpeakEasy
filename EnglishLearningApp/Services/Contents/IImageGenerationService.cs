using EnglishLearningApp.Entities;

namespace EnglishLearningApp.Services.Contents
{
    public interface IImageGenerationService
    {
        Task<string> GenerateImageUrlAsync(string word, string meaning, WordType wordType);
    }
}
