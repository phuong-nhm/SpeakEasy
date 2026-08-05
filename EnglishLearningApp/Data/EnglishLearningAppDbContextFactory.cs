using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EnglishLearningApp.Data;

public class EnglishLearningAppDbContextFactory : IDesignTimeDbContextFactory<EnglishLearningAppDbContext>
{
    public EnglishLearningAppDbContext CreateDbContext(string[] args)
    {
        EnglishLearningAppEfCoreEntityExtensionMappings.Configure();

        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<EnglishLearningAppDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));

        return new EnglishLearningAppDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
