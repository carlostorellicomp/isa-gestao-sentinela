import { NextRequest, NextResponse } from 'next/server';
import { analyzeGroupMessage } from '@/lib/ai/sentiment-analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, studentName, groupName, openaiKey, geminiKey, activeModel } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto da mensagem é obrigatório.' }, { status: 400 });
    }

    const result = await analyzeGroupMessage({
      text,
      studentName,
      groupName,
      openaiKey,
      geminiKey,
      activeModel
    });

    return NextResponse.json({
      success: true,
      analysis: result
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao processar análise de IA' },
      { status: 500 }
    );
  }
}
