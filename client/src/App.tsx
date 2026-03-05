import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import AppLayout from '@/components/layout/AppLayout';
import ToastContainer from '@/components/ui/Toast';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TodosPage from '@/pages/TodosPage';
import SourcesPage from '@/pages/SourcesPage';
import SourceDetailPage from '@/pages/SourceDetailPage';
import StocksPage from '@/pages/StocksPage';
import StockDetailPage from '@/pages/StockDetailPage';
import DecisionsPage from '@/pages/DecisionsPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/sources/:id" element={<SourceDetailPage />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/stocks/:id" element={<StockDetailPage />} />
            <Route path="/decisions" element={<DecisionsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
