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

- `OPENAI_API_KEY`: 실제 자료 URL 추천 시 GPT 사용. 없으면 기본 분배만 적용.
- `FAL_KEY`: [FAL.AI](https://fal.ai) API 키. **일러스트** 구간에서 **이미지 생성 (Nano Banana Pro)** 사용 시 필요.

`.env.local` 예시:

```
OPENAI_API_KEY=sk-...
FAL_KEY=your-fal-api-key
```

## GitHub → Vercel 배포

1. **GitHub 연결**: 로컬에서 이미 `git init` 및 첫 커밋까지 완료되어 있습니다.  
   → 자세한 단계는 **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** 를 보세요.  
   (GitHub에서 새 저장소 만든 뒤 `git remote set-url` + `git push -u origin main` 하면 됩니다.)

2. [Vercel](https://vercel.com) 로그인 후 **Import Project**에서 해당 GitHub 저장소 선택.
3. Framework Preset: **Next.js** 그대로 두고 Deploy.
4. (선택) Vercel 대시보드 → Project → Settings → Environment Variables 에서 `OPENAI_API_KEY` 추가.

배포 후 제공되는 URL에서 바로 사용할 수 있습니다.

### 한 번에 배포하기

변경사항을 커밋하고 GitHub에 푸시해 Vercel이 자동 배포하도록 하려면, 프로젝트 폴더에서 아래만 실행하면 됩니다.

```powershell
cd C:\Users\user\srt-source-planner
.\deploy.ps1
```

- 변경된 파일이 있으면 자동으로 `git add` → `git commit` → `git push origin main` 실행
- 변경 없으면 푸시만 시도
- 푸시 성공 시 Vercel에서 자동 배포

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
