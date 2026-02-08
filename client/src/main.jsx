import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { AppRouter } from './routes/Routes';

/** 9.1 tanstack query client */
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  /** Helmet Provider */
  <HelmetProvider>
    {/* 9.2 tanstack query Provider */}
    <QueryClientProvider client={queryClient}>
      {/* Auth Provider */}
      <AuthProvider>
        {/* Root Router */}
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>,
);
