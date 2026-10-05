import { Alert, WhatsAppGroup, StudentCustomer, SupportTicket, AttendantMetrics, TopDoubtTopic, SystemUser, WhatsAppInstance, PlatformSettings } from '@/types/sentinela';

export const INITIAL_PRODUCT = {
  id: 'ia-pro',
  name: 'Formação IA Pro',
  platform: 'Kiwify',
  totalGroups: 8,
  activeStudents: 1284,
  totalAttendants: 7,
  webhookStatus: 'online' as const,
  whatsappStatus: 'connected' as const,
};

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    title: 'Risco de Reembolso Crítico',
    category: 'refund_risk',
    severity: 'critical',
    studentName: 'João Silva',
    studentPhone: '+55 47 99842-1102',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #04',
    groupId: 'ia-04',
    messageSnippet: 'Já tentei configurar três vezes e ninguém consegue resolver. Se continuar assim vou pedir o estorno na Kiwify hoje mesmo.',
    timeUnanswered: '1h 42m',
    sentiment: 'negative',
    riskScore: 92,
    createdAt: 'Hoje às 11:28',
    status: 'active'
  },
  {
    id: 'alt-02',
    title: 'Conflito Aluno ↔ Atendente',
    category: 'conflict',
    severity: 'critical',
    studentName: 'Marcos Vinicius',
    studentPhone: '+55 21 98834-5511',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #07',
    groupId: 'ia-07',
    messageSnippet: 'Discussão acalorada detectada: atendente demorou 45 minutos para responder e aluno respondeu com mensagens agressivas.',
    timeUnanswered: '18m',
    sentiment: 'negative',
    riskScore: 78,
    createdAt: 'Hoje às 12:45',
    status: 'active'
  },
  {
    id: 'alt-03',
    title: 'Pergunta Técnica Sem Resposta',
    category: 'unanswered_question',
    severity: 'warning',
    studentName: 'Carla Dias',
    studentPhone: '+55 11 97654-3210',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #02',
    groupId: 'ia-02',
    messageSnippet: 'Como conecto minha API da OpenAI no n8n sem dar erro de timeout na execução?',
    timeUnanswered: '34 minutos',
    sentiment: 'neutral',
    riskScore: 61,
    createdAt: 'Hoje às 13:02',
    status: 'active'
  },
  {
    id: 'alt-04',
    title: 'Bug Reportado em Aula',
    category: 'technical_bug',
    severity: 'warning',
    studentName: 'Felipe Alencar',
    studentPhone: '+55 31 99123-8877',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #03',
    groupId: 'ia-03',
    messageSnippet: 'O link do repositório da Aula 04 do Módulo 3 está dando erro 404 Not Found no GitHub.',
    timeUnanswered: '52 minutos',
    sentiment: 'negative',
    riskScore: 55,
    createdAt: 'Hoje às 12:20',
    status: 'assigned',
    assignedTo: 'Lucas'
  },
  {
    id: 'alt-05',
    title: 'Feedback / Elogio Espontâneo',
    category: 'praise',
    severity: 'success',
    studentName: 'Beatriz Ramos',
    studentPhone: '+55 81 98111-2233',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #01',
    groupId: 'ia-01',
    messageSnippet: 'Consegui fechar meu primeiro cliente de agentes de IA hoje! O módulo do Sentinela salvou meu projeto.',
    timeUnanswered: 'Respondido',
    sentiment: 'positive',
    riskScore: 5,
    createdAt: 'Hoje às 10:15',
    status: 'resolved'
  }
];

export const INITIAL_WHATSAPP_INSTANCE: WhatsAppInstance = {
  id: 'inst-01',
  name: 'Sentinela WhatsApp Bot #01',
  phone: '+55 11 97722-1000',
  status: 'connected',
  lastConnectedAt: 'Hoje às 08:30'
};

