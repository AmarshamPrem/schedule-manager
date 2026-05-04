import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  mode?: 'login' | 'register';
}

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'login' | 'register'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('auth-session', JSON.stringify({ email, name, at: Date.now() }));
      toast.success(activeMode === 'login' ? 'Welcome back' : 'Account created');
      setLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 animate-fade-in-up">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-pop">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ProductiFlow</span>
          </div>

          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Your day, <br />
              <span className="gradient-text">designed with intent.</span>
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              A disciplined control panel for tasks, time, and habits.
              Keyboard-first. Offline-ready. Built for deep work.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Daily planning', 'Focus mode', 'Habit streaks', 'Capacity model'].map((tag, i) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur animate-fade-in-up"
                  style={{ animationDelay: `${200 + i * 60}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '500ms' }}>
            © {new Date().getFullYear()} ProductiFlow · Built for focused minds
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-float animate-fade-in-up">
          <div className="mb-6 lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ProductiFlow</span>
          </div>

          {/* Tabs */}
          <div className="relative mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <span
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-card shadow-soft transition-transform duration-300 ease-spring"
              style={{ transform: activeMode === 'login' ? 'translateX(0%)' : 'translateX(100%)' }}
            />
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                className={`relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeMode === m ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {activeMode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeMode === 'login'
                ? 'Sign in to continue your streak.'
                : 'Set up your control panel in seconds.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'register' && (
              <div className="space-y-1.5 animate-fade-in-up">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="group w-full gradient-brand text-primary-foreground shadow-pop press hover:opacity-95"
            >
              {loading ? 'Please wait…' : activeMode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to the{' '}
            <Link to="/" className="underline-offset-2 hover:underline">Terms</Link> &{' '}
            <Link to="/" className="underline-offset-2 hover:underline">Privacy</Link>.
          </p>
        </Card>
      </div>
    </div>
  );
}
