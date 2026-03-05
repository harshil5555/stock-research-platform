import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  useWebSocket();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <motion.div
        animate={{ marginLeft: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        <Header />
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
