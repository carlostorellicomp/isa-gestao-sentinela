import { getSupabase } from '../supabase/client';
import { 
  PlatformSettings, 
  StudentCustomer, 
  WhatsAppGroup, 
  Alert, 
  SupportTicket, 
  SystemUser 
} from '@/types/sentinela';
import { 
  INITIAL_SETTINGS, 
  INITIAL_STUDENTS, 
  INITIAL_GROUPS, 
  INITIAL_ALERTS, 
  INITIAL_TICKETS, 
  INITIAL_SYSTEM_USERS 
} from '../mock-data';

const STORAGE_KEYS = {
  SETTINGS: 'sentinela_data_settings',
  STUDENTS: 'sentinela_data_students',
  GROUPS: 'sentinela_data_groups',
  ALERTS: 'sentinela_data_alerts',
  TICKETS: 'sentinela_data_tickets',
  USERS: 'sentinela_data_users'
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private browsing
  }
}

// =========================================================================
// 1. CONFIGURAÇÕES
// =========================================================================

export async function fetchSettings(): Promise<PlatformSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'default_settings')
        .single();
      
      if (!error && data) {
        return {
          openaiApiKey: data.openai_api_key || '',
          anthropicApiKey: data.anthropic_api_key || '',
          geminiApiKey: data.gemini_api_key || '',
          activeAiModel: data.active_ai_model || 'gpt-4o-mini',
          kiwifyApiToken: data.kiwify_api_token || '',
          kiwifyWebhookSecret: data.kiwify_webhook_secret || '',
          kiwifyWebhookUrl: data.kiwify_webhook_url || '',
          autoKickOnRefund: data.auto_kick_on_refund ?? true,
          whatsAppProviderType: (data.whatsapp_provider_type as any) || 'zapi',
          whatsAppServerUrl: data.whatsapp_server_url || 'https://api.z-api.io',
          whatsAppInstanceName: data.whatsapp_instance_name || '',
          whatsAppApiKey: data.whatsapp_api_key || '',
          slaWarningMinutes: data.sla_warning_minutes || 20,
          notifySupervisorsOnConflict: data.notify_supervisors_on_conflict ?? true
        };
      }
    } catch {
      // Fallback para localStorage
    }
  }

  return getLocal<PlatformSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function persistSettings(settings: PlatformSettings): Promise<void> {
  setLocal(STORAGE_KEYS.SETTINGS, settings);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('platform_settings').upsert({
        id: 'default_settings',
        openai_api_key: settings.openaiApiKey,
        anthropic_api_key: settings.anthropicApiKey,
        gemini_api_key: settings.geminiApiKey,
        active_ai_model: settings.activeAiModel,
        kiwify_api_token: settings.kiwifyApiToken,
        kiwify_webhook_secret: settings.kiwifyWebhookSecret,
        kiwify_webhook_url: settings.kiwifyWebhookUrl,
        auto_kick_on_refund: settings.autoKickOnRefund,
        whatsapp_provider_type: settings.whatsAppProviderType,
        whatsapp_server_url: settings.whatsAppServerUrl,
        whatsapp_instance_name: settings.whatsAppInstanceName,
        whatsapp_api_key: settings.whatsAppApiKey,
        sla_warning_minutes: settings.slaWarningMinutes,
        notify_supervisors_on_conflict: settings.notifySupervisorsOnConflict,
        updated_at: new Date().toISOString()
      });
    } catch {
      // Ignorar erro silenciosamente se offline
    }
  }
}

// =========================================================================
// 2. ALUNOS / CLIENTES
// =========================================================================

export async function fetchStudents(): Promise<StudentCustomer[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          name: s.name,
          email: s.email || '',
          phone: s.phone,
          productName: s.product_name || 'Formação IA Pro',
          kiwifyPurchaseDate: s.created_at || 'Hoje',
          kiwifyStatus: (s.access_status === 'revoked' ? 'refunded' : 'active') as any,
          groupName: s.group_id || 'Formação IA #01',
          groupId: s.group_id || 'group-01',
          totalTickets: 0,
          currentSentiment: (s.current_sentiment || 'positive') as any,
          accessStatus: (s.access_status === 'revoked' ? 'revoked' : 'granted') as any
        }));
      }
    } catch {
      // Fallback
    }
  }

  return getLocal<StudentCustomer[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}

