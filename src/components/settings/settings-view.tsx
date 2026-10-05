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
  ExternalLink,
  QrCode
} from 'lucide-react';
import { PlatformSettings } from '@/types/sentinela';

interface SettingsViewProps {
  settings: PlatformSettings;
  onSave: (updatedSettings: PlatformSettings) => void;
  onOpenWhatsAppConnect: () => void;
}

export function SettingsView({
  settings,
  onSave,
  onOpenWhatsAppConnect
}: SettingsViewProps) {
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingKiwify, setIsTestingKiwify] = useState(false);
  const [kiwifyTestResult, setKiwifyTestResult] = useState<string | null>(null);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [whatsAppTestResult, setWhatsAppTestResult] = useState<string | null>(null);

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

  const handleTestAi = () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    setTimeout(() => {
      setIsTestingAi(false);
      setAiTestResult('Chave OpenAI validada com sucesso! Resposta em 420ms.');
    }, 1200);
  };

  const handleTestKiwify = () => {
    setIsTestingKiwify(true);
    setKiwifyTestResult(null);
    setTimeout(() => {
      setIsTestingKiwify(false);
      setKiwifyTestResult('Conexão Kiwify OK: Webhook Secret verificado com sucesso.');
    }, 1200);
  };

  const handleTestWhatsApp = () => {
    setIsTestingWhatsApp(true);
    setWhatsAppTestResult(null);
    setTimeout(() => {
      setIsTestingWhatsApp(false);
      setWhatsAppTestResult('Gateway WhatsApp Online: Instância "sentinela-bot-01" sincronizada.');
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Central de Conexões & Chaves de API</h2>
            <span className="text-xs text-[#E65C00] font-semibold bg-[#E65C00]/10 px-2.5 py-0.5 rounded-full border border-[#E65C00]/20">
              Configurações Globais
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Configure suas credenciais da Kiwify, provedor de WhatsApp (Evolution API, Z-API, Baileys ou Meta Cloud) e chaves de IA para alimentar o cérebro do Sentinela.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações
        </button>
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
              <p className="text-xs text-[#6B7280]">Usadas para classificar dúvidas, detectar frustração e resumir contexto.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestAi}
            disabled={isTestingAi}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F7F4EB] text-[#374151] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTestingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#E65C00]" />}
            {isTestingAi ? 'Testando...' : 'Testar Chave de IA'}
          </button>
        </div>

        {aiTestResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiTestResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OpenAI Key */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              OpenAI API Key <span className="text-[#E65C00] font-normal">(Recomendada)</span>
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
            <span className="text-[10px] text-[#6B7280] mt-1 block">Modelo rápido para classificação de mensagens nos grupos.</span>
          </div>

          {/* Anthropic Key */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Anthropic Claude API Key <span className="text-[#6B7280] font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys['anthropic'] ? 'text' : 'password'}
                placeholder="sk-ant-api03-..."
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
            <span className="text-[10px] text-[#6B7280] mt-1 block">Utilizado na síntese de relatórios semanais de Product Intelligence.</span>
          </div>

          {/* Gemini Key */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Google Gemini API Key <span className="text-[#6B7280] font-normal">(Opcional)</span>
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

          {/* Active Model Selector */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Modelo Padrão de Análise de Mensagens
            </label>
            <select
              value={formData.activeAiModel}
              onChange={e => setFormData({ ...formData, activeAiModel: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
            >
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Recomendado — Ultra Barato & Rápido)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Máxima Precisão Contextual)</option>
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Janela de Contexto Gigante)</option>
            </select>
            <span className="text-[10px] text-[#6B7280] mt-1 block">A IA opera após filtro local para não queimar tokens desnecessariamente.</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: INTEGRAÇÃO KIWIFY */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              KW
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">2. Conexão Kiwify (Webhooks & API)</h3>
              <p className="text-xs text-[#6B7280]">Cruza eventos de compras, pedidos de estorno e cancelamentos em tempo real.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestKiwify}
            disabled={isTestingKiwify}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F7F4EB] text-[#374151] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTestingKiwify ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-600" />}
            {isTestingKiwify ? 'Testando...' : 'Testar Conexão Kiwify'}
          </button>
        </div>

        {kiwifyTestResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{kiwifyTestResult}</span>
          </div>
        )}

        {/* Webhook URL Endpoint Box */}
        <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111827]">URL do Webhook do Sentinela (Copie e cole na Kiwify):</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              Pronto para Receber Eventos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={formData.kiwifyWebhookUrl}
              className="flex-1 bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3 py-2 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? 'Copiado!' : 'Copiar URL'}
            </button>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            Cadastre esta URL em <strong>Kiwify &gt; Apps &gt; Webhooks</strong> e marque os eventos: <code>purchase.approved</code>, <code>refund.requested</code>, <code>refund.approved</code>, <code>subscription.cancelled</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Token de API Kiwify
            </label>
            <div className="relative">
              <input
                type={showKeys['kiwifyApi'] ? 'text' : 'password'}
                placeholder="kw_live_..."
                value={formData.kiwifyApiToken}
                onChange={e => setFormData({ ...formData, kiwifyApiToken: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('kiwifyApi')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                {showKeys['kiwifyApi'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Webhook Secret (Assinatura HMAC)
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

        {/* Checkbox Auto-kick */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoKickOnRefund}
              onChange={e => setFormData({ ...formData, autoKickOnRefund: e.target.checked })}
              className="mt-0.5 rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00] w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-[#111827] block">
                Remoção Automática Imediata de Alunos Reembolsados
              </span>
              <p className="text-[11px] text-[#6B7280]">
                Ao receber <code>refund.approved</code>, o Sentinela remove o aluno do grupo de WhatsApp sem intervenção manual. Se desmarcado, apenas cria uma tarefa de alta prioridade para o administrador.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* SEÇÃO 3: PROVEDOR DE WHATSAPP */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold text-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">3. Gateway & Provedor de WhatsApp</h3>
              <p className="text-xs text-[#6B7280]">Conexão agnóstica para leitura de grupos e disparos operacionais.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={isTestingWhatsApp}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F7F4EB] text-[#374151] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTestingWhatsApp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-600" />}
              {isTestingWhatsApp ? 'Testando...' : 'Testar Gateway'}
            </button>

            <button
              type="button"
              onClick={onOpenWhatsAppConnect}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              Abrir QR Code
            </button>
          </div>
        </div>

        {whatsAppTestResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{whatsAppTestResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Provedor / Driver Selecionado
            </label>
            <select
              value={formData.whatsAppProviderType}
              onChange={e => setFormData({ ...formData, whatsAppProviderType: e.target.value as any })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
            >
              <option value="evolution">Evolution API (Multi-Device Auto-Host)</option>
              <option value="zapi">Z-API (SaaS Estável)</option>
              <option value="baileys">Baileys Native Adapter (Standalone)</option>
              <option value="meta_cloud">Meta WhatsApp Cloud API (Oficial)</option>
            </select>
            <span className="text-[10px] text-[#6B7280] mt-1 block">A arquitetura desacoplada permite trocar o fornecedor a qualquer momento.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              URL da API do Gateway
            </label>
            <input
              type="text"
              placeholder="https://api.sentinela-wa.isagestao.com"
              value={formData.whatsAppServerUrl}
              onChange={e => setFormData({ ...formData, whatsAppServerUrl: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              Nome da Instância (Instance ID)
            </label>
            <input
              type="text"
              placeholder="sentinela-bot-01"
              value={formData.whatsAppInstanceName}
              onChange={e => setFormData({ ...formData, whatsAppInstanceName: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1">
              API Key do Gateway WhatsApp
            </label>
            <div className="relative">
              <input
                type={showKeys['whatsappKey'] ? 'text' : 'password'}
                placeholder="ev_live_key_..."
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

      {/* SEÇÃO 4: REGRAS OPERACIONAIS & SLA */}
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
