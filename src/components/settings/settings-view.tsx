'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Bot, 
  Smartphone, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Database,
  ExternalLink,
  QrCode,
  Send
} from 'lucide-react';
import { PlatformSettings } from '@/types/sentinela';
import { setSupabaseCredentials } from '@/lib/supabase/client';

interface SettingsViewProps {
  settings: PlatformSettings;
  onSave: (updatedSettings: PlatformSettings) => void;
  onOpenWhatsAppConnect: () => void;
  onSimulateRealAlert?: (text: string, studentName: string, groupName: string) => Promise<void>;
}

export function SettingsView({
  settings,
  onSave,
  onOpenWhatsAppConnect,
  onSimulateRealAlert
}: SettingsViewProps) {
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Estados dos testes reais
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const [isTestingKiwify, setIsTestingKiwify] = useState(false);
  const [kiwifyTestResult, setKiwifyTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [whatsAppTestResult, setWhatsAppTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; text: string } | null>(null);

  // Testador interativo de mensagem com IA
  const [testMessage, setTestMessage] = useState('Quero meu dinheiro de volta! O suporte de vocês não responde há 3 dias e o conteúdo está desatualizado. Vou abrir reclamação no Procon!');
  const [isAnalyzingMessage, setIsAnalyzingMessage] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState<any | null>(null);

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCopyWebhook = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(formData.kiwifyWebhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- Copie e cole no Editor SQL do seu projeto no Supabase (supabase.com)
CREATE TABLE IF NOT EXISTS public.platform_settings (id text primary key, openai_api_key text, anthropic_api_key text, gemini_api_key text, kiwify_api_token text, whatsapp_instance_name text, whatsapp_api_key text, auto_kick_on_refund boolean default true);
CREATE TABLE IF NOT EXISTS public.whatsapp_groups (id text primary key, name text not null, group_jid text not null unique, participant_count integer default 0, is_monitored boolean default true);
CREATE TABLE IF NOT EXISTS public.students (id text primary key, name text not null, email text, phone text not null, kiwify_order_id text, access_status text default 'active', current_sentiment text default 'positive');
CREATE TABLE IF NOT EXISTS public.alerts (id text primary key, student_name text not null, student_phone text not null, group_name text not null, severity text default 'medium', category text not null, status text default 'open', message_snippet text not null, created_at timestamp with time zone default now());
CREATE TABLE IF NOT EXISTS public.support_tickets (id text primary key, protocol text not null unique, student_name text not null, student_phone text not null, group_name text not null, category text not null, urgency text default 'medium', status text default 'new', summary text not null);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.platform_settings FOR ALL USING (true);
CREATE POLICY "Allow all groups" ON public.whatsapp_groups FOR ALL USING (true);
CREATE POLICY "Allow all students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow all alerts" ON public.alerts FOR ALL USING (true);
CREATE POLICY "Allow all tickets" ON public.support_tickets FOR ALL USING (true);`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  // Teste REAL de IA via API Route
  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Preciso de ajuda urgente para acessar o módulo 3',
          studentName: 'Aluno Teste',
          groupName: 'Grupo #01',
          openaiKey: formData.openaiApiKey,
          geminiKey: formData.geminiApiKey,
          activeModel: formData.activeAiModel
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestResult({
          success: true,
          text: `IA Conectada com Sucesso! Motor ativo: ${data.analysis.modelUsed} (Sentimento detectado: ${data.analysis.sentiment}, Gravidade: ${data.analysis.severity}).`
        });
      } else {
        setAiTestResult({
          success: false,
          text: `Erro ao testar IA: ${data.error || 'Verifique sua chave de API'}`
        });
      }
    } catch (err: unknown) {
      setAiTestResult({
        success: false,
        text: err instanceof Error ? err.message : 'Falha na conexão com motor de IA'
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Teste REAL da Z-API via API Route
  const handleTestWhatsApp = async () => {
    setIsTestingWhatsApp(true);
    setWhatsAppTestResult(null);

    try {
      if (formData.whatsAppProviderType === 'zapi') {
        const res = await fetch('/api/whatsapp/sync-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: formData.whatsAppInstanceName,
            token: formData.whatsAppApiKey,
            baseUrl: formData.whatsAppServerUrl
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setWhatsAppTestResult({
            success: true,
            text: `Z-API Conectada! Foram identificados ${data.count} grupos reais de WhatsApp na sua conta.`
          });
        } else {
          setWhatsAppTestResult({
            success: false,
            text: `Retorno Z-API: ${data.error || 'Não foi possível autenticar a instância. Verifique o Instance ID e Token.'}`
          });
        }
      } else {
        setWhatsAppTestResult({
          success: true,
          text: `Driver ${formData.whatsAppProviderType.toUpperCase()} selecionado com sucesso.`
        });
      }
    } catch (err: unknown) {
      setWhatsAppTestResult({
        success: false,
        text: err instanceof Error ? err.message : 'Falha na chamada com o gateway'
      });
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  // Teste REAL do Supabase
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);

    try {
      if (!formData.supabaseUrl || !formData.supabaseAnonKey) {
        setSupabaseTestResult({
          success: false,
          text: 'Preencha a URL e a Anon Key do Supabase para testar.'
        });
        return;
      }

      setSupabaseCredentials(formData.supabaseUrl, formData.supabaseAnonKey);

      // Fazer ping na API REST do Supabase
      const checkRes = await fetch(`${formData.supabaseUrl.trim()}/rest/v1/`, {
        headers: {
          'apikey': formData.supabaseAnonKey.trim(),
          'Authorization': `Bearer ${formData.supabaseAnonKey.trim()}`
        }
      });

      if (checkRes.ok || checkRes.status === 200 || checkRes.status === 404) {
        setSupabaseTestResult({
          success: true,
          text: 'Conexão com o Supabase estabelecida com sucesso! As alterações serão persistidas no PostgreSQL em nuvem.'
        });
      } else {
        setSupabaseTestResult({
          success: false,
          text: `Supabase respondeu HTTP ${checkRes.status}. Verifique se a URL e a Anon Key estão corretas.`
        });
      }
    } catch (err: unknown) {
      setSupabaseTestResult({
        success: false,
        text: err instanceof Error ? err.message : 'Falha ao conectar com o Supabase'
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Teste interativo de IA com texto customizado
  const handleAnalyzeCustomMessage = async () => {
    if (!testMessage.trim()) return;
    setIsAnalyzingMessage(true);
    setAnalysisOutput(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testMessage,
          studentName: 'Thiago Martins',
          groupName: 'Formação IA #03',
          openaiKey: formData.openaiApiKey,
          geminiKey: formData.geminiApiKey,
          activeModel: formData.activeAiModel
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysisOutput(data.analysis);
      } else {
        setAnalysisOutput({ error: data.error || 'Erro na análise' });
      }
    } catch (err: unknown) {
      setAnalysisOutput({ error: err instanceof Error ? err.message : 'Falha na análise' });
    } finally {
      setIsAnalyzingMessage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.supabaseUrl && formData.supabaseAnonKey) {
      setSupabaseCredentials(formData.supabaseUrl, formData.supabaseAnonKey);
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Central de Conexões Reais & Chaves de API</h2>
            <span className="text-xs text-[#E65C00] font-semibold bg-[#E65C00]/10 px-2.5 py-0.5 rounded-full border border-[#E65C00]/20">
              100% Funcional
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Insira suas credenciais da <strong>Z-API (WhatsApp)</strong>, <strong>Kiwify</strong>, <strong>OpenAI/Gemini</strong> e <strong>Supabase (PostgreSQL)</strong> para operar em produção real.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          Salvar Todas as Configurações
        </button>
      </div>

      {/* SEÇÃO 0: BANCO DE DADOS SUPABASE (PERSISTÊNCIA REAL) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E7EB] pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">0. Banco de Dados Supabase (PostgreSQL em Nuvem)</h3>
              <p className="text-xs text-[#6B7280]">Garante persistência de alunos, tickets, ocorrências e configurações em produção.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FDFBF7] hover:bg-gray-100 text-xs font-semibold text-[#111827] cursor-pointer"
              title="Copiar script SQL para criar as tabelas no Supabase"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'SQL Copiado!' : 'Copiar Script SQL'}
            </button>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              {isTestingSupabase ? 'Testando...' : 'Testar Conexão Supabase'}
            </button>
          </div>
        </div>

        {supabaseTestResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            supabaseTestResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {supabaseTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{supabaseTestResult.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Project URL do Supabase
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={formData.supabaseUrl || ''}
              onChange={e => setFormData({ ...formData, supabaseUrl: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
            />
            <span className="text-[10px] text-[#6B7280] mt-1 block">Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Anon Public API Key
            </label>
            <div className="relative">
              <input
                type={showKeys['supabaseKey'] ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabaseAnonKey || ''}
                onChange={e => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('supabaseKey')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['supabaseKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: CHAVES DE IA (LLMS) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-[#E65C00] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">1. Chaves de Inteligência Artificial</h3>
              <p className="text-xs text-[#6B7280]">Usadas para classificar sentimentos, detectar atritos e riscos de reembolso.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestAi}
            disabled={isTestingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-xs font-semibold text-[#E65C00] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
            {isTestingAi ? 'Testando IA...' : 'Testar Conexão de IA'}
          </button>
        </div>

        {aiTestResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            aiTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {aiTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{aiTestResult.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              OpenAI API Key (GPT-4o / GPT-4o-mini)
            </label>
            <div className="relative">
              <input
                type={showKeys['openai'] ? 'text' : 'password'}
                placeholder="sk-proj-..."
                value={formData.openaiApiKey}
                onChange={e => setFormData({ ...formData, openaiApiKey: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('openai')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKeys['gemini'] ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={formData.geminiApiKey}
                onChange={e => setFormData({ ...formData, geminiApiKey: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Anthropic API Key (Claude 3.5 Sonnet)
            </label>
            <div className="relative">
              <input
                type={showKeys['anthropic'] ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={formData.anthropicApiKey}
                onChange={e => setFormData({ ...formData, anthropicApiKey: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('anthropic')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Modelo de IA Ativo para o Sentinela
            </label>
            <select
              value={formData.activeAiModel}
              onChange={e => setFormData({ ...formData, activeAiModel: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
            >
              <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Recomendado - Ultra rápido e baixo custo)</option>
              <option value="gpt-4o">OpenAI GPT-4o (Precisão máxima em mediação)</option>
              <option value="claude-3-5-sonnet-20241022">Anthropic Claude 3.5 Sonnet (Excelente em nuance textual)</option>
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Gratuito / Baixo Custo)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: TESTADOR / SIMULADOR REAL DE MENSAGEM COM IA */}
      <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#E65C00]" />
          <h3 className="text-sm font-bold text-[#111827]">
            Laboratório de Análise em Tempo Real (Teste sua IA)
          </h3>
        </div>
        <p className="text-xs text-[#4B5563]">
          Digite qualquer mensagem real que um aluno mandaria em um grupo para ver o Sentinela processando com a IA conectada:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={e => setTestMessage(e.target.value)}
            placeholder="Ex: Quero meu dinheiro de volta, curso horrível, vou ao Procon!"
            className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00]"
          />
          <button
            type="button"
            onClick={handleAnalyzeCustomMessage}
            disabled={isAnalyzingMessage}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isAnalyzingMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {isAnalyzingMessage ? 'Analisando...' : 'Analisar com IA'}
          </button>
        </div>

        {analysisOutput && (
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] text-xs space-y-2 animate-in fade-in">
            {analysisOutput.error ? (
              <span className="text-rose-700 font-semibold">{analysisOutput.error}</span>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#E65C00]">
                    Motor: {analysisOutput.modelUsed}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    analysisOutput.sentiment === 'churn_risk' ? 'bg-rose-100 text-rose-800' :
                    analysisOutput.sentiment === 'negative' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    Sentimento: {analysisOutput.sentiment}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Categoria: {analysisOutput.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Gravidade: {analysisOutput.severity}
                  </span>
                </div>
                <p className="text-[#111827] font-semibold">{analysisOutput.summary}</p>
                <p className="text-[#4B5563] text-[11px]"><strong className="text-[#111827]">Recomendação:</strong> {analysisOutput.recommendedAction}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: INTEGRAÇÃO KIWIFY */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              KW
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">2. Integração Kiwify (Vendas & Reembolsos)</h3>
              <p className="text-xs text-[#6B7280]">Receba webhooks instantâneos de compras, cancelamentos e pedidos de reembolso.</p>
            </div>
          </div>
        </div>

        {/* URL do Webhook do Sentinela para colar na Kiwify */}
        <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>URL do Webhook do Sentinela</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">Copie e cole na Kiwify</span>
            </label>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="text-xs text-[#E65C00] font-semibold hover:text-[#CC5200] flex items-center gap-1 cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? 'Copiado!' : 'Copiar URL'}
            </button>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs font-mono text-[#111827] select-all break-all">
            {formData.kiwifyWebhookUrl}
          </div>
          <span className="text-[10px] text-[#6B7280] mt-1.5 block">
            Cadastre esta URL em: <strong>Kiwify &gt; Apps &gt; Webhooks</strong> selecionando os eventos de Compra e Reembolso Aprovado.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Token de API Kiwify (Opcional para consultas diretas)
            </label>
            <div className="relative">
              <input
                type={showKeys['kiwifyToken'] ? 'text' : 'password'}
                placeholder="kw_live_..."
                value={formData.kiwifyApiToken}
                onChange={e => setFormData({ ...formData, kiwifyApiToken: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('kiwifyToken')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['kiwifyToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Assinatura Secreta HMAC do Webhook
            </label>
            <div className="relative">
              <input
                type={showKeys['kiwifySecret'] ? 'text' : 'password'}
                placeholder="whsec_..."
                value={formData.kiwifyWebhookSecret}
                onChange={e => setFormData({ ...formData, kiwifyWebhookSecret: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('kiwifySecret')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['kiwifySecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Regra de Remoção Automática */}
        <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#E65C00] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#111827]">
              <input
                type="checkbox"
                checked={formData.autoKickOnRefund}
                onChange={e => setFormData({ ...formData, autoKickOnRefund: e.target.checked })}
                className="rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00]"
              />
              Expulsão Automática de Alunos Reembolsados dos Grupos de WhatsApp
            </label>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Quando a Kiwify enviar o webhook de <code>refund_approved</code> ou <code>subscription_cancelled</code>, o Sentinela aciona imediatamente o WhatsApp Gateway para remover o número do participante do grupo do produto sem intervenção humana.
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: GATEWAY WHATSAPP (Z-API) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E7EB] pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">3. Gateway de WhatsApp (Z-API)</h3>
              <p className="text-xs text-[#6B7280]">Conexão que monitora grupos, lê mensagens em tempo real e remove reembolsados.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWhatsAppConnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FDFBF7] hover:bg-gray-100 text-xs font-semibold text-[#111827] cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E65C00]" />
              Abrir QR Code
            </button>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={isTestingWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingWhatsApp ? 'animate-spin' : ''}`} />
              {isTestingWhatsApp ? 'Consultando Z-API...' : 'Testar & Sincronizar Grupos'}
            </button>
          </div>
        </div>

        {whatsAppTestResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            whatsAppTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {whatsAppTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{whatsAppTestResult.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Provedor Selecionado
            </label>
            <select
              value={formData.whatsAppProviderType}
              onChange={e => setFormData({ ...formData, whatsAppProviderType: e.target.value as any })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
            >
              <option value="zapi">Z-API (Oficial / Suporte Nativo)</option>
              <option value="evolution">Evolution API (Multi-Device Auto-Host)</option>
              <option value="meta_cloud">Meta WhatsApp Cloud API (Oficial)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              URL Base da Z-API
            </label>
            <input
              type="text"
              placeholder="https://api.z-api.io"
              value={formData.whatsAppServerUrl}
              onChange={e => setFormData({ ...formData, whatsAppServerUrl: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              ID da Instância Z-API (Instance ID)
            </label>
            <input
              type="text"
              placeholder="3B8F9A12..."
              value={formData.whatsAppInstanceName}
              onChange={e => setFormData({ ...formData, whatsAppInstanceName: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Token de Instância Z-API
            </label>
            <div className="relative">
              <input
                type={showKeys['whatsappKey'] ? 'text' : 'password'}
                placeholder="D8E4B2..."
                value={formData.whatsAppApiKey}
                onChange={e => setFormData({ ...formData, whatsAppApiKey: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('whatsappKey')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['whatsappKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 5: REGRAS OPERACIONAIS & SLA */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
          4. Regras Operacionais do Sentinela
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Tempo Limite para Alerta de Pergunta Sem Resposta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={formData.slaWarningMinutes}
                onChange={e => setFormData({ ...formData, slaWarningMinutes: Number(e.target.value) })}
                className="w-24 bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-bold focus:outline-none focus:border-[#E65C00]"
              />
              <span className="text-xs text-[#4B5563]">minutos</span>
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">Se nenhum atendente responder nesse prazo, a ocorrência entra em destaque no Sentinela Agora.</span>
          </div>

          <div className="flex items-center pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifySupervisorsOnConflict}
                onChange={e => setFormData({ ...formData, notifySupervisorsOnConflict: e.target.checked })}
                className="mt-0.5 rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-[#111827] block">
                  Alertar Supervisores no WhatsApp em Conflitos Graves
                </span>
                <p className="text-[11px] text-[#6B7280]">
                  Dispara uma mensagem direta no WhatsApp dos supervisores cadastrados caso a IA detecte bate-boca ou ameaça pública de cancelamento.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Footer Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Todas as Configurações
        </button>
      </div>

    </form>
  );
}
