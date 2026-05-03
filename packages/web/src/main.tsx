import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { QueryBoundary } from './components/QueryBoundary';
import App from './App.tsx';
import './index.css';
import { webClient, webDataUtils } from './api/webClient';

// Initialize web client if not in Electron
if (!window.electron) {
  console.log('🌐 Running in Web Mode - Initializing Web Client');
  // @ts-ignore
  window.db = webClient;
  // @ts-ignore
  window.dataUtils = webDataUtils;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <QueryBoundary>
        <App />
      </QueryBoundary>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  </StrictMode>
);
