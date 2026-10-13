using EnglishLearningApp.Services;
using System.Threading.RateLimiting;

namespace EnglishLearningApp.Infrastructure
{
    public class RedisTokenBucketRateLimiter : RateLimiter
    {
        private readonly RedisRateLimiterService _redisService;
        private readonly string _partitionKey;
        private readonly int _capacity;
        private readonly double _refillRate;
        public RedisTokenBucketRateLimiter(RedisRateLimiterService redisService, string partitionKey, int capacity, double refillRate)
        {
            _redisService = redisService;
            _partitionKey = partitionKey;
            _capacity = capacity;
            _refillRate = refillRate;
        }

        public override TimeSpan? IdleDuration => null;
        public override RateLimiterStatistics? GetStatistics() => null;

        protected override RateLimitLease AttemptAcquireCore(int permitCount)
            => AttemptAcquireCoreAsync(permitCount, default).AsTask().GetAwaiter().GetResult();

        protected override async ValueTask<RateLimitLease> AcquireAsyncCore(int permitCount, CancellationToken cancellationToken)
            => await AttemptAcquireCoreAsync(permitCount, cancellationToken);

        private async ValueTask<RateLimitLease> AttemptAcquireCoreAsync(int permitCount, CancellationToken cancellationToken)
        {
            bool isAllowed = await _redisService.IsRequestAllowedAsync(_partitionKey, _capacity, _refillRate);
            return isAllowed ? new SimpleLease(true) : new SimpleLease(false);
        }

        private class SimpleLease : RateLimitLease
        {
            public override bool IsAcquired { get; }
            public override IEnumerable<string> MetadataNames => Enumerable.Empty<string>();
            public override bool TryGetMetadata(string metadataName, out object? metadata) { metadata = null; return false; }
            public SimpleLease(bool isAcquired) => IsAcquired = isAcquired;
        }
    }
}
