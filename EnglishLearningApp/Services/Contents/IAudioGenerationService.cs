namespace EnglishLearningApp.Services.Contents
{
    public interface IAudioGenerationService
    {
        Task<string> GenerateAudioUrlAsync(string text);

    }
}
