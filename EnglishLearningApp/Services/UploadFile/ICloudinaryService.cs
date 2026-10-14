namespace EnglishLearningApp.Services.UploadFile
{
    public interface ICloudinaryService
    {
        Task<string> UploadFileAsync(IFormFile file, string folderName);
        Task<string> UploadBytesAsync(byte[] fileBytes, string fileName, string folderName, bool isAudio);
    }
}
