import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('admin@revamp.ai');
  const [password, setPassword] = useState('AdminPass123!');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch {
      // Error managed in store
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-dark-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-dark-950 font-bold shadow-lg border border-accent-light/40 mb-2">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">REVAMP AI</h1>
          <p className="text-xs text-slate-400 max-w-sm">
            Automated Cybersecurity Intelligence & Content Transformation Engine
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-dark-800 bg-dark-900/90 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
              OPERATOR ACCESS
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your credentials to access the intelligence platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-md bg-red-950/80 border border-red-800 text-red-200 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Input
                  label="Analyst Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@revamp.ai"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Authenticate Access
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials Note */}
        <div className="p-3 rounded-md bg-dark-900 border border-dark-800 text-center">
          <p className="text-[11px] text-slate-400">
            Demo Operator Credentials: <span className="text-accent font-mono">admin@revamp.ai</span> / <span className="text-accent font-mono">AdminPass123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
