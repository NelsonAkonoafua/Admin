'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { CartDrawer } from '@/components/cart/CartDrawer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthLoader() {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthLoader />
      {children}
      <CartDrawer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'var(--font-poppins)',
            borderRadius: '0',
            padding: '12px 20px',
          },
          success: {
            iconTheme: { primary: '#c9a96e', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
