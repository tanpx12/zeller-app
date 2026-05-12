'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { Toaster } from '@/components/ui/sonner'
import '@/lib/client'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(makeQueryClient)

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <TooltipPrimitive.Provider delayDuration={150}>
          {children}
          <Toaster richColors position="bottom-right" />
        </TooltipPrimitive.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
