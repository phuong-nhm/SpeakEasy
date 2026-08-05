using Microsoft.Extensions.Localization;
using EnglishLearningApp.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace EnglishLearningApp;

[Dependency(ReplaceServices = true)]
public class EnglishLearningAppBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<EnglishLearningAppResource> _localizer;

    public EnglishLearningAppBrandingProvider(IStringLocalizer<EnglishLearningAppResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
