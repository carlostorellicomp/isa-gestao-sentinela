'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  KeyRound,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SystemUser } from '@/types/sentinela';
import { authenticateUser } from '@/lib/auth/auth-service';

interface LoginViewProps {
  systemUsers: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
}

export function LoginView({ systemUsers, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(email, password, systemUsers);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas.');
      }
    }, 400);
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(quickEmail, quickPass, systemUsers);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Erro na autenticação.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans selection:bg-[#FFB380]/30 selection:text-[#E65C00]">
      
      {/* Ambient Warm Blur Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-[#FFB380]/20 to-[#E65C00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E65C00] text-white shadow-md mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">ISA GESTÃO</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E65C00]/10 text-[#E65C00] border border-[#E65C00]/20">
                Sentinela
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
              Central Inteligente de Monitoramento e Suporte
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F4EB] border border-[#E8E4D9] text-[#111827] text-xs font-semibold">
            <Lock className="w-3 h-3 text-[#E65C00]" />
            Sistema Fechado • Acesso Restrito à Equipe
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-7 sm:p-8 shadow-xs space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@isagestao.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#E65C00] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#374151]">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#E65C00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Badges (1-Click Login for Demo/Team) */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
            <span className="text-[11px] font-semibold text-[#6B7280] block text-center uppercase tracking-wider">
              Acesso Rápido de Teste (1-Clique)
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@isagestao.com.br', 'admin123')}
                className="w-full p-2.5 rounded-xl border border-[#E8E4D9] bg-[#F7F4EB] hover:bg-[#EFEAD9] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#E65C00] text-white flex items-center justify-center text-[10px] font-bold">
                    AD
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111827] block">Administrador Master</span>
                    <span className="text-[10px] text-[#6B7280]">admin@isagestao.com.br (Acesso Total)</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#E65C00] bg-orange-100 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('amanda@sentinela.ai', 'senha123')}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] hover:bg-[#FDFBF7] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">
                    SP
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111827] block">Amanda Silva</span>
                    <span className="text-[10px] text-[#6B7280]">amanda@sentinela.ai</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Supervisora
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('lucas@sentinela.ai', 'senha123')}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] hover:bg-[#FDFBF7] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                    AT
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111827] block">Lucas Nogueira</span>
                    <span className="text-[10px] text-[#6B7280]">lucas@sentinela.ai</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Atendente
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Autenticação Criptografada • ISA Gestão Empresarial</span>
        </div>

      </div>

    </div>
  );
}
