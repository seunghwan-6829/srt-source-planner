# SRT 소스 플래너

SRT 파일을 업로드하면 구간별로 **일러스트 / 사진 / 실제 자료(URL)** 를 지정하고,  
타입별 색상 밑줄로 한눈에 보면서 편집할 수 있습니다.  
내보내기 시 **SRT 시간대 기준 넘버링**으로 ZIP을 생성합니다.

## 기능

- SRT 파싱 → 구간별 한 줄 정리
- 소스 타입 선택 (색상·밑줄로 표시)
  - **일러스트** (여러 무드: 플랫, 3D, 수채화 등)
  - **사진** (여러 무드: 다큐, 스튜디오, 시네마틱 등)
  - **실제 자료** → AI가 뉴스·기사 URL 추천 (선택 사항)
- 구간별 텍스트·타입·무드 편집
- ZIP 내보내기: 시간대 넘버링 폴더 + manifest.csv + full.srt

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 환경 변수 (선택)

- `OPENAI_API_KEY`: 실제 자료 URL 추천 시 GPT 사용. 없으면 목업 URL 반환.

`.env.local` 예시:

```
OPENAI_API_KEY=sk-...
```

## GitHub → Vercel 배포

1. 이 프로젝트를 GitHub 저장소로 푸시합니다.

   ```bash
   git init
   git add .
   git commit -m "Initial: SRT 소스 플래너"
   git remote add origin https://github.com/YOUR_USERNAME/srt-source-planner.git
   git push -u origin main
   ```

2. [Vercel](https://vercel.com) 로그인 후 **Import Project**에서 해당 GitHub 저장소 선택.
3. Framework Preset: **Next.js** 그대로 두고 Deploy.
4. (선택) Vercel 대시보드 → Project → Settings → Environment Variables 에서 `OPENAI_API_KEY` 추가.

배포 후 제공되는 URL에서 바로 사용할 수 있습니다.

## ZIP 출력 구조 예시

```
export.zip
├── manifest.csv          # 전체 구간 요약 (index, timecode, type, mood, text, urls)
├── full.srt              # 전체 SRT
├── 00_00_01_000/
│   ├── text.txt          # 해당 구간 나레이션 텍스트
│   ├── meta.json         # index, timecode, sourceType, mood, realRefUrls
│   └── urls.txt          # 실제 자료일 때만 (URL 목록)
├── 00_00_05_120/
│   └── ...
└── ...
```

## 라이선스

MIT
