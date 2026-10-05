import { NextRequest, NextResponse } from 'next/server';
import { processKiwifyWebhook } from '@/lib/kiwify/webhook-handler';
import { KiwifyWebhookEvent } from '@/types/sentinela';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as KiwifyWebhookEvent;

    if (!body || !body.event) {
      return NextResponse.json(
        { error: 'Payload inválido: evento obrigatório' },
        { status: 400 }
      );
    }

    const result = await processKiwifyWebhook(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Sentinela Kiwify Webhook Listener',
    status: 'online',
    version: '1.0.0',
    supportedEvents: [
      'order_approved',
      'refund_requested',
      'refund_approved',
      'subscription_cancelled'
    ]
  });
}
