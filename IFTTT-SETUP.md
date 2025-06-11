# 🔥 IFTTT로 카카오톡 알림 자동화 (5분 완성)

## 📱 목표
디스코드 민원 → IFTTT → 휴대폰 알림 → 카카오톡 오픈챗 공유

## 🚀 빠른 설정 (5분)

### 1단계: IFTTT 가입 (2분)
1. [IFTTT.com](https://ifttt.com) 접속
2. 가입/로그인
3. **"Create"** 버튼 클릭

### 2단계: 웹훅 설정 (1분)
1. **"If This"** 클릭
2. **"Webhooks"** 검색 후 선택
3. **"Receive a web request"** 선택
4. **Event name**: `discord_complaint` 입력
5. **"Create trigger"** 클릭

### 3단계: 카카오톡 알림 설정 (1분)
1. **"Then That"** 클릭
2. **"Notifications"** 검색 후 선택
3. **"Send a notification from the IFTTT app"** 선택
4. **메시지**: 
   ```
   🚨 방구석 역사발표회 민원 접수
   
   📋 민원번호: {{Value1}}
   👤 작성자: {{Value2}}
   📄 내용: {{Value3}}
   
   ▶️ 카카오톡 오픈챗에 공유해주세요!
   https://open.kakao.com/o/gLsszgvg
   ```
5. **"Create action"** 클릭
6. **"Finish"** 클릭

### 4단계: 웹훅 키 가져오기 (1분)
1. [IFTTT Webhooks](https://ifttt.com/maker_webhooks) 접속
2. **"Documentation"** 클릭
3. **Your key is:** 부분에서 키 복사
4. 예시: `bA1cD2eF3gH4iJ5kL6mN7oP8qR9sT0`

### 5단계: 봇 설정 완료
복사한 키를 `.env` 파일에 추가:
```env
IFTTT_WEBHOOK_KEY=bA1cD2eF3gH4iJ5kL6mN7oP8qR9sT0
```

## 📱 IFTTT 앱 설치
1. 휴대폰에서 **IFTTT 앱** 다운로드
2. 동일 계정으로 로그인
3. 알림 권한 허용

## 🎯 작동 방식
```
디스코드 민원 접수
↓
봇이 IFTTT 웹훅 호출
↓
휴대폰에 푸시 알림 도착
↓
알림 확인 후 카카오톡 오픈챗에 수동 공유
```

## ✅ 테스트
봇 실행 후 디스코드에서:
```
!연동테스트
```

## 🔧 고급 설정 (선택사항)

### 이메일도 함께 받기
IFTTT에서 추가 Action으로 "Email" 선택

### SMS 알림 추가
IFTTT에서 "SMS" Action 추가 (유료)

### 슬랙 연동
"Then That"에서 "Slack" 선택

## 📋 최종 확인 리스트
- [ ] IFTTT 계정 생성
- [ ] Webhook 트리거 생성 (`discord_complaint`)
- [ ] Notification Action 설정
- [ ] 웹훅 키 복사
- [ ] `.env` 파일에 키 추가
- [ ] IFTTT 앱 설치 (휴대폰)
- [ ] 알림 권한 허용
- [ ] 봇 테스트

완료되면 **방구석 역사발표회 운영진** 오픈챗방으로 즉시 알림이 갑니다! 🎉 