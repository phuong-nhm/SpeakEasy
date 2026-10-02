using EnglishLearningApp.Services;
using System.Threading.RateLimiting;

namespace EnglishLearningApp.Infrastructure
{
    public class CustomRedisRateLimiter : RateLimiter
    {
        private readonly RedisRateLimiterService _redisService;
        private readonly HttpContext _httpContext;
        private readonly int _defaultCapacity;
        private readonly double _defaultRefillRate;

        public CustomRedisRateLimiter(
            RedisRateLimiterService redisService,
            HttpContext httpContext,
            int defaultCapacity = 10,
            double defaultRefillRate = 2)
        {
            _redisService = redisService;
            _httpContext = httpContext;
            _defaultCapacity = defaultCapacity;
            _defaultRefillRate = defaultRefillRate;
        }

        public override TimeSpan? IdleDuration => null;
        public override RateLimiterStatistics? GetStatistics() => null;

        // 1. Override hàm Synchronous bắt buộc của RateLimiter
        protected override RateLimitLease AttemptAcquireCore(int permitCount)
        {
            return AttemptAcquireCoreAsync(permitCount, default).AsTask().GetAwaiter().GetResult();
        }

        // 2. Override hàm Asynchronous bắt buộc của RateLimiter
        protected override async ValueTask<RateLimitLease> AcquireAsyncCore(int permitCount, CancellationToken cancellationToken)
        {
            return await AttemptAcquireCoreAsync(permitCount, cancellationToken);
        }

        // Logic xử lý chính gọi Redis
        private async ValueTask<RateLimitLease> AttemptAcquireCoreAsync(int permitCount, CancellationToken cancellationToken)
        {
            // Phân biệt Client bằng UserId (đã Login) hoặc IP (chưa Login)
            string clientId = _httpContext.User.Identity?.IsAuthenticated == true
                ? _httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                : _httpContext.Connection.RemoteIpAddress?.ToString();

            clientId ??= "unknown";
            string path = _httpContext.Request.Path.ToString().ToLower();
            string partitionKey = $"{clientId}:{path}";

            // Đọc Attribute nếu API có dán nhãn [CustomRateLimit]
            var endpoint = _httpContext.GetEndpoint();
            var customAttribute = endpoint?.Metadata.GetMetadata<CustomRateLimitAttribute>();

            int capacity = customAttribute?.Capacity ?? _defaultCapacity;
            double refillRate = customAttribute?.FillRatePerSecond ?? _defaultRefillRate;

            // Gọi Redis kiểm tra Token
            bool isAllowed = await _redisService.IsRequestAllowedAsync(partitionKey, capacity, refillRate);

            return isAllowed ? new CustomLease(true) : new CustomLease(false);
        }

        private class CustomLease : RateLimitLease
        {
            public override bool IsAcquired { get; }
            public override IEnumerable<string> MetadataNames => Enumerable.Empty<string>();
            public override bool TryGetMetadata(string metadataName, out object? metadata) { metadata = null; return false; }
            public CustomLease(bool isAcquired) => IsAcquired = isAcquired;
        }
    }
}
