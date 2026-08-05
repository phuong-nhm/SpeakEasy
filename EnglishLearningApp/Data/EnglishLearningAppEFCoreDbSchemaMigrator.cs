using Microsoft.EntityFrameworkCore;
using Volo.Abp.DependencyInjection;

namespace EnglishLearningApp.Data;

public class EnglishLearningAppEFCoreDbSchemaMigrator : ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EnglishLearningAppEFCoreDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the EnglishLearningAppDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<EnglishLearningAppDbContext>()
            .Database
            .MigrateAsync();
    }
}
