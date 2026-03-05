import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  TrendingUp,
  Scale,
  ChevronLeft,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/todos', icon: CheckSquare, label: 'Todos' },
  { to: '/sources', icon: FileText, label: 'Sources' },
  { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
  { to: '/decisions', icon: Scale, label: 'Decisions' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 h-full bg-[var(--surface)] border-r border-[var(--border)] z-30 flex flex-col"
    >
      <div className="flex items-center justify-between h-16 px-4">
        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
          >
            StockRP
          </motion.span>
        )}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] transition-colors ml-auto"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={18} />
          </motion.div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
