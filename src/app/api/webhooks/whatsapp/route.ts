import { NextRequest, NextResponse } from 'next/server';
import { analyzeGroupMessage } from '@/lib/ai/sentiment-analyzer';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Extrair campos da Z-API (on-message-received)
    const isGroup = payload.isGroup === true || (payload.chatId && payload.chatId.includes('@g.us')) || (payload.phone && payload.phone.includes('@g.us'));
    
    // Ignorar mensagens que não são de grupos
    if (!isGroup) {
      return NextResponse.json({ status: 'ignored', reason: 'not_a_group_message' });
    }

    // Ignorar mensagens enviadas pelo próprio bot
    if (payload.fromMe === true) {
      return NextResponse.json({ status: 'ignored', reason: 'message_from_bot' });
    }

    const messageText = payload.text?.message || payload.text || payload.message || payload.body || '';
    const senderPhone = payload.participantPhone || payload.phone || payload.senderPhone || 'Desconhecido';
    const senderName = payload.senderName || payload.contactName || 'Aluno(a)';
    const groupJid = payload.chatId || payload.groupId || payload.phone || '';

    if (!messageText || messageText.trim() === '') {
      return NextResponse.json({ status: 'ignored', reason: 'empty_text' });
    }

    // 2. Analisar mensagem com o motor de IA
    const analysis = await analyzeGroupMessage({
      text: messageText,
      studentName: senderName,
      groupName: groupJid,
      openaiKey: process.env.OPENAI_API_KEY,
      geminiKey: process.env.GEMINI_API_KEY
    });

    // 3. Se houver conexão com Supabase, gravar registro e gerar alerta
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Salvar mensagem no histórico do grupo
        await supabase.from('group_messages').insert({
          group_id: groupJid,
          sender_phone: senderPhone,
          sender_name: senderName,
          message_text: messageText,
          sentiment: analysis.sentiment,
          is_alert: analysis.shouldAlert,
          raw_payload: payload
        });

        // Se for alerta crítico ou moderado, criar Alerta no Sentinela
        if (analysis.shouldAlert) {
          const alertId = `alt-${Date.now().toString().slice(-6)}`;
          await supabase.from('alerts').insert({
            id: alertId,
            student_name: senderName,
            student_phone: senderPhone,
            group_id: groupJid,
            group_name: groupJid,
            severity: analysis.severity,
            category: analysis.category,
            status: 'open',
            message_snippet: messageText,
            ai_analysis: `${analysis.summary} | Ação: ${analysis.recommendedAction}`,
            created_at: new Date().toISOString()
          });
        }
      } catch (dbErr) {
        console.error('[Sentinela WhatsApp Webhook] Erro ao salvar no banco:', dbErr);
      }
    }

    return NextResponse.json({
      status: 'processed',
      analysis: {
        sentiment: analysis.sentiment,
        category: analysis.category,
        severity: analysis.severity,
        shouldAlert: analysis.shouldAlert
      }
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao processar webhook de WhatsApp' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Sentinela WhatsApp Webhook Listener (Z-API)',
    status: 'online',
    version: '1.0.0'
  });
}
