import { NextRequest, NextResponse } from 'next/server'

/**
 * 나레이션 텍스트에 맞는 뉴스·기사 URL을 AI로 추천합니다.
 * OPENAI_API_KEY가 있으면 GPT 호출, 없으면 목업 반환.
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string }
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        urls: [
          { url: 'https://example.com/related-1', title: '관련 기사 1 (목업)' },
          { url: 'https://example.com/related-2', title: '관련 기사 2 (목업)' },
        ],
      })
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 주어진 문장/나레이션과 관련된 뉴스·기사 URL을 추천하는 도우미입니다.
실제로 검색 가능한 한국어 뉴스/위키/공식 사이트 URL 2~3개를 JSON 배열로만 답하세요.
형식: [{"url": "https://...", "title": "기사 제목"}, ...]
URL만 있고 title이 없어도 됩니다. 모르면 빈 배열 []을 반환하세요.`,
          },
          {
            role: 'user',
            content: text.slice(0, 1000),
          },
        ],
        max_tokens: 500,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error('OpenAI error:', err)
      return NextResponse.json(
        { error: 'AI 요청 실패', detail: err },
        { status: 502 }
      )
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content?.trim() || '[]'
    let urls: { url: string; title?: string }[] = []
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        urls = parsed
          .filter((x: unknown) => x && typeof x === 'object' && 'url' in x)
          .map((x: { url?: string; title?: string }) => ({
            url: String(x.url || '').slice(0, 500),
            title: x.title ? String(x.title).slice(0, 200) : undefined,
          }))
          .filter((x) => x.url.startsWith('http'))
      }
    } catch {
      urls = []
    }

    return NextResponse.json({ urls })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}
