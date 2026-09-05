"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BankingProvider } from "@/lib/banking-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, retry: 1 },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <BankingProvider>{children}</BankingProvider>
    </QueryClientProvider>
  );
}
