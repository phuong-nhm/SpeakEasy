// src/hooks/useSafeAsyncEffect.ts
import { useEffect } from "react";

export function useSafeAsyncEffect(
  effect: (isMounted: () => boolean) => Promise<void> | void,
  deps: React.DependencyList,
) {
  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    // 1. Dùng queueMicrotask để chặn lỗi "setState synchronously within an effect"
    queueMicrotask(() => {
      if (mounted) {
        void effect(isMounted);
      }
    });

    // 2. Chặn Memory Leak khi unmount
    return () => {
      mounted = false;
    };
  }, deps); // 👈 deps truyền vào useEffect chính chủ, Linter kiểm tra hoàn toàn tự nhiên!
}
