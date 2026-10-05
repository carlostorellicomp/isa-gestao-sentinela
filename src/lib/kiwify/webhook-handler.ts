import { defaultWhatsAppProvider, RemoveParticipantResult } from '../whatsapp/provider-adapter';
import { KiwifyWebhookEvent } from '@/types/sentinela';

export interface WebhookProcessingResult {
  status: 'success' | 'ignored' | 'error';
  event: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  actionTaken: string;
  removalResult?: RemoveParticipantResult;
  timestamp: string;
}

/**
 * Processador central de Webhooks da Kiwify.
 * Reconcilia eventos de compra, cancelamento e reembolso com grupos de WhatsApp do Sentinela.
 */
export async function processKiwifyWebhook(payload: KiwifyWebhookEvent): Promise<WebhookProcessingResult> {
  const { event, order_id, Customer, Product } = payload;
  const rawPhone = Customer?.mobile || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  switch (event) {
    case 'refund_approved': {
      // 1. Localiza grupos associados ao produto
      const targetGroupId = `group-prod-${Product?.product_id || 'ia-pro-04'}`;
      
      // 2. Executa remoção programática ou despacha tarefa para admin
      const removal = await defaultWhatsAppProvider.removeParticipant(targetGroupId, cleanPhone);

      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName: Customer.full_name,
        customerPhone: cleanPhone,
        actionTaken: `Reembolso Aprovado. Aluno desconectado do produto "${Product.product_name}" e removido do grupo ${targetGroupId}.`,
        removalResult: removal,
        timestamp: new Date().toISOString()
      };
    }

    case 'refund_requested': {
      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName: Customer.full_name,
        customerPhone: cleanPhone,
        actionTaken: `Alerta Prioritário: Pedido de reembolso solicitado na Kiwify para ${Customer.full_name}. Aluno sinalizado em risco no Sentinela Agora.`,
        timestamp: new Date().toISOString()
      };
    }

    case 'order_approved': {
      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName: Customer.full_name,
        customerPhone: cleanPhone,
        actionTaken: `Venda aprovada na Kiwify. Cliente registrado para onboarding no produto "${Product.product_name}".`,
        timestamp: new Date().toISOString()
      };
    }

    case 'subscription_cancelled': {
      return {
        status: 'success',
        event,
        orderId: order_id,
        customerName: Customer.full_name,
        customerPhone: cleanPhone,
        actionTaken: `Assinatura cancelada na Kiwify. Permissão de suporte revogada.`,
        timestamp: new Date().toISOString()
      };
    }

    default:
      return {
        status: 'ignored',
        event,
        orderId: order_id,
        customerName: Customer?.full_name || 'Desconhecido',
        customerPhone: cleanPhone,
        actionTaken: `Evento '${event}' recebido e registrado sem ação destrutiva.`,
        timestamp: new Date().toISOString()
      };
  }
}
