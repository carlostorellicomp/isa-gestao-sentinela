// =========================================================================
// SERVIÇO DE INTEGRAÇÃO OFICIAL Z-API (WHATSAPP GATEWAY)
// Documentação: https://developer.z-api.io/
// =========================================================================

export interface ZApiConfig {
  instanceId: string;
  token: string;
  clientToken?: string;
  baseUrl?: string;
}

export interface ZApiStatus {
  connected: boolean;
  smartphoneConnected?: boolean;
  error?: string;
}

export interface ZApiGroup {
  id: string; // groupJid, ex: 120363028392182910@g.us
  name: string;
  isGroup: boolean;
  participantCount?: number;
}

export class ZApiService {
  private baseUrl: string;
  private instanceId: string;
  private token: string;
  private clientToken?: string;

  constructor(config: ZApiConfig) {
    this.baseUrl = config.baseUrl || 'https://api.z-api.io';
    this.instanceId = config.instanceId.trim();
    this.token = config.token.trim();
    this.clientToken = config.clientToken?.trim();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.clientToken) {
      headers['Client-Token'] = this.clientToken;
    }
    return headers;
  }

  private getEndpoint(path: string): string {
    return `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/${path}`;
  }

  /**
   * Verifica o status de conexão da instância Z-API
   */
  async getStatus(): Promise<ZApiStatus> {
    try {
      const res = await fetch(this.getEndpoint('status'), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        return { connected: false, error: `Erro HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return {
        connected: data.connected === true || data.smartphoneConnected === true,
        smartphoneConnected: data.smartphoneConnected
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na comunicação com Z-API';
      return { connected: false, error: errorMsg };
    }
  }

  /**
   * Obtém QR Code para escanear no WhatsApp Web
   */
  async getQrCode(): Promise<{ qrCodeBase64?: string; connected?: boolean; error?: string }> {
    try {
      const res = await fetch(this.getEndpoint('qr-code'), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        return { error: `Erro HTTP ${res.status} ao obter QR Code da Z-API` };
      }

      const data = await res.json();
      // A Z-API pode retornar `value` em base64 ou indicador de já conectado
      if (data.connected) {
        return { connected: true };
      }

      return {
        qrCodeBase64: data.value || data.qrCode || data.base64
      };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Erro ao obter QR Code' };
    }
  }

  /**
   * Lista todos os grupos de WhatsApp reais da conta
   */
  async getGroups(): Promise<{ groups: ZApiGroup[]; error?: string }> {
    try {
      // 1. Tentar endpoint de chats
      const res = await fetch(this.getEndpoint('chats'), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        return { groups: [], error: `Erro HTTP ${res.status} ao listar grupos da Z-API` };
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return { groups: [] };
      }

      // Filtrar apenas grupos (ex: termina em @g.us ou isGroup === true)
      const groups: ZApiGroup[] = data
        .filter((chat: { isGroup?: boolean; id?: string; phone?: string }) => {
          return chat.isGroup === true || (chat.phone && chat.phone.includes('@g.us')) || (chat.id && chat.id.includes('@g.us'));
        })
        .map((chat: { id?: string; phone?: string; name?: string; contactName?: string; participantCount?: number }) => ({
          id: chat.phone || chat.id || '',
          name: chat.name || chat.contactName || 'Grupo sem nome',
          isGroup: true,
          participantCount: chat.participantCount || 0
        }));

      return { groups };
    } catch (err: unknown) {
      return { groups: [], error: err instanceof Error ? err.message : 'Falha ao buscar grupos' };
    }
  }

  /**
   * Remove participante de um grupo de WhatsApp no Z-API
   */
  async removeParticipant(phone: string, groupJid: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Formatar telefone sem '+' ou caracteres não numéricos
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanGroupId = groupJid.trim();

      const res = await fetch(this.getEndpoint('remove-participant'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: cleanPhone,
          groupId: cleanGroupId
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Erro Z-API (${res.status}): ${errText}` };
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao remover aluno do grupo' };
    }
  }

  /**
   * Configura o webhook de recebimento de mensagens na Z-API
   */
  async configureWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(this.getEndpoint('update-webhook-received'), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          value: webhookUrl
        })
      });

      if (!res.ok) {
        return { success: false, error: `Falha ao registrar webhook na Z-API: HTTP ${res.status}` };
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao configurar webhook' };
    }
  }
}
