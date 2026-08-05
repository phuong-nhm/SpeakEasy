using EnglishLearningApp.Localization;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services;

/* Inherit your application services from this class. */
public abstract class EnglishLearningAppAppService : ApplicationService
{
    protected EnglishLearningAppAppService()
    {
        LocalizationResource = typeof(EnglishLearningAppResource);
    }
}