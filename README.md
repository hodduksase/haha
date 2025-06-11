# 디스코드 민원방 ↔ 카카오톡 오픈챗 연동 봇

디스코드 민원 채널에 올라오는 민원을 자동으로 카카오톡 오픈챗방으로 알림을 보내주는 봇입니다.

## 🌟 주요 기능

- ✅ **자동 민원 감지**: 지정된 디스코드 채널의 메시지를 자동으로 민원으로 인식
- 📱 **카카오톡 알림**: 새로운 민원이 접수되면 카카오톡 오픈챗방으로 즉시 알림 전송
- 📊 **상태 관리**: 민원 처리 상태 추적 (대기, 처리중, 완료, 종료)
- 🔔 **관리자 멘션**: 새로운 민원 접수 시 관리자 역할에게 자동 멘션
- 🌐 **웹 API**: RESTful API를 통한 민원 조회 및 관리
- 📋 **민원 번호**: 고유한 민원 번호 자동 생성

## 📋 요구사항

- Node.js 16.0.0 이상
- 디스코드 봇 토큰
- 카카오톡 웹훅 URL (별도 설정 필요)

## 🚀 설치 및 설정

### 1. 프로젝트 다운로드 및 의존성 설치

```bash
# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 참고하여 `.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# 디스코드 봇 토큰 (Discord Developer Portal에서 발급)
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# 디스코드 민원 채널 ID
COMPLAINT_CHANNEL_ID=your_complaint_channel_id

# 카카오톡 오픈챗방 웹훅 URL
KAKAO_WEBHOOK_URL=your_kakao_webhook_url

# 서버 포트 (기본값: 3000)
PORT=3000

# 민원 알림을 받을 디스코드 관리자 역할 ID (선택사항)
ADMIN_ROLE_ID=your_admin_role_id
```

### 3. 디스코드 봇 설정

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 새 애플리케이션 생성
2. Bot 탭에서 봇 생성 및 토큰 복사
3. OAuth2 > URL Generator에서 다음 권한 선택:
   - `bot`
   - `Send Messages`
   - `Read Message History`
   - `Add Reactions`
   - `Embed Links`
   - `Mention Everyone`

### 4. 카카오톡 웹훅 설정

카카오톡 오픈챗에는 직접적인 API가 없으므로 다음 방법 중 하나를 사용하세요:

#### 방법 1: Webhook.site 사용 (테스트용)
1. [Webhook.site](https://webhook.site/) 접속
2. 생성된 URL을 `KAKAO_WEBHOOK_URL`에 입력
3. 테스트용으로만 사용 가능 (실제 카카오톡 전송 불가)

#### 방법 2: Zapier 사용 (권장)
1. [Zapier](https://zapier.com/) 계정 생성
2. "Webhook by Zapier" → "카카오톡" 또는 "이메일" 연결
3. Webhook URL을 `KAKAO_WEBHOOK_URL`에 입력

#### 방법 3: 대안 플랫폼 사용
- **텔레그램**: Telegram Bot API 사용
- **슬랙**: Slack Webhook 사용
- **이메일**: SMTP를 통한 이메일 알림

### 5. 봇 실행

```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

## 📱 사용 방법

### 민원 접수
1. 설정된 디스코드 채널에 메시지 작성
2. 봇이 자동으로 민원으로 인식하고 접수 완료 메시지 전송
3. 카카오톡으로 알림 전송

### 민원 상태 관리
디스코드에서 다음 명령어 사용:

```
!민원상태 [민원번호] [상태]
```

**사용 가능한 상태:**
- `pending`: 처리 대기
- `processing`: 처리 중
- `resolved`: 해결 완료
- `closed`: 종료

**예시:**
```
!민원상태 COMPLAINT_1701234567890 processing
```

## 🌐 웹 API

봇 실행 시 웹서버도 함께 실행되어 다음 API를 제공합니다:

### 기본 정보 조회
```
GET /
```

### 전체 민원 목록 조회
```
GET /complaints
```

### 특정 민원 조회
```
GET /complaints/:id
```

## 🛠️ 주요 파일 구조

```
discord-kakao-integration/
├── src/
│   ├── index.js          # 메인 봇 파일
│   └── kakaoService.js   # 카카오톡 연동 서비스
├── package.json          # 프로젝트 설정
├── env.example          # 환경 변수 예시
└── README.md            # 프로젝트 설명
```

## 🔧 고급 설정

### 민원 채널 다중 설정
여러 채널에서 민원을 받으려면 `index.js`에서 채널 ID 배열로 수정:

```javascript
const COMPLAINT_CHANNELS = [
    'channel_id_1',
    'channel_id_2',
    'channel_id_3'
];

// 메시지 감지 부분 수정
if (!COMPLAINT_CHANNELS.includes(message.channel.id)) return;
```

### 카카오톡 메시지 포맷 커스터마이징
`kakaoService.js`의 `formatComplaintMessage` 함수에서 메시지 형식 수정 가능

### 데이터베이스 연동
현재는 메모리에 민원 정보를 저장하므로, 영구 저장을 위해 데이터베이스 연동 권장:
- MongoDB
- PostgreSQL
- SQLite

## ⚠️ 주의사항

1. **카카오톡 제한**: 카카오톡은 공식 API가 제한적이므로 웹훅 서비스 필요
2. **봇 권한**: 디스코드 봇에 필요한 권한이 모두 부여되었는지 확인
3. **토큰 보안**: `.env` 파일은 절대 공개 저장소에 업로드하지 마세요
4. **서버 안정성**: 프로덕션 환경에서는 PM2 등을 사용한 프로세스 관리 권장

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요. 