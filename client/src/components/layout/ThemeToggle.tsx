import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </button>
  );
}
