'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  UserMinus, 
  Check, 
  Layers, 
  BellRing,
  Award,
  Zap,
  UserCog,
  QrCode,
  LayoutGrid,
  Smartphone,
  ChevronLeft,
  Settings,
  LogOut
} from 'lucide-react';

import { 
  INITIAL_PRODUCT, 
  INITIAL_ALERTS, 
  INITIAL_GROUPS, 
  INITIAL_STUDENTS, 
  INITIAL_TICKETS, 
  INITIAL_ATTENDANTS, 
  INITIAL_TOP_TOPICS,
  INITIAL_SYSTEM_USERS,
  INITIAL_WHATSAPP_INSTANCE,
  INITIAL_SETTINGS
} from '@/lib/mock-data';
import { Alert, SupportTicket, StudentCustomer, SystemUser, WhatsAppGroup, WhatsAppInstance, PlatformSettings } from '@/types/sentinela';
import { UserManagement } from '@/components/users/user-management';
import { WhatsAppConnectModal } from '@/components/whatsapp/whatsapp-connect-modal';
import { ModuleHub } from '@/components/hub/module-hub';
import { SettingsView } from '@/components/settings/settings-view';
import { LoginView } from '@/components/auth/login-view';
import { getStoredSession, clearStoredSession } from '@/lib/auth/auth-service';
import { 
  fetchSettings, 
  persistSettings, 
  fetchStudents, 
  persistStudent, 
  fetchGroups, 
  persistGroups, 
  fetchAlerts, 
  persistAlert, 
  fetchTickets, 
  persistTicket, 
  fetchUsers, 
  persistUsers 
} from '@/lib/db/sentinela-db';

