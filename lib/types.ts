/** 소스 타입: 일러스트 / 사진 / 실제 자료(뉴스·기사 URL) */
export type SourceType = 'illustration' | 'photo' | 'real'

/** SRT 한 구간 + 사용자 선택 */
export interface SrtSegment {
  index: number
  startMs: number
  endMs: number
  startTimecode: string  // 00:00:01,000
  endTimecode: string
  text: string
  sourceType: SourceType
  mood: string
  realRefUrls: { url: string; title?: string }[]
  /** 1차 자동 분류 시 AI가 넣어준 1줄 이유 */
  suggestedReason?: string
}

/** SRT 파싱 결과 */
export interface ParsedSrt {
  segments: SrtSegment[]
  raw: string
}

export const ILLUSTRATION_MOODS = [
  '플랫 일러스트',
  '3D 렌더',
  '수채화',
  '라인 아트',
  '미니멀',
  '에디토리얼',
  '컨셉 아트',
  '아이소메트릭',
] as const

export const PHOTO_MOODS = [
  '다큐멘터리',
  '스튜디오',
  '자연광',
  '고감도/그레인',
  '클로즈업',
  '와이드',
  '흑백',
  '시네마틱',
] as const

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  illustration: '일러스트',
  photo: '사진',
  real: '실제 자료 (URL)',
}

export const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  illustration: '#2563eb',
  photo: '#16a34a',
  real: '#ea580c',
}
