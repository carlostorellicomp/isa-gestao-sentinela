export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertCategory = 
  | 'refund_risk' 
  | 'conflict' 
  | 'unanswered_question' 
  | 'technical_bug' 
  | 'access_issue' 
  | 'billing' 
  | 'praise';

export interface Alert {
  id: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  studentName: string;
  studentPhone: string;
  studentAvatar?: string;
  productName: string;
  groupName: string;
  groupId: string;
  messageSnippet: string;
  timeUnanswered: string; // e.g. "1h 42m" or "34m"
  sentiment: 'negative' | 'neutral' | 'positive';
  riskScore: number; // 0 - 100
  createdAt: string;
  status: 'active' | 'assigned' | 'ticketed' | 'resolved';
  assignedTo?: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  productId: string;
  totalStudents: number;
  totalAttendants: number;
  status: 'normal' | 'attention' | 'critical';
  unansweredCount: number;
  avgResponseTimeMin: number;
  lastMessageAt: string;
  attendantPhones: string[];
  isMonitored: boolean;
  isBotAdmin: boolean;
}

export interface WhatsAppInstance {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'connecting' | 'disconnected';
  qrCodeValue?: string;
  lastConnectedAt?: string;
}


export interface StudentCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  productName: string;
  kiwifyPurchaseDate: string;
  kiwifyStatus: 'active' | 'refund_requested' | 'refunded' | 'cancelled';
  groupName: string;
  groupId: string;
  totalTickets: number;
  currentSentiment: 'positive' | 'neutral' | 'frustrated' | 'churn_risk';
  accessStatus: 'granted' | 'revocation_pending' | 'revoked';
}

export interface SupportTicket {
  id: string;
  protocol: string; // e.g. "TK-1842"
  studentName: string;
  studentPhone: string;
  productName: string;
  groupName: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  tier: 'N1 Suporte' | 'N2 Técnico' | 'N3 Especialista';
  status: 'new' | 'in_progress' | 'waiting_client' | 'resolved';
  assignedTo?: string;
  summary: string;
  createdAt: string;
}

export interface AttendantMetrics {
  id: string;
  name: string;
  avatar: string;
  role: 'Atendente' | 'Supervisor' | 'Admin';
  ticketsHandled: number;
  avgResponseTimeMin: number;
  resolutionRatePct: number;
  satisfactionRating: number;
  status: 'online' | 'overloaded' | 'offline';
}

export interface TopDoubtTopic {
  topic: string;
  occurrences: number;
  trendPct: number;
  isIncrease: boolean;
  category: string;
}

export interface KiwifyWebhookEvent {
  event: 'order_approved' | 'refund_requested' | 'refund_approved' | 'subscription_cancelled';
  order_id: string;
  Customer: {
    full_name: string;
    email: string;
    mobile: string;
  };
  Product: {
    product_id: string;
    product_name: string;
  };
  created_at: string;
}

export type UserRole = 'admin' | 'supervisor' | 'attendant' | 'viewer';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string; // WhatsApp do atendente/admin para vínculo automático
  role: UserRole;
  status: UserStatus;
  assignedGroupIds: string[]; // Grupos aos quais tem acesso
  permissions: string[];
  avatar: string;
  createdAt: string;
  lastActiveAt: string;
  password?: string;
}

export interface PlatformSettings {
  // Chaves de IA
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  activeAiModel: string;

  // Kiwify
  kiwifyApiToken: string;
  kiwifyWebhookSecret: string;
  kiwifyWebhookUrl: string;
  autoKickOnRefund: boolean;

  // WhatsApp
  whatsAppProviderType: 'evolution' | 'zapi' | 'baileys' | 'meta_cloud';
  whatsAppServerUrl: string;
  whatsAppInstanceName: string;
  whatsAppApiKey: string;

  // SLA & Alertas
  slaWarningMinutes: number;
  notifySupervisorsOnConflict: boolean;

  // Supabase (Persistência Real)
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}