export const INITIAL_GROUPS: WhatsAppGroup[] = [
  {
    id: 'ia-01',
    name: 'Formação IA #01',
    productId: 'ia-pro',
    totalStudents: 247,
    totalAttendants: 3,
    status: 'normal',
    unansweredCount: 0,
    avgResponseTimeMin: 8,
    lastMessageAt: 'Há 4 min',
    attendantPhones: ['+5511999990001', '+5511999990002', '+5511999990003'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-02',
    name: 'Formação IA #02',
    productId: 'ia-pro',
    totalStudents: 231,
    totalAttendants: 3,
    status: 'attention',
    unansweredCount: 4,
    avgResponseTimeMin: 18,
    lastMessageAt: 'Há 12 min',
    attendantPhones: ['+5511999990001', '+5511999990004', '+5511999990005'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-03',
    name: 'Formação IA #03',
    productId: 'ia-pro',
    totalStudents: 255,
    totalAttendants: 4,
    status: 'critical',
    unansweredCount: 7,
    avgResponseTimeMin: 36,
    lastMessageAt: 'Há 2 min',
    attendantPhones: ['+5511999990002', '+5511999990006', '+5511999990007'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-04',
    name: 'Formação IA #04',
    productId: 'ia-pro',
    totalStudents: 262,
    totalAttendants: 3,
    status: 'attention',
    unansweredCount: 3,
    avgResponseTimeMin: 14,
    lastMessageAt: 'Há 15 min',
    attendantPhones: ['+5511999990003', '+5511999990005'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-05',
    name: 'Formação IA #05',
    productId: 'ia-pro',
    totalStudents: 180,
    totalAttendants: 2,
    status: 'normal',
    unansweredCount: 1,
    avgResponseTimeMin: 9,
    lastMessageAt: 'Há 35 min',
    attendantPhones: ['+5511999990001'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-08',
    name: 'Formação IA #08 (Gargalo)',
    productId: 'ia-pro',
    totalStudents: 109,
    totalAttendants: 2,
    status: 'critical',
    unansweredCount: 9,
    avgResponseTimeMin: 47,
    lastMessageAt: 'Há 1 min',
    attendantPhones: ['+5511999990007'],
    isMonitored: true,
    isBotAdmin: true
  },
  {
    id: 'ia-09',
    name: 'Formação IA #09 (Turma Nova)',
    productId: 'ia-pro',
    totalStudents: 45,
    totalAttendants: 1,
    status: 'normal',
    unansweredCount: 0,
    avgResponseTimeMin: 5,
    lastMessageAt: 'Ontem',
    attendantPhones: ['+5511999990001'],
    isMonitored: false,
    isBotAdmin: true
  },
  {
    id: 'ia-vip',
    name: 'Comunidade Mastermind IA VIP',
    productId: 'ia-pro',
    totalStudents: 28,
    totalAttendants: 2,
    status: 'normal',
    unansweredCount: 0,
    avgResponseTimeMin: 3,
    lastMessageAt: 'Há 1 hora',
    attendantPhones: ['+5511999990001', '+5511999990002'],
    isMonitored: false,
    isBotAdmin: false
  }
];


export const INITIAL_STUDENTS: StudentCustomer[] = [
  {
    id: 'stu-01',
    name: 'João Silva',
    phone: '+55 47 99842-1102',
    email: 'joao.silva@exemplo.com.br',
    productName: 'Formação IA Pro',
    kiwifyPurchaseDate: '14/09/2026',
    kiwifyStatus: 'active',
    groupName: 'Formação IA #04',
    groupId: 'ia-04',
    totalTickets: 4,
    currentSentiment: 'frustrated',
    accessStatus: 'granted'
  },
  {
    id: 'stu-02',
    name: 'Carla Dias',
    phone: '+55 11 97654-3210',
    email: 'carla.dias@exemplo.com.br',
    productName: 'Formação IA Pro',
    kiwifyPurchaseDate: '18/09/2026',
    kiwifyStatus: 'active',
    groupName: 'Formação IA #02',
    groupId: 'ia-02',
    totalTickets: 2,
    currentSentiment: 'neutral',
    accessStatus: 'granted'
  },
  {
    id: 'stu-03',
    name: 'Marcos Vinicius',
    phone: '+55 21 98834-5511',
    email: 'marcos.v@exemplo.com.br',
    productName: 'Formação IA Pro',
    kiwifyPurchaseDate: '02/10/2026',
    kiwifyStatus: 'active',
    groupName: 'Formação IA #07',
    groupId: 'ia-07',
    totalTickets: 5,
    currentSentiment: 'churn_risk',
    accessStatus: 'granted'
  },
  {
    id: 'stu-04',
    name: 'Mariana Costa',
    phone: '+55 11 98721-4455',
    email: 'mariana.costa@empresa.com',
    productName: 'Formação IA Pro',
    kiwifyPurchaseDate: '22/09/2026',
    kiwifyStatus: 'active',
    groupName: 'Formação IA #01',
    groupId: 'ia-01',
    totalTickets: 1,
    currentSentiment: 'positive',
    accessStatus: 'granted'
  },
  {
    id: 'stu-05',
    name: 'Roberto Antunes',
    phone: '+55 19 99122-3344',
    email: 'roberto.a@exemplo.com',
    productName: 'Formação IA Pro',
    kiwifyPurchaseDate: '28/09/2026',
    kiwifyStatus: 'refunded',
    groupName: 'Formação IA #03',
    groupId: 'ia-03',
    totalTickets: 3,
    currentSentiment: 'churn_risk',
    accessStatus: 'revoked'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tk-1842',
    protocol: 'TK-1842',
    studentName: 'João Silva',
    studentPhone: '+55 47 99842-1102',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #04',
    category: 'Bug de Instalação',
    urgency: 'high',
    tier: 'N2 Técnico',
    status: 'in_progress',
    assignedTo: 'Carlos',
    summary: 'Erro na compilação do container Docker do agente local após atualização de dependências.',
    createdAt: 'Hoje às 11:32'
  },
  {
    id: 'tk-1843',
    protocol: 'TK-1843',
    studentName: 'Carla Dias',
    studentPhone: '+55 11 97654-3210',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #02',
    category: 'Dúvida Integração',
    urgency: 'medium',
    tier: 'N1 Suporte',
    status: 'new',
    summary: 'Orientação de token de autenticação e variáveis de ambiente na integração n8n.',
    createdAt: 'Hoje às 13:05'
  },
  {
    id: 'tk-1844',
    protocol: 'TK-1844',
    studentName: 'Marcos Vinicius',
    studentPhone: '+55 21 98834-5511',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #07',
    category: 'Mediação / Conflito',
    urgency: 'urgent',
    tier: 'N3 Especialista',
    status: 'new',
    assignedTo: 'Amanda (Supervisora)',
    summary: 'Atendimento prioritário de retenção após atrito em grupo público.',
    createdAt: 'Hoje às 12:50'
  },
  {
    id: 'tk-1840',
    protocol: 'TK-1840',
    studentName: 'Thiago Moura',
    studentPhone: '+55 41 98765-1122',
    productName: 'Formação IA Pro',
    groupName: 'Formação IA #01',
    category: 'Acesso à Plataforma',
    urgency: 'low',
    tier: 'N1 Suporte',
    status: 'resolved',
    assignedTo: 'Lucas',
    summary: 'Reenvio de credenciais Kiwify após mudança de e-mail institucional.',
    createdAt: 'Ontem'
  }
];

export const INITIAL_ATTENDANTS: AttendantMetrics[] = [
  {
    id: 'att-01',
    name: 'Amanda',
    avatar: 'A',
    role: 'Supervisor',
    ticketsHandled: 183,
    avgResponseTimeMin: 6,
    resolutionRatePct: 94,
    satisfactionRating: 4.8,
    status: 'online'
  },
  {
    id: 'att-02',
    name: 'Lucas',
    avatar: 'L',
    role: 'Atendente',
    ticketsHandled: 157,
    avgResponseTimeMin: 11,
    resolutionRatePct: 91,
    satisfactionRating: 4.6,
    status: 'online'
  },
  {
    id: 'att-03',
    name: 'Carlos',
    avatar: 'C',
    role: 'Atendente',
    ticketsHandled: 98,
    avgResponseTimeMin: 27,
    resolutionRatePct: 78,
    satisfactionRating: 4.1,
    status: 'overloaded'
  },
  {
    id: 'att-04',
    name: 'Beatriz',
    avatar: 'B',
    role: 'Atendente',
    ticketsHandled: 124,
    avgResponseTimeMin: 14,
    resolutionRatePct: 89,
    satisfactionRating: 4.5,
    status: 'online'
  }
];

export const INITIAL_TOP_TOPICS: TopDoubtTopic[] = [
  { topic: 'Configurar API da OpenAI', occurrences: 84, trendPct: 32, isIncrease: true, category: 'Onboarding' },
  { topic: 'WhatsApp desconectando', occurrences: 61, trendPct: 18, isIncrease: true, category: 'Infraestrutura' },
  { topic: 'Criar primeiro agente', occurrences: 47, trendPct: 7, isIncrease: false, category: 'Conteúdo' },
  { topic: 'Pagamentos & Kiwify', occurrences: 21, trendPct: 0, isIncrease: false, category: 'Financeiro' },
  { topic: 'Login / Acesso membros', occurrences: 18, trendPct: 14, isIncrease: false, category: 'Acessos' }
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'usr-01',
    name: 'Rodrigo Mendes',
    email: 'rodrigo@empresa.com.br',
    phone: '+55 11 98888-7777',
    role: 'admin',
    status: 'active',
    assignedGroupIds: ['ia-01', 'ia-02', 'ia-03', 'ia-04', 'ia-05', 'ia-08'],
    permissions: ['manage_users', 'trigger_removals', 'assign_tickets', 'view_financials', 'manage_integrations'],
    avatar: 'RM',
    createdAt: '01/08/2026',
    lastActiveAt: 'Há 5 min'
  },
  {
    id: 'usr-02',
    name: 'Amanda Silva',
    email: 'amanda@sentinela.ai',
    phone: '+55 11 99999-0001',
    role: 'supervisor',
    status: 'active',
    assignedGroupIds: ['ia-01', 'ia-02', 'ia-03', 'ia-04', 'ia-05', 'ia-08'],
    permissions: ['trigger_removals', 'assign_tickets', 'view_financials'],
    avatar: 'AS',
    createdAt: '15/08/2026',
    lastActiveAt: 'Agora'
  },
  {
    id: 'usr-03',
    name: 'Lucas Nogueira',
    email: 'lucas@sentinela.ai',
    phone: '+55 11 99999-0002',
    role: 'attendant',
    status: 'active',
    assignedGroupIds: ['ia-01', 'ia-02', 'ia-04'],
    permissions: ['assign_tickets'],
    avatar: 'LN',
    createdAt: '01/09/2026',
    lastActiveAt: 'Há 12 min'
  },
  {
    id: 'usr-04',
    name: 'Carlos Eduardo',
    email: 'carlos@sentinela.ai',
    phone: '+55 11 99999-0003',
    role: 'attendant',
    status: 'active',
    assignedGroupIds: ['ia-03', 'ia-08'],
    permissions: ['assign_tickets'],
    avatar: 'CE',
    createdAt: '10/09/2026',
    lastActiveAt: 'Há 2 min'
  },
  {
    id: 'usr-05',
    name: 'Beatriz Ramos',
    email: 'beatriz@sentinela.ai',
    phone: '+55 11 99999-0004',
    role: 'attendant',
    status: 'active',
    assignedGroupIds: ['ia-01', 'ia-05'],
    permissions: ['assign_tickets'],
    avatar: 'BR',
    createdAt: '20/09/2026',
    lastActiveAt: 'Há 35 min'
  },
  {
    id: 'usr-06',
    name: 'Juliana Prado',
    email: 'juliana.auditoria@empresa.com',
    phone: '+55 21 97777-6666',
    role: 'viewer',
    status: 'active',
    assignedGroupIds: [],
    permissions: ['view_financials'],
    avatar: 'JP',
    createdAt: '25/09/2026',
    lastActiveAt: 'Ontem'
  }
];

export const INITIAL_SETTINGS: PlatformSettings = {
  // Chaves de IA
  openaiApiKey: 'sk-proj-783921049281729381749281749',
  anthropicApiKey: 'sk-ant-api03-9182371982739182739182',
  geminiApiKey: 'AIzaSyA8912389127391827391827391',
  activeAiModel: 'gpt-4o-mini',

  // Kiwify
  kiwifyApiToken: 'kw_live_998124018249128491824918',
  kiwifyWebhookSecret: 'whsec_9812409812409812049812',
  kiwifyWebhookUrl: 'https://sentinela.isagestao.com.br/api/webhooks/kiwify',
  autoKickOnRefund: true,

  // WhatsApp
  whatsAppProviderType: 'evolution',
  whatsAppServerUrl: 'https://api.sentinela-wa.isagestao.com',
  whatsAppInstanceName: 'sentinela-bot-01',
  whatsAppApiKey: 'ev_live_key_99182371982379182371',

  // SLA & Alertas
  slaWarningMinutes: 20,
  notifySupervisorsOnConflict: true
};


