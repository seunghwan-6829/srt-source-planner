/** 소스 타입: 분류 없음 / 일러스트 / 사진 / 실제 자료 */
export type SourceType = 'none' | 'illustration' | 'photo' | 'real'

/** SRT 한 구간 + 사용자 선택 */
export interface SrtSegment {
  index: number
  startMs: number
  endMs: number
  startTimecode: string
  endTimecode: string
  text: string
  sourceType: SourceType
  mood: string
  realRefUrls: { url: string; title?: string }[]
  suggestedReason?: string
  /** Nano Banana Pro 등으로 생성한 이미지 URL */
  generatedImageUrl?: string
}

export interface ParsedSrt {
  segments: SrtSegment[]
  raw: string
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  none: '분류 없음',
  illustration: '일러스트',
  photo: '사진',
  real: '실제 자료 (URL)',
}

export const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  none: '#737373',
  illustration: '#2563eb',
  photo: '#16a34a',
  real: '#ea580c',
}
