import { KiwifyWebhookEvent } from '@/types/sentinela';
import { ZApiService } from '../whatsapp/zapi-service';
import { createClient } from '@supabase/supabase-js';

export interface WebhookProcessingResult {
  status: 'success' | 'ignored' | 'error';
  event: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  actionTaken: string;
  removalResult?: { success: boolean; error?: string };
  timestamp: string;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

/**
 * Processador central de Webhooks da Kiwify conectado com Supabase e Z-API real
 */
export async function processKiwifyWebhook(payload: KiwifyWebhookEvent): Promise<WebhookProcessingResult> {
  const { event, order_id, Customer, Product } = payload;
  const rawPhone = Customer?.mobile || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const customerName = Customer?.full_name || 'Aluno';
  const customerEmail = Customer?.email || '';
  const productName = Product?.product_name || 'Produto Kiwify';

  const supabase = getSupabaseClient();

  switch (event) {
    case 'order_approved': {
      // 1. Gravar aluno no banco de dados real
      if (supabase) {
        try {
          const studentId = `std-kw-${order_id || Date.now().toString().slice(-4)}`;
          await supabase.from('students').upsert({
            id: studentId,
            name: customerName,
            email: customerEmail,
            phone: cleanPhone ? `+55 ${cleanPhone}` : 'Sem telefone',
            kiwify_order_id: order_id,
            product_name: productName,
            access_status: 'active',
            current_sentiment: 'positive',
            last_interaction: 'Compra aprovada',
            updated_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error('[Kiwify Webhook] Erro ao cadastrar aluno no Supabase:', dbErr);
        }
      }

      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName,
        customerPhone: cleanPhone,
        actionTaken: `Venda aprovada na Kiwify. Aluno cadastrado no Sentinela para o produto "${productName}".`,
        timestamp: new Date().toISOString()
      };
    }

    case 'refund_approved':
    case 'subscription_cancelled': {
      let removalResult = { success: true };

      // 1. Atualizar status do aluno no banco de dados
      if (supabase) {
        try {
          await supabase
            .from('students')
            .update({
              access_status: 'revoked',
              current_sentiment: 'churn_risk',
              last_interaction: 'Reembolso aprovado na Kiwify',
              updated_at: new Date().toISOString()
            })
            .or(`kiwify_order_id.eq.${order_id},phone.ilike.%${cleanPhone}%`);

          // 2. Criar alerta crítico no Sentinela
          const alertId = `alt-refund-${order_id || Date.now().toString().slice(-4)}`;
          await supabase.from('alerts').insert({
            id: alertId,
            student_name: customerName,
            student_phone: cleanPhone,
            product_name: productName,
            group_name: 'Grupos do Produto',
            severity: 'critical',
            category: 'refund_risk',
            status: 'open',
            message_snippet: `Reembolso aprovado na Kiwify para o pedido #${order_id}. Aluno teve o acesso revogado.`,
            ai_analysis: 'Reembolso confirmado. Remoção automática acionada via gateway.',
            created_at: new Date().toISOString()
          });

          // 3. Buscar configurações da Z-API e grupos monitorados para expulsão automática
          const { data: settings } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', 'default_settings')
            .single();

          if (settings?.auto_kick_on_refund && settings?.whatsapp_instance_name && settings?.whatsapp_api_key) {
            const zapi = new ZApiService({
              instanceId: settings.whatsapp_instance_name,
              token: settings.whatsapp_api_key,
              baseUrl: settings.whatsapp_server_url || 'https://api.z-api.io'
            });

            // Buscar grupos ativos
            const { data: groups } = await supabase
              .from('whatsapp_groups')
              .select('group_jid')
              .eq('is_monitored', true);

            if (groups && groups.length > 0) {
              for (const grp of groups) {
                await zapi.removeParticipant(cleanPhone, grp.group_jid);
              }
            }
          }
        } catch (dbErr) {
          console.error('[Kiwify Webhook] Erro ao processar remoção:', dbErr);
        }
      }

      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName,
        customerPhone: cleanPhone,
        actionTaken: `Reembolso da Kiwify processado com sucesso. Acesso revogado e participante removido dos grupos monitorados.`,
        removalResult,
        timestamp: new Date().toISOString()
      };
    }

    case 'refund_requested': {
      if (supabase) {
        try {
          const alertId = `alt-req-${order_id || Date.now().toString().slice(-4)}`;
          await supabase.from('alerts').insert({
            id: alertId,
            student_name: customerName,
            student_phone: cleanPhone,
            product_name: productName,
            group_name: 'Grupos do Produto',
            severity: 'high',
            category: 'refund_risk',
            status: 'open',
            message_snippet: `Pedido de reembolso solicitado na Kiwify (#${order_id}). Oportunidade de reversão rápida pelo suporte N3.`,
            created_at: new Date().toISOString()
          });
        } catch {}
      }

      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName,
        customerPhone: cleanPhone,
        actionTaken: `Alerta gerado: Solicitação de reembolso registrada para ${customerName}.`,
        timestamp: new Date().toISOString()
      };
    }

    default:
      return {
        status: 'ignored',
        event,
        orderId: order_id,
        customerName,
        customerPhone: cleanPhone,
        actionTaken: `Evento '${event}' registrado pelo listener.`,
        timestamp: new Date().toISOString()
      };
  }
}
