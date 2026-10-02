using StackExchange.Redis;

namespace EnglishLearningApp.Services
{
    public class RedisRateLimiterService
    {
        private readonly IConnectionMultiplexer _redis;
        private static readonly string LuaScript = @"
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local data = redis.call('HMGET', key, 'tokens', 'last_updated')
        local tokens = tonumber(data[1])
        local last_updated = tonumber(data[2])

        if not tokens then
            tokens = capacity
            last_updated = now
        else
            local delta = math.max(0, now - last_updated)
            tokens = math.min(capacity, tokens + delta * refill_rate)
            last_updated = now
        end

        if tokens >= 1 then
            tokens = tokens - 1
            redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
            redis.call('EXPIRE', key, 60)
            return 1
        else
            return 0
        end";

        public RedisRateLimiterService(IConnectionMultiplexer redis) => _redis = redis;

        public async Task<bool> IsRequestAllowedAsync(string partitionKey, int capacity, double refillRate)
        {
            var db = _redis.GetDatabase();
            long nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            var result = (long)await db.ScriptEvaluateAsync(
                LuaScript,
                keys: new RedisKey[] { $"ratelimit:{partitionKey}" },
                values: new RedisValue[] { capacity, refillRate, nowSeconds }
            );

            return result == 1;
        }
    }
}
