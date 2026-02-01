# GitHub 연결 방법

로컬에서 이미 **git 초기화 + 첫 커밋**까지 완료된 상태입니다.  
아래 순서대로 하면 GitHub에 올릴 수 있습니다.

---

## 1. GitHub에서 새 저장소 만들기

1. 브라우저에서 **https://github.com/new** 접속
2. **Repository name**에 `srt-source-planner` 입력 (또는 원하는 이름)
3. **Public** 선택
4. **"Add a README file"**, **".gitignore"**, **"license"** 는 **체크하지 말고** 그대로 둠
5. **Create repository** 클릭

---

## 2. 원격 주소 바꾸기 + 푸시

GitHub에서 만든 저장소 주소가  
`https://github.com/본인아이디/srt-source-planner` 라면,  
**본인아이디** 부분만 아래에서 바꿔서 터미널에서 실행하세요.

```powershell
cd C:\Users\user\srt-source-planner

# 원격 주소를 본인 GitHub 저장소로 변경 (본인아이디 부분만 수정)
git remote set-url origin https://github.com/본인아이디/srt-source-planner.git

# GitHub에 푸시
git push -u origin main
```

- **본인아이디**를 실제 GitHub 사용자명으로 바꾸면 됩니다.
- 푸시 시 GitHub 로그인(또는 토큰) 창이 뜨면 로그인하면 됩니다.

---

## 3. (선택) SSH로 쓰고 싶다면

GitHub에서 SSH 키를 등록했다면:

```powershell
git remote set-url origin git@github.com:본인아이디/srt-source-planner.git
git push -u origin main
```

---

연결이 끝나면 **Vercel**에서 **Import Project** → 이 GitHub 저장소 선택해서 배포하면 됩니다.
