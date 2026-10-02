namespace EnglishLearningApp.Infrastructure
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class CustomRateLimitAttribute : Attribute
    {
        public int Capacity { get; }
        public double FillRatePerSecond { get; }

        public CustomRateLimitAttribute(int capacity, double fillRatePerSecond)
        {
            Capacity = capacity;
            FillRatePerSecond = fillRatePerSecond;
        }
    }
}
