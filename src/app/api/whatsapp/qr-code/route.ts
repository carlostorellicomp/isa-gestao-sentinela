import { NextRequest, NextResponse } from 'next/server';
import { ZApiService } from '@/lib/whatsapp/zapi-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instanceId, token, clientToken, baseUrl } = body;

    if (!instanceId || !token) {
      return NextResponse.json(
        { error: 'instanceId e token são necessários para gerar QR Code na Z-API.' },
        { status: 400 }
      );
    }

    const zapi = new ZApiService({ instanceId, token, clientToken, baseUrl });
    const qrResult = await zapi.getQrCode();

    if (qrResult.error) {
      return NextResponse.json({ error: qrResult.error }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      connected: qrResult.connected || false,
      qrCodeBase64: qrResult.qrCodeBase64
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha na requisição de QR Code' },
      { status: 500 }
    );
  }
}
