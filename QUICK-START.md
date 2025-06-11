# 🚀 디스코드-카카오톡 연동 봇 빠른 시작 가이드

## 📱 연동 대상
**방구석 역사발표회 운영진** 카카오톡 오픈챗방  
🔗 https://open.kakao.com/o/gLsszgvg

## ⚡ 5분 만에 시작하기

### 1. 설치
```bash
# 의존성 설치
npm install

# 또는 setup.bat 실행 (Windows)
setup.bat
```

### 2. 환경 설정
`.env` 파일을 생성하고 다음 정보를 입력:

```env
# 필수 설정
DISCORD_BOT_TOKEN=여기에_디스코드_봇_토큰_입력
COMPLAINT_CHANNEL_ID=여기에_민원_채널_ID_입력

# 카카오톡 연동 (최소 1개는 설정 필요)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/
# 또는
IFTTT_WEBHOOK_KEY=your_ifttt_key
# 또는 
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
```

### 3. 봇 실행
```bash
npm start
```

### 4. 테스트
디스코드에서 다음 명령어 입력:
```
!연동테스트
```

## 🎯 주요 기능

### ✅ 자동 민원 접수
- 지정된 디스코드 채널에 메시지 작성 시 자동으로 민원으로 접수
- 고유 민원 번호 자동 생성
- 카카오톡 오픈챗방으로 즉시 알림 전송

### 📊 민원 상태 관리
```bash
!민원상태 COMPLAINT_1234567890 processing
!민원상태 COMPLAINT_1234567890 resolved
```

### 🔍 연동 테스트
```bash
!연동테스트
```

### 🌐 웹 대시보드
- http://localhost:3000 - 기본 정보
- http://localhost:3000/complaints - 민원 목록

## 📋 디스코드 봇 설정

### 1. 봇 생성
1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. "New Application" 클릭
3. Bot 탭에서 "Add Bot" 클릭
4. Token 복사 → `.env`의 `DISCORD_BOT_TOKEN`에 입력

### 2. 봇 권한 설정
OAuth2 > URL Generator에서 다음 권한 선택:
- ✅ `bot`
- ✅ `Send Messages`
- ✅ `Read Message History`
- ✅ `Add Reactions`
- ✅ `Embed Links`
- ✅ `Mention Everyone`

### 3. 채널 ID 확인
1. 디스코드에서 개발자 모드 활성화
2. 민원 접수용 채널 우클릭 → "Copy ID"
3. `.env`의 `COMPLAINT_CHANNEL_ID`에 입력

## 🔗 카카오톡 연동 설정

### 방법 1: Zapier (권장)
1. [Zapier](https://zapier.com/) 가입
2. "Create Zap" → "Webhooks by Zapier" → "Catch Hook"
3. 생성된 URL을 `.env`의 `ZAPIER_WEBHOOK_URL`에 입력
4. Action을 "Email" 또는 "SMS"로 설정

### 방법 2: IFTTT
1. [IFTTT](https://ifttt.com/) 가입
2. "Create" → "Webhooks" → Event: `discord_complaint`
3. Key를 `.env`의 `IFTTT_WEBHOOK_KEY`에 입력

### 방법 3: 이메일 알림
1. Gmail 2단계 인증 활성화
2. [앱 비밀번호 생성](https://support.google.com/accounts/answer/185833)
3. `.env`에 이메일 설정 입력

## 🎉 완료!

설정이 완료되면:
1. `npm start`로 봇 실행
2. 디스코드에서 `!연동테스트` 명령어로 테스트
3. 민원 채널에 메시지 작성해보기
4. 카카오톡/이메일로 알림 확인

## ❓ 문제 해결

### 봇이 응답하지 않는 경우
- 봇 토큰 확인
- 채널 ID 확인
- 봇 권한 확인

### 카카오톡 알림이 오지 않는 경우
- 웹훅 URL 확인
- 네트워크 연결 확인
- 이메일 대안 알림 설정

### 추가 도움이 필요한 경우
- `kakao-setup-guide.md` 파일 참조
- GitHub Issues에 문의

---
**🎯 목표**: 디스코드 민원 → 카카오톡 오픈챗 즉시 알림으로 신속한 고객 서비스! 