export default function SentinelaDashboard() {
  // Estado de Autenticação / Sessão (Sistema Fechado com Acesso Restrito)
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Controle de Módulo Global: Hub Inicial vs Módulo Suporte (Sentinela)
  // Default: 'hub' (Página Principal = Central de Módulos)
  const [currentModule, setCurrentModule] = useState<'hub' | 'suporte'>('hub');

  // Controle de Abas no Módulo Suporte (Default: Visão Geral / Dashboard Inicial)
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'agora' | 'grupos' | 'alunos' | 'reembolso' | 'insights' | 'tickets' | 'equipe' | 'usuarios' | 'configuracoes'>('visao_geral');
  
  // Estado das Configurações Globais (Chaves IA, Kiwify, Gateway WhatsApp)
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);

  // Estado dos Dados
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [students, setStudents] = useState<StudentCustomer[]>(INITIAL_STUDENTS);
  const [groups, setGroups] = useState<WhatsAppGroup[]>(INITIAL_GROUPS);
  const [whatsAppInstance, setWhatsAppInstance] = useState<WhatsAppInstance>(INITIAL_WHATSAPP_INSTANCE);
  
  // Modal de Conexão WhatsApp & Grupos
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Filtros
  const [alertFilter, setAlertFilter] = useState<'all' | 'refund_risk' | 'conflict' | 'unanswered_question'>('all');
  const [timeRange, setTimeRange] = useState<'hoje' | '7dias' | '30dias'>('7dias');
  
  // Estado do simulador Kiwify
  const [isSimulatingRefund, setIsSimulatingRefund] = useState(false);
  const [simulationLog, setSimulationLog] = useState<{ step: number; text: string; time: string }[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Carregar sessão persistida de login
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setCurrentUser(session);
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    showNotification('Sessão encerrada com sucesso.');
  };

  // Se usuário não for admin e tentar acessar aba restrita, redireciona para 'visao_geral'
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && (activeTab === 'usuarios' || activeTab === 'configuracoes')) {
      setActiveTab('visao_geral');
    }
  }, [currentUser, activeTab]);

  // Carregar dados persistidos (Supabase / LocalStorage)
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedStudents, loadedGroups, loadedAlerts, loadedTickets, loadedUsers] = await Promise.all([
          fetchSettings(),
          fetchStudents(),
          fetchGroups(),
          fetchAlerts(),
          fetchTickets(),
          fetchUsers()
        ]);
        if (loadedSettings) setSettings(loadedSettings);
        if (loadedStudents && loadedStudents.length > 0) setStudents(loadedStudents);
        if (loadedGroups && loadedGroups.length > 0) setGroups(loadedGroups);
        if (loadedAlerts && loadedAlerts.length > 0) setAlerts(loadedAlerts);
        if (loadedTickets && loadedTickets.length > 0) setTickets(loadedTickets);
        if (loadedUsers && loadedUsers.length > 0) setUsers(loadedUsers);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    loadData();
  }, []);

  // Ações nos alertas
  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    showNotification('Ocorrência marcada como resolvida.');
  };

  const handleCreateTicketFromAlert = async (alert: Alert) => {
    const newTicket: SupportTicket = {
      id: `tk-${Date.now().toString().slice(-4)}`,
      protocol: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: alert.studentName,
      studentPhone: alert.studentPhone,
      productName: alert.productName,
      groupName: alert.groupName,
      category: alert.category === 'refund_risk' ? 'Risco de Churn / Reembolso' : alert.category === 'conflict' ? 'Conflito de Atendimento' : 'Dúvida Técnica',
      urgency: alert.severity === 'critical' ? 'urgent' : 'high',
      tier: alert.category === 'conflict' ? 'N3 Especialista' : 'N2 Técnico',
      status: 'new',
      summary: alert.messageSnippet,
      createdAt: 'Agora mesmo'
    };
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    await persistTicket(newTicket);
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'ticketed' } : a));
    showNotification(`Ticket ${newTicket.protocol} gerado automaticamente e salvo no banco.`);
  };

  const handleAssignAttendant = (alertId: string, attendantName: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'assigned', assignedTo: attendantName } : a));
    showNotification(`Alerta atribuído ao atendente ${attendantName}.`);
  };

  const handleAddUser = async (newUserData: Omit<SystemUser, 'id' | 'createdAt' | 'lastActiveAt'>) => {
    const newUser: SystemUser = {
      ...newUserData,
      id: `usr-${Date.now().toString().slice(-4)}`,
      createdAt: 'Hoje',
      lastActiveAt: 'Recém-criado'
    };
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    await persistUsers(updatedUsers);
    showNotification(`Usuário ${newUser.name} cadastrado com sucesso.`);
  };

  const handleUpdateUser = async (id: string, updates: Partial<SystemUser>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsers(updated);
    await persistUsers(updated);
    showNotification('Dados de usuário e permissões atualizados.');
  };

  const handleDeleteUser = async (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    await persistUsers(updated);
    showNotification('Usuário removido da equipe do Sentinela.');
  };

  const handleToggleGroupMonitoring = async (groupId: string) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, isMonitored: !g.isMonitored } : g);
    setGroups(updated);
    await persistGroups(updated);
    showNotification('Configuração de monitoramento de grupo alterada.');
  };

  const handleSaveSettings = async (updated: PlatformSettings) => {
    setSettings(updated);
    await persistSettings(updated);
    showNotification('Configurações salvas e sincronizadas com sucesso!');
  };

  // Simulação completa de Webhook Kiwify: Reembolso -> Remoção
  const runKiwifyRefundSimulation = async () => {
    setIsSimulatingRefund(true);
    setSimulationLog([]);

    const addLog = (step: number, text: string) => {
      setSimulationLog(prev => [...prev, {
        step,
        text,
        time: new Date().toLocaleTimeString('pt-BR')
      }]);
    };

    addLog(1, 'Recebendo Webhook da Kiwify: evento "refund.approved" para o pedido #KW-88491 (João Silva)...');
    await new Promise(r => setTimeout(r, 700));
    
    addLog(2, 'Validando assinatura de autenticidade Kiwify HMAC e deduplicação de evento... OK');
    await new Promise(r => setTimeout(r, 800));

    addLog(3, 'Sentinela localiza telefone +55 (47) 99842-1102 e e-mail joao.silva@exemplo.com.br');
    await new Promise(r => setTimeout(r, 800));

    addLog(4, 'Localizado grupo ativo do produto "Formação IA Pro": [Formação IA #04]');
    await new Promise(r => setTimeout(r, 900));

    addLog(5, 'Atualizando status CRM: Aluno João Silva marcado como "Acesso Encerrado / Reembolsado"');
    setStudents(prev => prev.map(s => s.phone.includes('99842-1102') ? {
      ...s,
      kiwifyStatus: 'refunded',
      accessStatus: 'revoked',
      currentSentiment: 'churn_risk'
    } : s));
    await new Promise(r => setTimeout(r, 900));

    addLog(6, 'WhatsAppProvider acionado: removendo número +5547998421102 do Grupo #04...');
    await new Promise(r => setTimeout(r, 700));

    addLog(7, '✅ Automação concluída: João Silva removido do grupo #04 sem necessidade de intervenção humana.');
    setIsSimulatingRefund(false);
    showNotification('Fluxo executado: Reembolso Kiwify processado e usuário removido do grupo.');
  };

  const monitoredGroups = groups.filter(g => g.isMonitored);
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'all') return true;
    return a.category === alertFilter;
  });

  // Se estiver validando sessão inicial, exibe tela de carregamento seguro PaperFlow
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E65C00] flex items-center justify-center text-white shadow-md animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-[#4B5563]">Verificando credenciais de acesso seguro...</span>
        </div>
      </div>
    );
  }

  // Se não autenticado, bloqueia completamente o acesso e exibe a tela de login
  if (!currentUser) {
    return (
      <LoginView
        systemUsers={users}
        onLoginSuccess={(authenticatedUser) => {
          setCurrentUser(authenticatedUser);
          showNotification(`Bem-vindo(a), ${authenticatedUser.name}!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#111827] flex flex-col font-sans selection:bg-[#FFB380]/30 selection:text-[#E65C00]">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#E5E7EB] text-[#111827] px-5 py-3.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-[#E65C00]" />
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Top Bar (PaperFlow Style) */}
      <header className="border-b border-[#E5E7EB] bg-[#FDFBF7]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
            
            {/* Brand + Module Switcher */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentModule('hub')}
                className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer"
                title="Voltar para a Central de Módulos"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E65C00] flex items-center justify-center text-white shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-[#111827]">ISA GESTÃO</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E65C00]/10 text-[#E65C00] border border-[#E65C00]/20">
                      {currentModule === 'hub' ? 'Portal Central' : 'Sentinela'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563]">
                    {currentModule === 'hub' 
                      ? 'Ecossistema integrado de gestão empresarial'
                      : 'Supervisão de suporte, grupos e retenção Kiwify'
                    }
                  </p>
                </div>
              </button>

              <div className="h-6 w-px bg-[#E5E7EB] hidden sm:block" />

              {/* Botão para alternar entre Hub Inicial e Módulo Suporte */}
              {currentModule === 'suporte' ? (
                <button
                  onClick={() => setCurrentModule('hub')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F4EB] hover:bg-[#EFEAD9] border border-[#E8E4D9] text-xs font-semibold text-[#111827] transition-colors cursor-pointer"
                  title="Voltar para a seleção de módulos"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Central de Módulos</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentModule('suporte')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E65C00] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <span>Ir para Módulo Suporte</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Active Product Badge (quando dentro do suporte) */}
              {currentModule === 'suporte' && (
                <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-[10px] text-[#6B7280] block leading-none uppercase tracking-wider font-semibold">Produto</span>
                    <span className="text-xs font-bold text-[#111827]">{INITIAL_PRODUCT.name}</span>
                  </div>
                  <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Kiwify Integrada
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions (WhatsApp Connection Button & Simulation) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Botão de Conectar WhatsApp via QR Code */}
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className={`flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer shadow-2xs ${
                  whatsAppInstance.status === 'connected'
                    ? 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50/50'
                    : 'bg-[#E65C00] text-white border-[#E65C00] hover:bg-[#CC5200]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>
                  {whatsAppInstance.status === 'connected' ? 'WhatsApp Conectado' : 'Conectar WhatsApp (QR)'}
                </span>
                <span className={`w-2 h-2 rounded-full ${whatsAppInstance.status === 'connected' ? 'bg-emerald-500' : 'bg-white animate-pulse'}`} />
              </button>

              {currentModule === 'suporte' && (
                <>
                  <div className="flex items-center gap-2 text-xs bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-[#E65C00]" />
                    <span className="text-[#4B5563]">Alunos:</span>
                    <span className="font-semibold text-[#111827]">1.284</span>
                  </div>

                  <button 
                    onClick={runKiwifyRefundSimulation}
                    disabled={isSimulatingRefund}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isSimulatingRefund ? 'Simulando...' : 'Testar Remoção Kiwify'}
                  </button>
                </>
              )}

              {/* Sessão Ativa & Botão Sair */}
              <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-[#E5E7EB]">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9]">
                  <div className="w-6 h-6 rounded-lg bg-[#E65C00] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-[#111827] block leading-tight truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B7280] block leading-tight capitalize">
                      {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'supervisor' ? 'Supervisor' : 'Atendente'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Encerrar sessão segura"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E7EB] hover:border-rose-200 text-xs font-semibold text-[#4B5563] hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            </div>

          </div>

          {/* Navigation Bar (Somente visível quando dentro do Módulo Suporte) */}
          {currentModule === 'suporte' && (
            <nav className="flex space-x-1.5 overflow-x-auto pt-1 pb-3 scrollbar-none text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('visao_geral')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'visao_geral'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Dashboard & Visão Geral</span>
              </button>

              <button
                onClick={() => setActiveTab('agora')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'agora'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <BellRing className="w-4 h-4" />
                <span>Sentinela Agora</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'agora' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {alerts.filter(a => a.status === 'active').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('grupos')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'grupos'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Central de Grupos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-[#4B5563]">
                  {monitoredGroups.length} / {groups.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('alunos')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'alunos'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Alunos & Kiwify CRM</span>
              </button>

              <button
                onClick={() => setActiveTab('reembolso')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'reembolso'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <UserMinus className="w-4 h-4" />
                <span>Reembolso ➔ Remoção</span>
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'insights'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Insights da IA</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-semibold">Novo</span>
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'tickets'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tickets & Kanban</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-[#4B5563]">{tickets.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('equipe')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'equipe'
                    ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Equipe & SLA</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'usuarios'
                      ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Gestão de Usuários</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-[#4B5563]">{users.length}</span>
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('configuracoes')}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'configuracoes'
                      ? 'bg-[#E65C00] text-white font-semibold shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F4EB]'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações & Conexões</span>
                </button>
              )}
            </nav>
          )}

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW A: CENTRAL DE MÓDULOS (PORTAL / LAUNCHER) */}
        {currentModule === 'hub' && (
          <ModuleHub
            onSelectModule={(key) => {
              if (key === 'suporte') setCurrentModule('suporte');
            }}
            onOpenWhatsAppConnect={() => setIsWhatsAppModalOpen(true)}
            onOpenSettings={currentUser.role === 'admin' ? () => {
              setCurrentModule('suporte');
              setActiveTab('configuracoes');
            } : undefined}
            isWhatsAppConnected={whatsAppInstance.status === 'connected'}
            activeStudentsCount={1284}
            activeGroupsCount={monitoredGroups.length}
          />
        )}

        {/* VIEW B: MÓDULO SUPORTE (SENTINELA) */}
        {currentModule === 'suporte' && (
          <>
            {/* SUB-TAB 1: VISÃO GERAL & DASHBOARD INICIAL (PADRÃO AO ENTRAR NO SUPORTE) */}
            {activeTab === 'visao_geral' && (
              <div className="space-y-6">
                
                {/* Header + Time Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#111827] tracking-tight">Dashboard Executivo de Suporte</h2>
                    <p className="text-xs sm:text-sm text-[#4B5563]">Métricas operacionais de resposta e inteligência de produto.</p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F7F4EB] p-1 rounded-xl border border-[#E8E4D9]">
                    <button
                      onClick={() => setTimeRange('hoje')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        timeRange === 'hoje' ? 'bg-white text-[#E65C00] font-semibold shadow-xs' : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => setTimeRange('7dias')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        timeRange === '7dias' ? 'bg-white text-[#E65C00] font-semibold shadow-xs' : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      7 Dias
                    </button>
                    <button
                      onClick={() => setTimeRange('30dias')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        timeRange === '30dias' ? 'bg-white text-[#E65C00] font-semibold shadow-xs' : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      30 Dias
                    </button>
                  </div>
                </div>

                {/* KPI Cards (PaperFlow Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                    <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block">Alunos Monitorados</span>
                    <div className="text-3xl font-extrabold text-[#111827] mt-1.5">1.284</div>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5" /> +14% novos alunos Kiwify
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                    <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block">Dúvidas na Semana</span>
                    <div className="text-3xl font-extrabold text-[#E65C00] mt-1.5">87</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-emerald-700 font-medium">92% Respondidas</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-rose-600 font-medium">8% Sem Resposta</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                    <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block">Tempo Médio 1ª Resposta</span>
                    <div className="text-3xl font-extrabold text-[#111827] mt-1.5">14 min</div>
                    <span className="text-xs text-[#6B7280] mt-2 block">Meta SLA: até 20 min</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                    <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block">Ocorrências & Churn Risk</span>
                    <div className="text-3xl font-extrabold text-rose-600 mt-1.5">23</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-rose-600 font-semibold">7 em risco</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-amber-600 font-semibold">3 conflitos</span>
                    </div>
                  </div>
                </div>

                {/* Top Doubts with Trend (Product Intelligence) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Ranking de Dúvidas */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Maiores Dúvidas (Product Intelligence)</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">Identifique gargalos de produto antes que virem pedidos de reembolso na Kiwify.</p>
                      </div>
                      <span className="text-xs text-[#E65C00] bg-orange-50 font-semibold px-2.5 py-1 rounded-full border border-orange-200">
                        Filtro: {timeRange}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {INITIAL_TOP_TOPICS.map((topic, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB] flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <span className="w-6 text-center text-xs font-bold text-[#9CA3AF]">#{i + 1}</span>
                            <div>
                              <div className="text-sm font-bold text-[#111827]">{topic.topic}</div>
                              <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">{topic.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#111827]">{topic.occurrences}</span>
                              <span className="text-[11px] text-[#6B7280] block">dúvidas</span>
                            </div>

                            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              topic.trendPct === 0 ? 'text-[#6B7280] bg-gray-100' :
                              topic.isIncrease ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100'
                            }`}>
                              {topic.trendPct === 0 ? '—' : topic.isIncrease ? (
                                <>
                                  <TrendingUp className="w-3 h-3" /> +{topic.trendPct}%
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3" /> -{topic.trendPct}%
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 p-4 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9] text-xs text-[#4B5563] flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#111827]">Diagnóstico Sentinela:</strong> 84 alunos perguntaram sobre como configurar a API da OpenAI. O gargalo não é o suporte; é o onboarding inicial da aula.
                      </div>
                    </div>
                  </div>

                  {/* Status dos Grupos Ativos */}
                  <div className="p-6 rounded-2xl bg-[#F7F4EB] border border-[#E8E4D9] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-2">Saúde dos Grupos</h3>
                      <p className="text-xs text-[#6B7280] mb-5">Situação operacional instantânea dos grupos de suporte.</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB]">
                          <span className="text-xs font-semibold text-emerald-800">🟢 Normais (SLA Saudável)</span>
                          <span className="text-sm font-bold text-[#111827]">5 Grupos</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB]">
                          <span className="text-xs font-semibold text-amber-800">🟡 Atenção (Atraso Leve)</span>
                          <span className="text-sm font-bold text-[#111827]">2 Grupos</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB]">
                          <span className="text-xs font-semibold text-rose-800">🔴 Crítico (SLA Estourado)</span>
                          <span className="text-sm font-bold text-[#111827]">1 Grupo (#08)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E4D9] text-xs text-[#4B5563]">
                      <p className="mb-3 leading-relaxed">
                        <strong>Recomendação:</strong> O Grupo #08 possui tempo médio de resposta de 47 min. Sugerido realocar atendentes com menor carga.
                      </p>
                      <button 
                        onClick={() => setActiveTab('grupos')}
                        className="w-full py-2.5 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#111827] font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Ver Central de Grupos
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUB-TAB 2: SENTINELA AGORA (CENTRAL DE OCORRÊNCIAS EM TEMPO REAL) */}
            {activeTab === 'agora' && (
              <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-bold text-[#111827] tracking-tight">Sentinela Agora</h1>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-xs text-rose-700 font-semibold bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Ocorrências Prioritárias
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-2xl">
                      A IA analisa o contexto contínuo das conversas nos grupos e traz os casos críticos até você.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setAlertFilter('all')}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        alertFilter === 'all'
                          ? 'bg-[#111827] text-white border-[#111827]'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
                      }`}
                    >
                      Todos ({alerts.length})
                    </button>
                    <button
                      onClick={() => setAlertFilter('refund_risk')}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        alertFilter === 'refund_risk'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
                      }`}
                    >
                      🔴 Risco Reembolso
                    </button>
                    <button
                      onClick={() => setAlertFilter('conflict')}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        alertFilter === 'conflict'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
                      }`}
                    >
                      🟠 Conflitos
                    </button>
                    <button
                      onClick={() => setAlertFilter('unanswered_question')}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        alertFilter === 'unanswered_question'
                          ? 'bg-[#E65C00] text-white border-[#E65C00]'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
                      }`}
                    >
                      🟡 Sem Resposta
                    </button>
                  </div>
                </div>

                {/* Alert Cards Feed */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        alert.severity === 'critical'
                          ? 'bg-white border-rose-200 hover:border-rose-300'
                          : alert.severity === 'warning'
                          ? 'bg-white border-amber-200 hover:border-amber-300'
                          : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
                      } shadow-xs`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                        
                        {/* Content */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-0.5">
                            {alert.category === 'refund_risk' && (
                              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                                <Flame className="w-5 h-5" />
                              </div>
                            )}
                            {alert.category === 'conflict' && (
                              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                            )}
                            {alert.category === 'unanswered_question' && (
                              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E65C00]">
                                <Clock className="w-5 h-5" />
                              </div>
                            )}
                            {alert.category === 'technical_bug' && (
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                            )}
                            {alert.category === 'praise' && (
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                <Sparkles className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                alert.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                                alert.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {alert.title}
                              </span>

                              <span className="text-xs font-medium text-[#4B5563]">
                                {alert.groupName}
                              </span>

                              <span className="text-gray-300 text-xs">•</span>

                              <span className="text-xs text-[#4B5563]">
                                Aluno: <strong className="text-[#111827]">{alert.studentName}</strong> ({alert.studentPhone})
                              </span>

                              {alert.status === 'ticketed' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                  Ticket Criado
                                </span>
                              )}
                              {alert.status === 'assigned' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                  Atribuído a {alert.assignedTo}
                                </span>
                              )}
                              {alert.status === 'resolved' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                  Resolvido
                                </span>
                              )}
                            </div>

                            {/* Student quote */}
                            <div className="mt-3 bg-[#F7F4EB] border border-[#E8E4D9] rounded-xl p-3.5 text-sm text-[#111827] italic font-serif leading-relaxed">
                              &ldquo;{alert.messageSnippet}&rdquo;
                            </div>

                            {/* Metadata badges */}
                            <div className="mt-3.5 flex items-center gap-3 text-xs text-[#6B7280] flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                Sem resposta há: <strong className="text-[#E65C00]">{alert.timeUnanswered}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Sentimento: <strong className={alert.sentiment === 'negative' ? 'text-rose-600' : 'text-[#111827]'}>{alert.sentiment}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Risco Estimado: <strong className="text-rose-600">{alert.riskScore}%</strong>
                              </span>
                              <span>•</span>
                              <span>{alert.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center w-full md:w-auto">
                          <button
                            onClick={() => handleCreateTicketFromAlert(alert)}
                            disabled={alert.status === 'ticketed' || alert.status === 'resolved'}
                            className="text-xs px-3.5 py-2 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-40 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Criar Ticket
                          </button>

                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) handleAssignAttendant(alert.id, e.target.value);
                              }}
                              value={alert.assignedTo || ''}
                              disabled={alert.status === 'resolved'}
                              className="text-xs px-3 py-2 rounded-lg bg-white hover:bg-[#F7F4EB] text-[#374151] font-medium border border-[#E5E7EB] cursor-pointer w-full focus:outline-none focus:border-[#E65C00]"
                            >
                              <option value="" disabled>Atribuir Atendente...</option>
                              {users
                                .filter(u => u.status === 'active' && (u.role === 'attendant' || u.role === 'supervisor'))
                                .map(u => (
                              <option key={u.id} value={u.name}>
                                {u.name} ({u.role === 'supervisor' ? 'Supervisor' : 'Atendente'})
                              </option>
                            ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={alert.status === 'resolved'}
                        className="text-xs px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolver
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SUB-TAB 3: CENTRAL DE GRUPOS (COM WIZARD DE CONEXÃO E SELEÇÃO) */}
        {activeTab === 'grupos' && (
          <div className="space-y-6">
            
            {/* Header + Action to open WhatsApp Wizard */}
            <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827] tracking-tight">Central de Grupos Monitorados</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {monitoredGroups.length} Ativos
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
                  Aparelho Conectado: <strong className="text-[#111827]">{whatsAppInstance.phone}</strong> • {whatsAppInstance.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="px-4 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  Conectar Novo Número / Selecionar Grupos
                </button>
              </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map(group => (
                <div 
                  key={group.id}
                  className={`p-6 rounded-2xl bg-white border transition-all ${
                    !group.isMonitored 
                      ? 'border-dashed border-gray-300 opacity-60' 
                      : group.status === 'critical'
                      ? 'border-rose-300 shadow-xs'
                      : 'border-[#E5E7EB] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#111827] text-base">{group.name}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      !group.isMonitored ? 'bg-gray-100 text-gray-600' :
                      group.status === 'critical' ? 'bg-rose-100 text-rose-800' :
                      group.status === 'attention' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {!group.isMonitored ? 'Pausado' : group.status === 'critical' ? '🔴 Crítico' : group.status === 'attention' ? '🟡 Atenção' : '🟢 Normal'}
                    </span>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      group.isBotAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {group.isBotAdmin ? '✓ Bot é Admin' : '⚠️ Bot Não é Admin'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      group.isMonitored ? 'bg-orange-50 text-[#E65C00] border-orange-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {group.isMonitored ? 'Monitorando' : 'Ignorado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 py-4 border-y border-[#E5E7EB] text-xs">
                    <div>
                      <span className="text-[#6B7280] block">Alunos Ativos</span>
                      <strong className="text-[#111827] text-sm font-bold">{group.totalStudents}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Atendentes</span>
                      <strong className="text-[#111827] text-sm font-bold">{group.totalAttendants}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Tempo Médio SLA</span>
                      <strong className={group.avgResponseTimeMin > 25 ? 'text-rose-600 text-sm font-bold' : 'text-emerald-700 text-sm font-bold'}>
                        {group.avgResponseTimeMin} min
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Dúvidas Pendentes</span>
                      <strong className={group.unansweredCount > 0 ? 'text-[#E65C00] text-sm font-bold' : 'text-[#6B7280] text-sm font-bold'}>
                        {group.unansweredCount} dúvidas
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleGroupMonitoring(group.id)}
                      className="text-xs text-[#6B7280] hover:text-[#111827] underline cursor-pointer"
                    >
                      {group.isMonitored ? 'Desativar Monitoramento' : 'Ativar Monitoramento'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('agora')}
                      className="text-[#E65C00] hover:text-[#CC5200] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Ver Alertas <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: ALUNOS & KIWIFY CRM */}
        {activeTab === 'alunos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827] tracking-tight">Alunos & Cruzamento Kiwify</h2>
                <p className="text-xs sm:text-sm text-[#4B5563]">WhatsApp ↔ Compra Kiwify ↔ Produto ↔ Grupo ↔ Sentimento</p>
              </div>

              <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                Sincronização Kiwify: Webhook Ativo
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#4B5563]">
                <thead className="bg-[#F7F4EB] text-[#4B5563] uppercase tracking-wider text-[10px] border-b border-[#E8E4D9] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Aluno</th>
                    <th className="px-5 py-3.5">WhatsApp</th>
                    <th className="px-5 py-3.5">Grupo Atual</th>
                    <th className="px-5 py-3.5">Compra Kiwify</th>
                    <th className="px-5 py-3.5">Status Kiwify</th>
                    <th className="px-5 py-3.5">Sentimento IA</th>
                    <th className="px-5 py-3.5">Acesso no Grupo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#111827] text-sm">{student.name}</div>
                        <div className="text-[11px] text-[#6B7280]">{student.email}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[#111827]">{student.phone}</td>
                      <td className="px-5 py-4 font-medium text-[#111827]">{student.groupName}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{student.kiwifyPurchaseDate}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          student.kiwifyStatus === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          student.kiwifyStatus === 'refunded' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {student.kiwifyStatus === 'active' ? 'Ativo' : student.kiwifyStatus === 'refunded' ? 'Reembolsado' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          student.currentSentiment === 'frustrated' ? 'bg-yellow-100 text-yellow-800' :
                          student.currentSentiment === 'churn_risk' ? 'bg-rose-100 text-rose-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {student.currentSentiment === 'frustrated' ? '🟡 Frustrado' :
                           student.currentSentiment === 'churn_risk' ? '🔴 Risco de Churn' :
                           '🟢 Positivo / Normal'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold ${
                          student.accessStatus === 'granted' ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {student.accessStatus === 'granted' ? 'Liberado' : 'Revogado / Removido'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: REEMBOLSO ➔ REMOÇÃO */}
        {activeTab === 'reembolso' && (
          <div className="space-y-6">
            <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9]">
              <div className="flex items-center gap-3 mb-2">
                <UserMinus className="w-6 h-6 text-[#E65C00]" />
                <h2 className="text-xl font-bold text-[#111827]">Automação de Reembolso Kiwify ➔ Remoção de Grupos</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] max-w-3xl leading-relaxed">
                Quando a Kiwify emite o evento <code>refund.approved</code>, o Sentinela intercepta o webhook, localiza o aluno pelo telefone, mapeia os grupos de WhatsApp do produto e executa o desligamento automático do aluno.
              </p>
            </div>

            {/* Pipeline Diagram */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <h3 className="text-xs uppercase tracking-wider text-[#6B7280] font-bold mb-4">Pipeline Operacional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#E65C00] font-bold block uppercase">Passo 1</span>
                  <span className="text-xs font-bold text-[#111827] mt-1 block">Kiwify Webhook</span>
                  <p className="text-[11px] text-[#6B7280] mt-1">refund.approved</p>
                </div>
                <div className="flex items-center justify-center text-[#9CA3AF] hidden md:flex">➔</div>
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#E65C00] font-bold block uppercase">Passo 2</span>
                  <span className="text-xs font-bold text-[#111827] mt-1 block">Sentinela Engine</span>
                  <p className="text-[11px] text-[#6B7280] mt-1">Busca Telefone E.164</p>
                </div>
                <div className="flex items-center justify-center text-[#9CA3AF] hidden md:flex">➔</div>
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#E65C00] font-bold block uppercase">Passo 3</span>
                  <span className="text-xs font-bold text-[#111827] mt-1 block">WhatsApp Provider</span>
                  <p className="text-[11px] text-[#6B7280] mt-1">Remoção do Grupo</p>
                </div>
              </div>
            </div>

            {/* Interactive Live Simulator */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Simulador de Eventos Kiwify em Tempo Real</h3>
                  <p className="text-xs text-[#6B7280]">Dispare o evento para observar a reconciliação e o log de execução.</p>
                </div>

                <button
                  onClick={runKiwifyRefundSimulation}
                  disabled={isSimulatingRefund}
                  className="px-4 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Flame className="w-4 h-4" />
                  {isSimulatingRefund ? 'Processando Automação...' : 'Simular Reembolso de Aluno (João Silva)'}
                </button>
              </div>

              {/* Simulation Log Console */}
              <div className="bg-[#111827] text-slate-100 rounded-xl p-4 font-mono text-xs min-h-[160px] space-y-2">
                <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-700 flex items-center justify-between">
                  <span>LOG DE EXECUÇÃO SENTINELA ENGINE</span>
                  <span>ENDPOINT: /api/webhooks/kiwify</span>
                </div>

                {simulationLog.length === 0 && (
                  <div className="text-slate-400 py-6 text-center italic">
                    Aguardando disparo de webhook Kiwify... Clique no botão acima para rodar a simulação.
                  </div>
                )}

                {simulationLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-400 shrink-0">[{log.time}]</span>
                    <span className="text-[#FFB380] font-bold shrink-0">Passo {log.step}:</span>
                    <span className={log.step === 7 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 6: INSIGHTS DA IA */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9]">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-6 h-6 text-[#E65C00]" />
                <h2 className="text-xl font-bold text-[#111827]">Insights Sentinela — Inteligência de Produto</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] max-w-3xl leading-relaxed">
                A IA analisa todas as mensagens em contexto semanal e transforma o suporte em um <strong>consultor operacional estratégico</strong> para o seu infoproduto.
              </p>
            </div>

            {/* Weekly Findings Report */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Principais Descobertas — Ciclo Recente</h3>
                <span className="text-xs text-[#E65C00] font-semibold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Gerado por IA Sentinela
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 text-[#E65C00] text-xs font-semibold mb-1.5">
                    <Sparkles className="w-4 h-4" /> Dúvidas de Setup Inicial
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    <strong>31% das dúvidas</strong> desta semana estão concentradas na configuração de API e tokens OpenAI/Anthropic.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold mb-1.5">
                    <Clock className="w-4 h-4" /> Desvio de SLA no Grupo #08
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    O <strong>Grupo #08</strong> possui tempo médio de resposta <strong>74% superior</strong> aos demais grupos devido à sobrecarga de atendentes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold mb-1.5">
                    <Flame className="w-4 h-4" /> Frustração com Instalação
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    <strong>17 alunos</strong> demonstraram expressões de frustração relacionadas ao ambiente local Docker no Windows.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold mb-1.5">
                    <AlertTriangle className="w-4 h-4" /> Termos de Cancelamento
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    <strong>6 alunos</strong> utilizaram palavras como &ldquo;reembolso Kiwify&rdquo;, &ldquo;estorno&rdquo; ou &ldquo;cancelar compra&rdquo;.
                  </p>
                </div>
              </div>

              {/* Actionable Prescriptive Recommendation */}
              <div className="p-5 rounded-xl bg-[#F7F4EB] border border-[#E8E4D9]">
                <span className="text-xs font-bold text-[#E65C00] uppercase tracking-wider block mb-1">
                  💡 Recomendação Prescritiva da IA
                </span>
                <p className="text-sm text-[#111827] font-medium leading-relaxed">
                  &ldquo;Criar um tutorial rápido de 3 minutos em vídeo focado na configuração da API e fixar no topo dos grupos pode <strong>eliminar aproximadamente 20% a 30% das dúvidas atuais</strong> e reduzir o risco de reembolso em até 40%.&rdquo;
                </p>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 7: TICKETS & KANBAN */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827] tracking-tight">Kanban de Tickets Automáticos</h2>
                <p className="text-xs sm:text-sm text-[#4B5563]">Perguntas complexas e bugs nos grupos transformados em tickets com SLA e níveis N1/N2/N3.</p>
              </div>

              <div className="text-xs text-[#4B5563] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-2xs">
                Total de Tickets: <strong className="text-[#111827]">{tickets.length}</strong>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Coluna 1: Novo */}
              <div className="bg-[#F7F4EB] border border-[#E8E4D9] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">Novo</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#111827] font-bold border border-[#E8E4D9]">
                    {tickets.filter(t => t.status === 'new').length}
                  </span>
                </div>
                
                {tickets.filter(t => t.status === 'new').map(ticket => (
                  <div key={ticket.id} className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E65C00]">{ticket.protocol}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ticket.urgency === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.tier}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#111827]">{ticket.category}</div>
                    <p className="text-[11px] text-[#4B5563] line-clamp-2">&ldquo;{ticket.summary}&rdquo;</p>
                    <div className="text-[10px] text-[#6B7280] flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                      <span>{ticket.studentName}</span>
                      <span>{ticket.groupName}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coluna 2: Em Atendimento */}
              <div className="bg-[#F7F4EB] border border-[#E8E4D9] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E65C00]">Em Atendimento</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#E65C00] font-bold border border-orange-200">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>

                {tickets.filter(t => t.status === 'in_progress').map(ticket => (
                  <div key={ticket.id} className="p-4 rounded-xl bg-white border border-orange-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E65C00]">{ticket.protocol}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {ticket.tier}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#111827]">{ticket.category}</div>
                    <p className="text-[11px] text-[#4B5563] line-clamp-2">&ldquo;{ticket.summary}&rdquo;</p>
                    <div className="text-[10px] text-[#4B5563] flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                      <span>Atendente: <strong>{ticket.assignedTo}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coluna 3: Aguardando Cliente */}
              <div className="bg-[#F7F4EB] border border-[#E8E4D9] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Aguardando Aluno</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    {tickets.filter(t => t.status === 'waiting_client').length}
                  </span>
                </div>
                <div className="text-center py-8 text-[#9CA3AF] text-xs italic">
                  Nenhum ticket aguardando resposta de aluno.
                </div>
              </div>

              {/* Coluna 4: Resolvido */}
              <div className="bg-[#F7F4EB] border border-[#E8E4D9] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Resolvido</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </span>
                </div>

                {tickets.filter(t => t.status === 'resolved').map(ticket => (
                  <div key={ticket.id} className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#6B7280]">{ticket.protocol}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Concluído</span>
                    </div>
                    <div className="text-xs font-medium text-[#111827]">{ticket.category}</div>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1">{ticket.summary}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* SUB-TAB 8: EQUIPE & SLA */}
        {activeTab === 'equipe' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827] tracking-tight">Ranking & Gestão da Equipe de Suporte</h2>
                <p className="text-xs sm:text-sm text-[#4B5563]">SLA, taxa de resolução e balanceamento de carga de trabalho entre os atendentes.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#4B5563]">
                <thead className="bg-[#F7F4EB] text-[#4B5563] uppercase tracking-wider text-[10px] border-b border-[#E8E4D9] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Atendente</th>
                    <th className="px-5 py-3.5">Função</th>
                    <th className="px-5 py-3.5 text-right">Atendimentos</th>
                    <th className="px-5 py-3.5 text-right">Tempo Médio Resposta</th>
                    <th className="px-5 py-3.5 text-right">% Resolvidos</th>
                    <th className="px-5 py-3.5 text-right">Avaliação Média</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {INITIAL_ATTENDANTS.map(att => (
                    <tr key={att.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F7F4EB] border border-[#E8E4D9] text-[#E65C00] font-bold text-xs flex items-center justify-center">
                          {att.avatar}
                        </div>
                        <span className="font-semibold text-[#111827] text-sm">{att.name}</span>
                      </td>
                      <td className="px-5 py-4 text-[#6B7280]">{att.role}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#111827]">{att.ticketsHandled}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#E65C00]">{att.avgResponseTimeMin} min</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-700">{att.resolutionRatePct}%</td>
                      <td className="px-5 py-4 text-right font-bold text-amber-600">★ {att.satisfactionRating}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          att.status === 'overloaded' ? 'bg-rose-100 text-rose-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {att.status === 'overloaded' ? '⚠️ Sobrecarregado' : '🟢 Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#E8E4D9] text-xs text-[#4B5563] flex items-start gap-3">
              <Bot className="w-5 h-5 text-[#E65C00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#111827]">Recomendação de Gestão:</strong> Carlos está com tempo médio de resposta de 27 min e taxa de 78%. A IA detectou que ele está alocado sozinho no Grupo #08 com alto volume de dúvidas técnicas avançadas. Sugerido pareamento com Amanda.
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 9: GESTÃO DE USUÁRIOS & RBAC (APENAS ADMINISTRADORES) */}
        {activeTab === 'usuarios' && currentUser.role === 'admin' && (
          <UserManagement
            users={users}
            groups={groups}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* SUB-TAB 10: CONFIGURAÇÕES GERAIS (KEYS, KIWIFY, WHATSAPP - APENAS ADMINISTRADORES) */}
        {activeTab === 'configuracoes' && currentUser.role === 'admin' && (
          <SettingsView
            settings={settings}
            onSave={handleSaveSettings}
            onOpenWhatsAppConnect={() => setIsWhatsAppModalOpen(true)}
          />
        )}

          </>
        )}

      </main>

      {/* MODAL GLOBAL: WIZARD DE CONEXÃO WHATSAPP (QR CODE + ADMIN + SELEÇÃO DE GRUPOS) */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        instance={whatsAppInstance}
        groups={groups}
        onUpdateGroups={(updated) => {
          setGroups(updated);
          showNotification('Configurações de grupos atualizadas com sucesso.');
        }}
        onUpdateInstance={(updated) => {
          setWhatsAppInstance(updated);
          showNotification('Instância de WhatsApp sincronizada via QR Code.');
        }}
      />

    </div>
  );
}
