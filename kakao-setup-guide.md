# 카카오톡 오픈챗 연동 설정 가이드

## 🎯 대상 오픈챗방
**방구석 역사발표회 운영진**  
링크: https://open.kakao.com/o/gLsszgvg

## 📱 카카오톡 오픈챗 연동 방법

카카오톡 오픈챗은 공식 API가 제한적이므로, 다음 중 한 가지 방법을 선택하여 연동하세요.

### 방법 1: Zapier 사용 (권장) ⭐

1. **Zapier 계정 생성**
   - [Zapier](https://zapier.com/) 접속하여 계정 생성
   - 무료 플랜으로도 월 100개 Zap 사용 가능

2. **새 Zap 생성**
   - "Create Zap" 버튼 클릭
   - Trigger: "Webhooks by Zapier" 선택
   - Event: "Catch Hook" 선택
   - Continue 클릭하면 Webhook URL 생성됨

3. **Action 설정**
   - Action: "Email by Zapier" 또는 "SMS by Zapier" 선택
   - 또는 "Slack"을 선택하여 슬랙으로 알림 전송

4. **환경 변수 설정**
   ```env
   ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/
   ```

### 방법 2: IFTTT 사용

1. **IFTTT 계정 생성**
   - [IFTTT](https://ifttt.com/) 접속하여 계정 생성

2. **새 Applet 생성**
   - "Create" 버튼 클릭
   - If This: "Webhooks" 선택
   - Event Name: `discord_complaint` 입력

3. **Then That 설정**
   - "Notifications" 선택하여 모바일 알림
   - 또는 "Email" 선택하여 이메일 알림

4. **Webhook Key 확인**
   - Webhooks 서비스 설정에서 Key 확인

5. **환경 변수 설정**
   ```env
   IFTTT_WEBHOOK_KEY=your_ifttt_webhook_key
   ```

### 방법 3: 이메일 알림 (대안)

카카오톡 직접 연동이 어려운 경우 이메일로 알림을 받을 수 있습니다.

1. **Gmail 앱 비밀번호 생성**
   - Gmail 계정의 2단계 인증 활성화
   - [앱 비밀번호 생성](https://support.google.com/accounts/answer/185833)

2. **환경 변수 설정**
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   ADMIN_EMAIL=admin@example.com
   ```

### 방법 4: 직접 웹훅 (고급 사용자)

자체 서버나 클라우드 함수를 사용하는 경우:

1. **웹훅 엔드포인트 생성**
   - AWS Lambda, Vercel, Netlify Functions 등 사용
   - POST 요청을 받아서 카카오톡으로 전달하는 로직 구현

2. **환경 변수 설정**
   ```env
   KAKAO_WEBHOOK_URL=https://your-webhook-endpoint.com/kakao
   ```

## 🔧 테스트 방법

### 1. 연동 테스트
봇 실행 후 디스코드에서 다음 명령어로 테스트:
```
!연동테스트
```

### 2. 민원 테스트
민원 채널에 테스트 메시지 작성:
```
테스트 민원입니다. 카카오톡 알림이 잘 오는지 확인해주세요.
```

### 3. 웹 API 확인
브라우저에서 접속:
```
http://localhost:3000/complaints
```

## ⚠️ 주의사항

1. **카카오톡 제한사항**
   - 카카오톡은 공식 봇 API가 없음
   - 오픈챗방에 직접 메시지 전송 불가
   - 웹훅을 통한 우회 방법 필요

2. **권장 워크플로우**
   ```
   디스코드 민원 → 웹훅 → Zapier/IFTTT → 이메일/SMS → 수동으로 카카오톡에 공유
   ```

3. **실시간 알림**
   - 이메일이나 SMS로 알림 받기
   - 모바일 앱 푸시 알림 활용
   - 카카오톡 오픈챗방에 수동으로 공유

## 📱 모바일 앱 연동 (추가 옵션)

### LINE Notify 사용
LINE이 더 나은 API를 제공하므로 대안으로 고려:

1. [LINE Notify](https://notify-bot.line.me/) 등록
2. 토큰 발급
3. 알림 그룹에 LINE Notify 봇 추가

### Discord 모바일 앱
가장 간단한 방법:
1. 디스코드 모바일 앱에서 민원 채널 알림 활성화
2. 푸시 알림으로 즉시 확인 가능

## 🎯 최종 권장 설정

1. **주 알림**: Zapier → 이메일
2. **보조 알림**: IFTTT → 모바일 푸시
3. **백업 알림**: Discord 모바일 앱
4. **수동 공유**: 알림 받은 후 카카오톡 오픈챗에 수동으로 공유

이렇게 설정하면 민원이 접수될 때마다 다양한 경로로 알림을 받을 수 있습니다! 