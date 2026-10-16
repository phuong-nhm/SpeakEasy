using EnglishLearningApp.Data;
using EnglishLearningApp.Dtos;
using EnglishLearningApp.Infrastructure;
using EnglishLearningApp.Localization;
using EnglishLearningApp.Services;
using EnglishLearningApp.Services.UploadFile;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides;
using OpenIddict.Validation.AspNetCore;
using Polly;
using Polly.Extensions.Http;
using Polly.Extensions.Http;
using StackExchange.Redis;
using System.Threading.RateLimiting;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.Localization;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.AutoMapper;
using Volo.Abp.Emailing;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.PostgreSql;
using Volo.Abp.FeatureManagement;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.Localization;
using Volo.Abp.Localization.ExceptionHandling;
using Volo.Abp.Modularity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.OpenIddict;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.HttpApi;
using Volo.Abp.PermissionManagement.Identity;
using Volo.Abp.PermissionManagement.OpenIddict;
using Volo.Abp.Security.Claims;
using Volo.Abp.SettingManagement;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.Swashbuckle;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.Validation.Localization;
using Volo.Abp.VirtualFileSystem;
using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.NewtonsoftJson;
namespace EnglishLearningApp;

[DependsOn(
    // ABP Framework packages
    typeof(AbpAspNetCoreMvcModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(AbpAutofacModule),
    typeof(AbpAutoMapperModule),
    typeof(AbpEntityFrameworkCorePostgreSqlModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpSwashbuckleModule),
    typeof(AbpAspNetCoreSerilogModule),

    // Account module packages
    typeof(AbpAccountApplicationModule),
    typeof(AbpAccountHttpApiModule),
    typeof(AbpAccountWebOpenIddictModule),

    // Identity module packages
    typeof(AbpPermissionManagementDomainIdentityModule),
    typeof(AbpPermissionManagementDomainOpenIddictModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpIdentityHttpApiModule),
    typeof(AbpIdentityEntityFrameworkCoreModule),
    typeof(AbpOpenIddictEntityFrameworkCoreModule),

    // Audit logging module packages
    typeof(AbpAuditLoggingEntityFrameworkCoreModule),

    // Permission Management module packages
    typeof(AbpPermissionManagementApplicationModule),
    typeof(AbpPermissionManagementHttpApiModule),
    typeof(AbpPermissionManagementEntityFrameworkCoreModule),

    // Tenant Management module packages
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpTenantManagementHttpApiModule),
    typeof(AbpTenantManagementEntityFrameworkCoreModule),

    // Feature Management module packages
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpFeatureManagementEntityFrameworkCoreModule),
    typeof(AbpFeatureManagementHttpApiModule),

    // Setting Management module packages
    typeof(AbpSettingManagementApplicationModule),
    typeof(AbpSettingManagementEntityFrameworkCoreModule),
    typeof(AbpSettingManagementHttpApiModule)
)]
public class EnglishLearningAppModule : AbpModule
{
    /* Single point to enable/disable multi-tenancy */
    private const bool IsMultiTenant = true;

    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        var configuration = context.Services.GetConfiguration();

        context.Services.PreConfigure<AbpMvcDataAnnotationsLocalizationOptions>(options =>
        {
            options.AddAssemblyResource(
                typeof(EnglishLearningAppResource)
            );
        });