export async function persistStudent(student: StudentCustomer): Promise<void> {
  const current = getLocal<StudentCustomer[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const exists = current.some(s => s.id === student.id);
  const updated = exists ? current.map(s => s.id === student.id ? student : s) : [student, ...current];
  setLocal(STORAGE_KEYS.STUDENTS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('students').upsert({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        product_name: student.productName,
        group_id: student.groupName,
        access_status: student.accessStatus === 'revoked' ? 'revoked' : 'active',
        current_sentiment: student.currentSentiment,
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
}

// =========================================================================
// 3. GRUPOS DE WHATSAPP
// =========================================================================

export async function fetchGroups(): Promise<WhatsAppGroup[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(g => ({
          id: g.id,
          name: g.name,
          productId: g.product_name || 'prod-01',
          totalStudents: g.participant_count || 45,
          totalAttendants: 2,
          status: (g.health_status === 'attention' ? 'attention' : 'normal') as any,
          unansweredCount: g.unread_alerts || 0,
          avgResponseTimeMin: 8,
          lastMessageAt: 'Agora',
          attendantPhones: [],
          isMonitored: Boolean(g.is_monitored),
          isBotAdmin: true
        }));
      }
    } catch {}
  }

  return getLocal<WhatsAppGroup[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
}

export async function persistGroups(groups: WhatsAppGroup[]): Promise<void> {
  setLocal(STORAGE_KEYS.GROUPS, groups);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const rows = groups.map(g => ({
        id: g.id,
        name: g.name,
        group_jid: g.id,
        product_name: g.productId,
        participant_count: g.totalStudents,
        is_monitored: g.isMonitored,
        unread_alerts: g.unansweredCount,
        health_status: g.status,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('whatsapp_groups').upsert(rows);
    } catch {}
  }
}

// =========================================================================
// 4. ALERTAS / OCORRÊNCIAS
// =========================================================================

export async function fetchAlerts(): Promise<Alert[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(a => ({
          id: a.id,
          title: `Ocorrência: ${a.student_name}`,
          studentName: a.student_name,
          studentPhone: a.student_phone,
          productName: a.product_name || 'Formação IA Pro',
          groupName: a.group_name || 'Grupo #01',
          groupId: a.group_id || 'grp-01',
          severity: (a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'info') as any,
          category: a.category as any,
          status: (a.status === 'resolved' ? 'resolved' : a.status === 'ticketed' ? 'ticketed' : 'active') as any,
          messageSnippet: a.message_snippet || '',
          timeUnanswered: '12m',
          sentiment: 'negative' as const,
          riskScore: a.severity === 'critical' ? 95 : 70,
          createdAt: new Date(a.created_at || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          assignedTo: a.assigned_to
        }));
      }
    } catch {}
  }

  return getLocal<Alert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
}

export async function persistAlert(alert: Alert): Promise<void> {
  const current = getLocal<Alert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  const updated = [alert, ...current];
  setLocal(STORAGE_KEYS.ALERTS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('alerts').insert({
        id: alert.id,
        student_name: alert.studentName,
        student_phone: alert.studentPhone,
        product_name: alert.productName,
        group_name: alert.groupName,
        severity: alert.severity,
        category: alert.category,
        status: alert.status,
        message_snippet: alert.messageSnippet,
        assigned_to: alert.assignedTo,
        created_at: new Date().toISOString()
      });
    } catch {}
  }
}

// =========================================================================
// 5. TICKETS DE SUPORTE
// =========================================================================

export async function fetchTickets(): Promise<SupportTicket[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(t => ({
          id: t.id,
          protocol: t.protocol,
          studentName: t.student_name,
          studentPhone: t.student_phone,
          productName: t.product_name,
          groupName: t.group_name,
          category: t.category,
          urgency: t.urgency,
          tier: t.tier,
          status: t.status,
          assignedTo: t.assigned_to,
          summary: t.summary,
          createdAt: t.created_at
        }));
      }
    } catch {}
  }

  return getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
}

export async function persistTicket(ticket: SupportTicket): Promise<void> {
  const current = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
  const exists = current.some(t => t.id === ticket.id);
  const updated = exists ? current.map(t => t.id === ticket.id ? ticket : t) : [ticket, ...current];
  setLocal(STORAGE_KEYS.TICKETS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('support_tickets').upsert({
        id: ticket.id,
        protocol: ticket.protocol,
        student_name: ticket.studentName,
        student_phone: ticket.studentPhone,
        product_name: ticket.productName,
        group_name: ticket.groupName,
        category: ticket.category,
        urgency: ticket.urgency,
        tier: ticket.tier,
        status: ticket.status,
        assigned_to: ticket.assignedTo,
        summary: ticket.summary,
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
}

// =========================================================================
// 6. USUÁRIOS DO SISTEMA (RBAC)
// =========================================================================

export async function fetchUsers(): Promise<SystemUser[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          assignedGroupIds: u.assigned_group_ids || [],
          permissions: u.permissions || [],
          avatar: u.avatar || 'US',
          createdAt: u.created_at,
          lastActiveAt: u.last_active_at
        }));
      }
    } catch {}
  }

  return getLocal<SystemUser[]>(STORAGE_KEYS.USERS, INITIAL_SYSTEM_USERS);
}

export async function persistUsers(users: SystemUser[]): Promise<void> {
  setLocal(STORAGE_KEYS.USERS, users);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const rows = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        assigned_group_ids: u.assignedGroupIds,
        permissions: u.permissions,
        avatar: u.avatar,
        last_active_at: new Date().toISOString()
      }));
      await supabase.from('system_users').upsert(rows);
    } catch {}
  }
}
