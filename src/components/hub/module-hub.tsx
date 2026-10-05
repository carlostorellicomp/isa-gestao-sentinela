'use client';

import React from 'react';
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Users, 
  Sparkles,
  Layers,
  Settings,
  Lock
} from 'lucide-react';

interface ModuleHubProps {
  onSelectModule: (moduleKey: 'suporte' | 'financeiro' | 'comercial') => void;
  onOpenWhatsAppConnect: () => void;
  onOpenSettings?: () => void;
  isWhatsAppConnected: boolean;
  activeStudentsCount: number;
  activeGroupsCount: number;
}

export function ModuleHub({
  onSelectModule,
  onOpenWhatsAppConnect,
  onOpenSettings,
  isWhatsAppConnected,
  activeStudentsCount,
  activeGroupsCount
}: ModuleHubProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner (PaperFlow Style) */}
      <div className="bg-[#F7F4EB] border border-[#E8E4D9] rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E65C00]/10 border border-[#E65C00]/20 text-[#E65C00] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Ecossistema ISA Gestão Empresarial
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Central de Módulos Operacionais
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Selecione o módulo de gestão que deseja operar hoje. O módulo de <strong>Suporte (Sentinela)</strong> está 100% ativo com inteligência artificial para monitorar grupos de WhatsApp e integração direta com a Kiwify.
          </p>
        </div>

        {/* Ambient Warm Accent */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#FFB380]/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Modules Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MÓDULO 1: SUPORTE (SENTINELA) - ATIVO */}
        <div className="bg-white border-2 border-[#E65C00] rounded-3xl p-7 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E65C00] text-white flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Módulo Ativo
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111827]">Suporte & Sentinela</h2>
              <p className="text-xs text-[#E65C00] font-semibold mt-0.5">Central Inteligente de Grupos</p>
              <p className="text-xs text-[#4B5563] mt-2.5 leading-relaxed">
                Supervisão de grupos de WhatsApp 24/7 com IA. Identifica alunos frustrados, detecta risco de reembolso na Kiwify, audita SLA e remove automaticamente alunos cancelados.
              </p>
            </div>

            {/* Quick Metrics Capsule */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E5E7EB] text-xs">
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Grupos Monitorados</span>
                <strong className="text-sm font-bold text-[#111827]">{activeGroupsCount} Grupos</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Alunos Cobertos</span>
                <strong className="text-sm font-bold text-[#111827]">{activeStudentsCount} Alunos</strong>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button
              onClick={() => onSelectModule('suporte')}
              className="w-full py-3 px-4 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              Acessar Painel do Suporte
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MÓDULO 2: FINANCEIRO (KIWIFY) - EM BREVE */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-7 shadow-xs flex flex-col justify-between opacity-95 hover:border-gray-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F4EB] text-[#4B5563] flex items-center justify-center border border-[#E8E4D9]">
                <DollarSign className="w-6 h-6 text-[#111827]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#4B5563] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Em Breve
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111827]">Financeiro & Kiwify</h2>
              <p className="text-xs text-[#6B7280] font-semibold mt-0.5">Conciliação & Faturamento</p>
              <p className="text-xs text-[#4B5563] mt-2.5 leading-relaxed">
                Acompanhamento de vendas brutas, chargebacks, estornos automáticos, fluxo de caixa e cálculo do impacto financeiro do suporte na retenção de assinaturas.
              </p>
            </div>

            {/* Preview Metrics */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E5E7EB] text-xs">
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Faturamento Mensal</span>
                <strong className="text-sm font-bold text-[#111827]">R$ 142.800</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Reembolso Evitado</span>
                <strong className="text-sm font-bold text-emerald-600">R$ 18.400</strong>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-gray-100 text-[#9CA3AF] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              Módulo em Desenvolvimento
            </button>
          </div>
        </div>

        {/* MÓDULO 3: COMERCIAL & VENDAS - EM BREVE */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-7 shadow-xs flex flex-col justify-between opacity-95 hover:border-gray-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F4EB] text-[#4B5563] flex items-center justify-center border border-[#E8E4D9]">
                <TrendingUp className="w-6 h-6 text-[#111827]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#4B5563] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Em Breve
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111827]">Comercial & Vendas</h2>
              <p className="text-xs text-[#6B7280] font-semibold mt-0.5">Recuperação & CRM</p>
              <p className="text-xs text-[#4B5563] mt-2.5 leading-relaxed">
                Recuperação de checkout abandonado via WhatsApp oficial, disparos de campanhas para base de alunos, pipeline de upsell e métricas de conversão de equipe de vendas.
              </p>
            </div>

            {/* Preview Metrics */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E5E7EB] text-xs">
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Leads Quentes</span>
                <strong className="text-sm font-bold text-[#111827]">240 Contatos</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px]">Taxa de Conversão</span>
                <strong className="text-sm font-bold text-emerald-600">38%</strong>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-gray-100 text-[#9CA3AF] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              Módulo em Desenvolvimento
            </button>
          </div>
        </div>

      </div>

      {/* Global Integration & Infrastructure Card */}
      <div className="p-6 rounded-2xl bg-[#F7F4EB] border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E65C00]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Conexão Central de WhatsApp & Aparelhos</h3>
            <p className="text-xs text-[#4B5563]">
              Status: <strong className="text-emerald-700">{isWhatsAppConnected ? '🟢 Aparelho Conectado via QR Code' : '🔴 Nenhum Aparelho Conectado'}</strong>. O mesmo número pode ser utilizado pelos módulos de Suporte e Comercial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Configurar Chaves & APIs
            </button>
          )}
          <button
            onClick={onOpenWhatsAppConnect}
            className="px-4 py-2 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Conectar WhatsApp (QR Code)
          </button>
        </div>
      </div>

    </div>
  );
}
