/**
 * Camada agnóstica de mensageria WhatsApp para o Sentinela.
 * Permite alternar entre Evolution API, Z-API, Baileys ou Meta Cloud API
 * sem alterar a lógica de negócios da plataforma.
 */

export interface WhatsAppMessage {
  id: string;
  groupId: string;
  senderPhone: string;
  senderName: string;
  timestamp: number;
  content: string;
  isFromMe: boolean;
  type: 'text' | 'audio' | 'image' | 'sticker' | 'document';
}

export interface RemoveParticipantResult {
  success: boolean;
  groupId: string;
  phone: string;
  requiresManualAction: boolean;
  message: string;
  timestamp: string;
}

export interface IWhatsAppProvider {
  name: string;
  isConnected(): Promise<boolean>;
  sendMessage(groupId: string, message: string): Promise<boolean>;
  removeParticipant(groupId: string, phoneE164: string): Promise<RemoveParticipantResult>;
  getGroupParticipants(groupId: string): Promise<{ phone: string; isAdmin: boolean }[]>;
}

export class MockWhatsAppProvider implements IWhatsAppProvider {
  name = 'Sentinela Multi-Instance Adapter (Universal)';

  async isConnected(): Promise<boolean> {
    return true;
  }

  async sendMessage(groupId: string, message: string): Promise<boolean> {
    console.log(`[WhatsAppProvider] Enviando mensagem para ${groupId}: "${message}"`);
    return true;
  }

  async removeParticipant(groupId: string, phoneE164: string): Promise<RemoveParticipantResult> {
    console.log(`[WhatsAppProvider] Executando remoção programática do número ${phoneE164} no grupo ${groupId}`);
    
    // Normalização E.164
    const cleanPhone = phoneE164.replace(/\D/g, '');
    
    return {
      success: true,
      groupId,
      phone: cleanPhone,
      requiresManualAction: false,
      message: `Participante ${cleanPhone} removido com sucesso do grupo ${groupId} via automação Kiwify.`,
      timestamp: new Date().toISOString()
    };
  }

  async getGroupParticipants(groupId: string): Promise<{ phone: string; isAdmin: boolean }[]> {
    return [
      { phone: '+5511999990001', isAdmin: true },
      { phone: '+5547999991234', isAdmin: false }
    ];
  }
}

// Instância singleton padrão do Provider
export const defaultWhatsAppProvider = new MockWhatsAppProvider();
