import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { AppRouter } from './routes/Routes';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>,
);
