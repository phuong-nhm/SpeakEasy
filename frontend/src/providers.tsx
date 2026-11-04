"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tránh tự động refetch mỗi lần chuyển tab/focus lại cửa sổ,
            // tránh gọi API dư thừa không cần thiết lúc đang dev/test.
            refetchOnWindowFocus: false,
            // Data coi như "cũ" sau 1 phút thì mới tự fetch lại khi có
            // component mount mới dùng cùng queryKey.
            staleTime: 60 * 1000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
