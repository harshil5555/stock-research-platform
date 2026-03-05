import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { disconnectSocket } from '@/lib/socket';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-end px-6 gap-3">
      <ThemeToggle />
      <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-medium">
          {user?.displayName?.charAt(0).toUpperCase() || <User size={16} />}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{user?.displayName}</p>
          <p className="text-xs text-[var(--text-secondary)]">{user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--color-sell)] transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
