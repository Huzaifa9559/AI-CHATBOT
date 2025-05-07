import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer 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`,
        'HTTP-Referer': 'http://localhost:3000', // required for free tier
        'X-Title': 'NextJS Chat'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages,
      }),
      
    });

    const data = await response.json();
    console.log('Full OpenRouter response:', JSON.stringify(data, null, 2)); // 🔍 inspect structure

    const message = data?.choices?.[0]?.message;
    const reply = typeof message === 'string' ? message : message?.content;

    if (!reply) {
      return NextResponse.json({ reply: '⚠️ No reply from model. Please try again later.' });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return NextResponse.json({ reply: '⚠️ Failed to connect to OpenRouter.' }, { status: 500 });
  }
}