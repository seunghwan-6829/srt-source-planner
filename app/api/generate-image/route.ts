import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

/**
 * Nano Banana Pro (FAL.AI)로 텍스트 → 이미지 생성.
 * FAL_KEY 환경 변수 필요.
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.FAL_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FAL_KEY not set. Set it in Vercel env or .env.local' },
        { status: 500 }
      )
    }

    fal.config({ credentials: apiKey })

    const body = (await req.json()) as {
      prompt?: string
      sourceType?: 'illustration' | 'photo'
      aspect_ratio?: string
      resolution?: string
    }
    const rawPrompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (!rawPrompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 })
    }

    const sourceType = body.sourceType || 'illustration'
    const stylePrefix =
      sourceType === 'illustration'
        ? 'Professional illustration style, digital art, clean artistic drawing, not a photo. Scene: '
        : 'Photorealistic, real photograph, high quality realistic photo, lifelike, not illustration. Scene: '
    const prompt = stylePrefix + rawPrompt.slice(0, 900)

    const aspectRatio = body.aspect_ratio || '16:9'
    const resolution = body.resolution || '1K'

    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt,
        num_images: 1,
        aspect_ratio: aspectRatio as '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '21:9' | '5:4' | '4:5',
        resolution: resolution as '1K' | '2K' | '4K',
        output_format: 'png',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS' && update.logs?.length) {
          update.logs.forEach((log) => console.log('[FAL]', log.message))
        }
      },
    })

    const data = result.data as { images?: { url?: string }[] }
    const url = data?.images?.[0]?.url
    if (!url) {
      return NextResponse.json(
        { error: 'No image URL in response', data },
        { status: 502 }
      )
    }

    return NextResponse.json({ url, images: data.images })
  } catch (e) {
    console.error('FAL generate-image error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generate image failed' },
      { status: 500 }
    )
  }
}
