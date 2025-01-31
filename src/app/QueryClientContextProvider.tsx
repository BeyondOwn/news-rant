"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 120000, // Cache data for 2 minutes
        gcTime: 86400000, // Garbage collect (clean up) data after 24 hours (this is applied at the QueryClient level)
        retry: 1, // Retry failed requests once
        refetchOnWindowFocus: false, // Don't refetch on window focus
      },
    },
  });

export default function QueryClientContextProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}