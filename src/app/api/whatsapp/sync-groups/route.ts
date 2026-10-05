import { NextRequest, NextResponse } from 'next/server';
import { ZApiService } from '@/lib/whatsapp/zapi-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instanceId, token, clientToken, baseUrl } = body;

    if (!instanceId || !token) {
      return NextResponse.json(
        { error: 'Parâmetros "instanceId" e "token" da Z-API são obrigatórios.' },
        { status: 400 }
      );
    }

    const zapi = new ZApiService({ instanceId, token, clientToken, baseUrl });
    const result = await zapi.getGroups();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      count: result.groups.length,
      groups: result.groups
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno ao sincronizar grupos da Z-API' },
      { status: 500 }
    );
  }
}
