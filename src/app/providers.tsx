'use client'

import { configureClient } from '@/lib/graphql'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// add any providers here, such as privy, wagmi, react query, etc.

configureClient({
  apiUrl: 'https://prod.base-sepolia.intuition-api.com/v1/graphql',
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
            retry: 2,
          },
        },
      })
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
