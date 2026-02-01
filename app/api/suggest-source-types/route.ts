import { NextRequest, NextResponse } from 'next/server'
import type { SourceType } from '@/lib/types'

type SegmentInput = { index: number; text: string }

/**
 * 구간 텍스트를 보고 각각 어떤 소스(일러스트/사진/실제자료)가 맞는지 + 1줄 이유를 추천합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { segments } = (await req.json()) as { segments?: SegmentInput[] }
    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'segments array required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      const types = ['illustration', 'photo', 'real'] as const
      const labels: Record<(typeof types)[number], string> = {
        illustration: '일러스트',
        photo: '사진',
        real: '실제 자료',
      }
      return NextResponse.json({
        suggestions: segments.map((s, i) => {
          const t = types[i % 3]
          return {
            index: s.index,
            sourceType: t,
            reason: `기본 분배: ${labels[t]} (OPENAI_API_KEY 설정 시 AI가 내용 기준으로 분류)`,
          }
        }),
      })
    }

    const textList = segments
      .map((s) => `[${s.index}] ${s.text.slice(0, 200).replace(/\n/g, ' ')}`)
      .join('\n')

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
            content: `당신은 영상/나레이션 자막 구간별로 "어떤 시각 소스를 쓰면 좋을지" 추천하는 도우미입니다.
각 구간에 대해 반드시 다음 세 가지 중 하나만 골라서 답하세요: illustration(일러스트), photo(사진), real(실제 자료·뉴스·기사 URL).
- illustration: 개념 설명, 비유, 감정/분위기, 캐릭터, 그래픽으로 보여주기 좋은 내용
- photo: 실제 장면, 인물, 제품, 현장, 다큐멘터리 느낌
- real: 뉴스/통계/기사 인용, 출처가 필요한 사실, 검증 가능한 자료
중요: 전부 일러스트로 두지 말고, 내용에 맞게 일러스트/사진/실제자료를 골고루 분배해주세요.
답변은 반드시 JSON 배열만 출력하세요. 다른 말 없이 배열만.
형식: [{"index": 1, "sourceType": "illustration" 또는 "photo" 또는 "real", "reason": "1줄 이유 (한국어, 짧게)"}, ...]
index는 입력에 나온 번호와 동일하게 넣으세요. reason은 20자 내외로 짧게.`,
          },
          {
            role: 'user',
            content: `다음 구간들을 분석해서 각각 sourceType과 reason을 붙여주세요.\n\n${textList}`,
          },
        ],
        max_tokens: 2000,
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
    let suggestions: { index: number; sourceType: SourceType; reason: string }[] = []
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        const validTypes: SourceType[] = ['illustration', 'photo', 'real']
        suggestions = parsed
          .filter((x: unknown) => x && typeof x === 'object' && 'index' in x && 'sourceType' in x)
          .map((x: { index?: number; sourceType?: string; reason?: string }) => ({
            index: Number(x.index),
            sourceType: validTypes.includes(x.sourceType as SourceType)
              ? (x.sourceType as SourceType)
              : 'illustration',
            reason: typeof x.reason === 'string' ? x.reason.slice(0, 120) : '',
          }))
      }
    } catch {
      suggestions = []
    }

    const filled = segments.map((s) => {
      const found = suggestions.find((u) => u.index === s.index)
      return found
        ? { index: s.index, sourceType: found.sourceType, reason: found.reason }
        : {
            index: s.index,
            sourceType: 'illustration' as SourceType,
            reason: '분류 없음',
          }
    })

    return NextResponse.json({ suggestions: filled })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
