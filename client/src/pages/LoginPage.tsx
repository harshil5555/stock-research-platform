import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useLogin, useRegister } from '@/hooks/useAuth';

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const login = useLogin();
  const register = useRegister();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      register.mutate({ email, password, name });
    } else {
      login.mutate({ email, password });
    }
  };

  const isPending = login.isPending || register.isPending;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 bg-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <TrendingUp size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Stock Research
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={isPending}
              />
            )}
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isPending}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              minLength={6}
              disabled={isPending}
            />
            <Button type="submit" className="w-full" loading={isPending}>
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              disabled={isPending}
              className="text-sm text-[var(--accent)] hover:underline disabled:opacity-50"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
