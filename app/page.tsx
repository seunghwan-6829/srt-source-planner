'use client'

import { useCallback, useState } from 'react'
import { parseSrt, timecodeToNumbering } from '@/lib/srt'
import type { SrtSegment, SourceType } from '@/lib/types'
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_COLORS,
  ILLUSTRATION_MOODS,
  PHOTO_MOODS,
} from '@/lib/types'
import { Upload, Download, FileText, Image, Link2, Sparkles, Wand2 } from 'lucide-react'
import JSZip from 'jszip'

const HIGHLIGHT_CLASS: Record<SourceType, string> = {
  illustration: 'highlight-illustration',
  photo: 'highlight-photo',
  real: 'highlight-real',
}

export default function Home() {
  const [segments, setSegments] = useState<SrtSegment[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [classifying, setClassifying] = useState(false)

  const runSuggestSourceTypes = useCallback(async () => {
    if (segments.length === 0) return
    setClassifying(true)
    try {
      const res = await fetch('/api/suggest-source-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: segments.map((s) => ({ index: s.index, text: s.text })),
        }),
      })
      if (!res.ok) return
      const { suggestions } = await res.json()
      if (!Array.isArray(suggestions)) return
      const moodByType: Record<SourceType, string> = {
        illustration: '플랫 일러스트',
        photo: '다큐멘터리',
        real: '',
      }
      setSegments((prev) =>
        prev.map((s) => {
          const u = suggestions.find((x: { index: number }) => x.index === s.index)
          if (!u) return s
          const st = u.sourceType as SourceType
          return {
            ...s,
            sourceType: st,
            mood: moodByType[st] || s.mood,
            suggestedReason: u.reason || '',
          }
        })
      )
    } finally {
      setClassifying(false)
    }
  }, [segments])

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setFileName(file.name.replace(/\.srt$/i, ''))
      const reader = new FileReader()
      reader.onload = () => {
        const raw = String(reader.result)
        const parsed = parseSrt(raw, 'illustration')
        setSegments(parsed)
      }
      reader.readAsText(file, 'utf-8')
    },
    []
  )

  const updateSegment = useCallback((index: number, patch: Partial<SrtSegment>) => {
    setSegments((prev) =>
      prev.map((s) => (s.index === index ? { ...s, ...patch } : s))
    )
  }, [])

  const suggestRealRef = useCallback(async (seg: SrtSegment) => {
    try {
      const res = await fetch('/api/suggest-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: seg.text }),
      })
      if (!res.ok) return
      const { urls } = await res.json()
      updateSegment(seg.index, { realRefUrls: urls || [] })
    } catch {
      // mock
      updateSegment(seg.index, {
        realRefUrls: [
          { url: 'https://example.com/news/1', title: '관련 기사 1' },
          { url: 'https://example.com/news/2', title: '관련 기사 2' },
        ],
      })
    }
  }, [updateSegment])

  const exportZip = useCallback(async () => {
    const zip = new JSZip()
    const manifest: string[] = ['index,startTimecode,endTimecode,sourceType,mood,text,urls']

    for (const seg of segments) {
      const numbering = timecodeToNumbering(seg.startMs, seg.endMs)
      const folder = zip.folder(numbering)
      if (!folder) continue

      folder.file('text.txt', seg.text)
      folder.file('meta.json', JSON.stringify({
        index: seg.index,
        startTimecode: seg.startTimecode,
        endTimecode: seg.endTimecode,
        sourceType: seg.sourceType,
        mood: seg.mood,
        suggestedReason: seg.suggestedReason,
        realRefUrls: seg.realRefUrls,
      }, null, 2))

      if (seg.realRefUrls.length) {
        const links = seg.realRefUrls
          .map((u) => (u.title ? `${u.title}\n${u.url}` : u.url))
          .join('\n\n')
        folder.file('urls.txt', links)
      }

      manifest.push([
        seg.index,
        seg.startTimecode,
        seg.endTimecode,
        seg.sourceType,
        seg.mood,
        `"${seg.text.replace(/"/g, '""')}"`,
        seg.realRefUrls.map((u) => u.url).join('; '),
      ].join(','))
    }

    zip.file('manifest.csv', manifest.join('\n'))
    zip.file('full.srt', segments.map((s) =>
      `${s.index}\n${s.startTimecode} --> ${s.endTimecode}\n${s.text}\n\n`
    ).join(''))

    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${fileName || 'srt-source'}_export.zip`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [segments, fileName])

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">SRT 소스 플래너</h1>
        <p className="text-neutral-500 mt-1">
          SRT를 올리면 구간별로 일러스트/사진/실제자료를 정리하고, 시간대 넘버링 ZIP으로 내보냅니다.
        </p>
      </header>

      {/* 업로드 */}
      <section className="mb-8 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg cursor-pointer hover:bg-neutral-700 text-sm font-medium">
            <Upload className="w-4 h-4" />
            SRT 파일 선택
            <input
              type="file"
              accept=".srt"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {fileName && (
            <span className="text-sm text-neutral-500">파일: {fileName}.srt</span>
          )}
        </div>
      </section>

      {/* 구간 목록 + 색상 밑줄 + 편집 */}
      {segments.length > 0 && (
        <>
          <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-700">
              구간별 소스 지정 (형광펜 색으로 타입 표시)
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runSuggestSourceTypes}
                disabled={classifying}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm font-medium"
              >
                <Wand2 className="w-4 h-4" />
                {classifying ? '분류 중…' : '1차 자동 분류'}
              </button>
              <button
                type="button"
                onClick={exportZip}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                ZIP으로 내보내기
              </button>
            </div>
          </section>

          <ul className="space-y-4">
            {segments.map((seg) => (
              <li
                key={seg.index}
                className="p-4 rounded-xl bg-white border border-neutral-200 border-[1px] shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-neutral-400">
                    #{seg.index} · {seg.startTimecode} → {seg.endTimecode}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: SOURCE_TYPE_COLORS[seg.sourceType] + '20',
                      color: SOURCE_TYPE_COLORS[seg.sourceType],
                    }}
                  >
                    {SOURCE_TYPE_LABELS[seg.sourceType]}
                  </span>
                </div>

                <div className={`rounded-lg border border-neutral-200 overflow-hidden border-[1px] ${HIGHLIGHT_CLASS[seg.sourceType]}`}>
                  <textarea
                    value={seg.text}
                    onChange={(e) => updateSegment(seg.index, { text: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm resize-y bg-transparent border-0 focus:ring-0 focus:outline-none"
                    placeholder="나레이션 텍스트"
                  />
                </div>
                <p className="mt-1.5 mb-2 text-xs text-neutral-500 italic">
                  추천 이유: {seg.suggestedReason || '(1차 자동 분류를 실행하면, 이 구간을 일러스트/사진/실제자료 중 어떤 것으로 골랐는지와 이유가 표시됩니다.)'}
                </p>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">소스 타입</span>
                    <select
                      value={seg.sourceType}
                      onChange={(e) =>
                        updateSegment(seg.index, {
                          sourceType: e.target.value as SourceType,
                          mood:
                            e.target.value === 'illustration'
                              ? '플랫 일러스트'
                              : e.target.value === 'photo'
                                ? '다큐멘터리'
                                : '',
                        })
                      }
                      className="rounded border border-neutral-200 border-[1px] px-2 py-1 text-sm outline-none focus:ring-0"
                    >
                      <option value="illustration">{SOURCE_TYPE_LABELS.illustration}</option>
                      <option value="photo">{SOURCE_TYPE_LABELS.photo}</option>
                      <option value="real">{SOURCE_TYPE_LABELS.real}</option>
                    </select>
                  </div>

                  {seg.sourceType === 'illustration' && (
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-neutral-400" />
                      <select
                        value={seg.mood}
                        onChange={(e) => updateSegment(seg.index, { mood: e.target.value })}
                        className="rounded border border-neutral-200 border-[1px] px-2 py-1 text-sm outline-none focus:ring-0"
                      >
                        {ILLUSTRATION_MOODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {seg.sourceType === 'photo' && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <select
                        value={seg.mood}
                        onChange={(e) => updateSegment(seg.index, { mood: e.target.value })}
                        className="rounded border border-neutral-200 border-[1px] px-2 py-1 text-sm outline-none focus:ring-0"
                      >
                        {PHOTO_MOODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {seg.sourceType === 'real' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => suggestRealRef(seg)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 text-amber-800 text-sm hover:bg-amber-200"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        URL 추천 (AI)
                      </button>
                      <Link2 className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>

                {seg.sourceType === 'real' && seg.realRefUrls.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {seg.realRefUrls.map((ref, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 hover:underline truncate max-w-md"
                        >
                          {ref.title || ref.url}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            updateSegment(seg.index, {
                              realRefUrls: seg.realRefUrls.filter((_, j) => j !== i),
                            })
                          }
                          className="text-neutral-400 hover:text-red-500 text-xs"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {segments.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>SRT 파일을 선택하면 구간별로 정리·편집할 수 있습니다.</p>
        </div>
      )}
    </div>
  )
}
