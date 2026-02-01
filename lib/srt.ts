import type { SrtSegment, SourceType } from './types'

/** ms → SRT 타임코드 (00:00:01,000) */
function msToTimecode(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const f = ms % 1000
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
    ',' + String(f).padStart(3, '0'),
  ].join(':')
}

/** SRT 타임코드 → ms */
function timecodeToMs(tc: string): number {
  const [time, ms] = tc.replace(',', '.').split('.')
  const [h, m, s] = time.split(':').map(Number)
  return (h * 3600 + m * 60 + s) * 1000 + Number(ms || 0)
}

const SRT_BLOCK = /(\d+)\s*\n(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*\n([\s\S]*?)(?=\n\n\d+\s*\n|$)/g

/**
 * SRT 문자열을 파싱해 구간 배열로 반환.
 * 각 구간에 기본 sourceType·mood를 넣어서 편집 가능하게 함.
 */
export function parseSrt(raw: string, defaultType: SourceType = 'none'): SrtSegment[] {
  const segments: SrtSegment[] = []
  let m: RegExpExecArray | null
  SRT_BLOCK.lastIndex = 0
  const normalized = raw.replace(/\r\n/g, '\n').trim()

  while ((m = SRT_BLOCK.exec(normalized)) !== null) {
    const index = Number(m[1])
    const startTc = m[2].replace('.', ',')
    const endTc = m[3].replace('.', ',')
    const text = m[4].replace(/\n/g, ' ').trim()
    const startMs = timecodeToMs(m[2])
    const endMs = timecodeToMs(m[3])

    segments.push({
      index,
      startMs,
      endMs,
      startTimecode: startTc,
      endTimecode: endTc,
      text,
      sourceType: defaultType,
      mood: '',
      realRefUrls: [],
    })
  }

  return segments
}

/** SRT 한 구간을 SRT 형식 한 블록 문자열로 (내보내기용) */
export function segmentToSrtBlock(seg: SrtSegment): string {
  return `${seg.index}\n${seg.startTimecode} --> ${seg.endTimecode}\n${seg.text}\n\n`
}

/** 시간(ms) 기반 넘버링용 폴더/파일명 (00_00_01_000 형식) */
export function timecodeToNumbering(startMs: number, endMs: number): string {
  const s = Math.floor(startMs / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const ms = startMs % 1000
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(sec).padStart(2, '0'),
    String(ms).padStart(3, '0'),
  ].join('_')
}