        PreConfigure<OpenIddictBuilder>(builder =>
        {
            builder.AddValidation(options =>
            {
                options.AddAudiences("EnglishLearningApp");
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        });

        if (!hostingEnvironment.IsDevelopment())
        {
            PreConfigure<AbpOpenIddictAspNetCoreOptions>(options =>
            {
                options.AddDevelopmentEncryptionAndSigningCertificate = false;
            });

            PreConfigure<OpenIddictServerBuilder>(serverBuilder =>
            {
                serverBuilder.AddProductionEncryptionAndSigningCertificate("openiddict.pfx", "ceba0031-571f-4a0a-a181-58c30632a9ce");
            });
        }

        EnglishLearningAppGlobalFeatureConfigurator.Configure();
        EnglishLearningAppModuleExtensionConfigurator.Configure();
        EnglishLearningAppEfCoreEntityExtensionMappings.Configure();
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        var configuration = context.Services.GetConfiguration();
        context.Services.AddHttpClient();
        if (hostingEnvironment.IsDevelopment())
        {
            context.Services.Replace(ServiceDescriptor.Singleton<IEmailSender, NullEmailSender>());
        }
        ConfigureAuthentication(context);
        ConfigureBundles();
        ConfigureMultiTenancy();
        ConfigureUrls(configuration);
        ConfigureAutoMapper(context);
        ConfigureSwagger(context.Services, configuration);
        ConfigureAutoApiControllers();
        ConfigureVirtualFiles(hostingEnvironment);
        ConfigureLocalization();
        ConfigureCors(context, configuration);
        ConfigureDataProtection(context);
        ConfigureEfCore(context);
        ConfigureRedisRateLimiter(context, configuration);
        ConfigureFusionCache(context, configuration);
        ConfigureRateLimiter(context);
        ConfigureAiHttpClient(context, AiServiceNames.Gemini, "https://generativelanguage.googleapis.com/");
        ConfigureAiHttpClient(context, AiServiceNames.AzureTts, "https://<your-region>.tts.speech.microsoft.com/");
        ConfigureAiHttpClient(context, AiServiceNames.Replicate, "https://api.replicate.com/");
        context.Services.AddTransient<ICloudinaryService, CloudinaryService>();
        context.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Render là proxy bên ngoài, không nằm trong mạng nội bộ biết trước
    // nên cần clear 2 danh sách này để middleware chấp nhận header từ Render
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});
    }
    private void ConfigureRateLimiter(ServiceConfigurationContext context)
    {
        context.Services.AddRateLimiter(options =>
        {
            options.OnRejected = async (ctx, token) =>
            {
                ctx.HttpContext.Response.StatusCode = 429;
                await ctx.HttpContext.Response.WriteAsync("Too many requests, please try again later.", token);
            };

            options.AddPolicy("redis-limiter", httpContext =>
            {
                var redisService = httpContext.RequestServices.GetRequiredService<RedisRateLimiterService>();

                string clientId = httpContext.User.Identity?.IsAuthenticated == true
                    ? httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    : httpContext.Connection.RemoteIpAddress?.ToString();
                clientId ??= "unknown";

                string path = httpContext.Request.Path.ToString().ToLower();
                string partitionKey = $"{clientId}:{path}";

                var endpoint = httpContext.GetEndpoint();
                var customAttribute = endpoint?.Metadata.GetMetadata<CustomRateLimitAttribute>();
                int capacity = customAttribute?.Capacity ?? 10;
                double refillRate = customAttribute?.FillRatePerSecond ?? 2;

                return RateLimitPartition.Get(partitionKey, key =>
                    new RedisTokenBucketRateLimiter(redisService, partitionKey, capacity, refillRate));
            });
        });
    }
    private void ConfigureRedisRateLimiter(ServiceConfigurationContext context, IConfiguration configuration)
    {
        var redisConnectionString = configuration.GetConnectionString("Redis");
        context.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));
        context.Services.AddSingleton<RedisRateLimiterService>();
    }
    private void ConfigureFusionCache(ServiceConfigurationContext context, IConfiguration configuration)
    {
        var redisConnectionString = configuration.GetConnectionString("Redis");
        // 2. Đăng ký FusionCache (L1 Memory + L2 Redis)
        context.Services.AddFusionCache()
            .WithDefaultEntryOptions(options =>
            {
                options.Duration = TimeSpan.FromMinutes(10); // Cache mặc định 10 phút
            })
            .WithSerializer(new ZiggyCreatures.Caching.Fusion.Serialization.NewtonsoftJson.FusionCacheNewtonsoftJsonSerializer())
            .WithDistributedCache(
                new RedisCache(new RedisCacheOptions { Configuration = redisConnectionString })
            );
    }
    private void ConfigureAiHttpClient(
        ServiceConfigurationContext context,
        string serviceName,
        string baseAddress,
        int timeoutSeconds = 10,
        int handledEventsAllowedBeforeBreaking = 3,
        int durationOfBreakSeconds = 30)
    {
        context.Services.AddHttpClient(serviceName, client =>
        {
            client.BaseAddress = new Uri(baseAddress);
            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
        })
        .AddPolicyHandler(HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: handledEventsAllowedBeforeBreaking,
                durationOfBreak: TimeSpan.FromSeconds(durationOfBreakSeconds)
            ));
    }
    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        context.Services.ForwardIdentityAuthenticationForBearer(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
        context.Services.Configure<AbpClaimsPrincipalFactoryOptions>(options =>
        {
            options.IsDynamicClaimsEnabled = true;
        });
    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle => { bundle.AddFiles("/global-styles.css"); }
            );
        });
    }

    private void ConfigureMultiTenancy()
    {
        Configure<AbpMultiTenancyOptions>(options =>
        {
            options.IsEnabled = IsMultiTenant;
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ?? Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureLocalization()
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Add<EnglishLearningAppResource>("en")
                .AddBaseTypes(typeof(AbpValidationResource))
                .AddVirtualJson("/Localization/EnglishLearningApp");

            options.DefaultResourceType = typeof(EnglishLearningAppResource);

            options.Languages.Add(new LanguageInfo("en", "en", "English"));
            options.Languages.Add(new LanguageInfo("tr", "tr", "Türkçe"));
            options.Languages.Add(new LanguageInfo("ar", "ar", "العربية"));
            options.Languages.Add(new LanguageInfo("cs", "cs", "Čeština"));
            options.Languages.Add(new LanguageInfo("en-GB", "en-GB", "English (UK)"));
            options.Languages.Add(new LanguageInfo("hu", "hu", "Magyar"));
            options.Languages.Add(new LanguageInfo("fi", "fi", "Finnish"));
            options.Languages.Add(new LanguageInfo("fr", "fr", "Français"));
            options.Languages.Add(new LanguageInfo("hi", "hi", "Hindi"));
            options.Languages.Add(new LanguageInfo("is", "is", "Icelandic"));
            options.Languages.Add(new LanguageInfo("it", "it", "Italiano"));
            options.Languages.Add(new LanguageInfo("pt-BR", "pt-BR", "Português"));
            options.Languages.Add(new LanguageInfo("ro-RO", "ro-RO", "Română"));
            options.Languages.Add(new LanguageInfo("ru", "ru", "Русский"));
            options.Languages.Add(new LanguageInfo("sk", "sk", "Slovak"));
            options.Languages.Add(new LanguageInfo("zh-Hans", "zh-Hans", "简体中文"));
            options.Languages.Add(new LanguageInfo("zh-Hant", "zh-Hant", "繁體中文"));
            options.Languages.Add(new LanguageInfo("de-DE", "de-DE", "Deutsch"));
            options.Languages.Add(new LanguageInfo("es", "es", "Español"));
            options.Languages.Add(new LanguageInfo("el", "el", "Ελληνικά"));
        });

        Configure<AbpExceptionLocalizationOptions>(options =>
        {
            options.MapCodeNamespace("EnglishLearningApp", typeof(EnglishLearningAppResource));
        });
    }

    private void ConfigureVirtualFiles(IWebHostEnvironment hostingEnvironment)
    {
        Configure<AbpVirtualFileSystemOptions>(options =>
        {
            options.FileSets.AddEmbedded<EnglishLearningAppModule>();
            if (hostingEnvironment.IsDevelopment())
            {
                /* Using physical files in development, so we don't need to recompile on changes */
                options.FileSets.ReplaceEmbeddedByPhysical<EnglishLearningAppModule>(hostingEnvironment.ContentRootPath);
            }
        });
    }

    private void ConfigureAutoApiControllers()
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(EnglishLearningAppModule).Assembly);
        });
    }

    private void ConfigureSwagger(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAbpSwaggerGenWithOAuth(
            configuration["AuthServer:Authority"]!,
            new Dictionary<string, string>
            {
                    {"EnglishLearningApp", "EnglishLearningApp API"}
            },
            options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "EnglishLearningApp API", Version = "v1" });
                options.DocInclusionPredicate((docName, description) => true);
                options.CustomSchemaIds(type => type.FullName);
            });
    }

    private void ConfigureAutoMapper(ServiceConfigurationContext context)
    {
        context.Services.AddAutoMapperObjectMapper<EnglishLearningAppModule>();
        Configure<AbpAutoMapperOptions>(options =>
        {
            /* Uncomment `validate: true` if you want to enable the Configuration Validation feature.
             * See AutoMapper's documentation to learn what it is:
             * https://docs.automapper.org/en/stable/Configuration-validation.html
             */
            options.AddMaps<EnglishLearningAppModule>(/* validate: true */);
        });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(
                        configuration["App:CorsOrigins"]?
                            .Split(",", StringSplitOptions.RemoveEmptyEntries)
                            .Select(o => o.RemovePostFix("/"))
                            .ToArray() ?? Array.Empty<string>()
                    )
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    private void ConfigureDataProtection(ServiceConfigurationContext context)
    {
        context.Services.AddDataProtection().SetApplicationName("EnglishLearningApp");
    }

    private void ConfigureEfCore(ServiceConfigurationContext context)
    {
        context.Services.AddAbpDbContext<EnglishLearningAppDbContext>(options =>
        {
            /* You can remove "includeAllEntities: true" to create
             * default repositories only for aggregate roots
             * Documentation: https://docs.abp.io/en/abp/latest/Entity-Framework-Core#add-default-repositories
             */
            options.AddDefaultRepositories(includeAllEntities: true);
        });

        Configure<AbpDbContextOptions>(options =>
        {
            options.Configure(configurationContext =>
            {
                configurationContext.UseNpgsql();
            });
        });

    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();
        app.UseForwardedHeaders();
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();
        app.UseStaticFiles();
        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        app.MapAbpStaticAssets();

        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();

        app.UseAbpOpenIddictValidation();

        if (IsMultiTenant)
        {
            app.UseMultiTenancy();
        }

        app.UseUnitOfWork();
        app.UseDynamicClaims();
        app.UseRateLimiter();
        app.UseAuthorization();

        app.UseSwagger();
        app.UseAbpSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "EnglishLearningApp API");

            var configuration = context.GetConfiguration();
            options.OAuthClientId(configuration["AuthServer:SwaggerClientId"]);
            options.OAuthScopes("EnglishLearningApp");
        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();
        app.UseConfiguredEndpoints();
    }
}
