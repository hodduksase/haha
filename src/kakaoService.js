const axios = require('axios');

/**
 * 카카오톡 오픈챗 연동 서비스
 * 
 * 카카오톡 오픈챗에는 직접적인 API가 없기 때문에
 * 다음 중 하나의 방법을 사용해야 합니다:
 * 
 * 1. Webhook.site나 Zapier 같은 웹훅 서비스 사용
 * 2. 카카오톡 비즈니스 계정의 알림톡 API 사용
 * 3. 텔레그램이나 슬랙 등 대안 플랫폼 사용
 * 4. 이메일 알림으로 대체
 */

class KakaoService {
    constructor(webhookUrl, options = {}) {
        this.webhookUrl = webhookUrl;
        this.options = {
            timeout: 10000,
            maxRetries: 3,
            ...options
        };
    }

    /**
     * 카카오톡으로 메시지 전송
     */
    async sendMessage(messageData) {
        if (!this.webhookUrl) {
            throw new Error('카카오톡 웹훅 URL이 설정되지 않았습니다.');
        }

        const payload = this.formatMessage(messageData);
        
        for (let retry = 0; retry < this.options.maxRetries; retry++) {
            try {
                const response = await axios.post(this.webhookUrl, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Discord-Kakao-Bot/1.0'
                    },
                    timeout: this.options.timeout
                });

                console.log(`✅ 카카오톡 메시지 전송 성공 (시도 ${retry + 1}/${this.options.maxRetries})`);
                return response.data;

            } catch (error) {
                console.error(`❌ 카카오톡 메시지 전송 실패 (시도 ${retry + 1}/${this.options.maxRetries}):`, error.message);
                
                if (retry === this.options.maxRetries - 1) {
                    throw new Error(`카카오톡 메시지 전송 최종 실패: ${error.message}`);
                }
                
                // 재시도 전 대기
                await this.delay(1000 * (retry + 1));
            }
        }
    }

    /**
     * 메시지 포맷팅
     */
    formatMessage(messageData) {
        const { type, data } = messageData;

        switch (type) {
            case 'complaint':
                return this.formatComplaintMessage(data);
            case 'status_update':
                return this.formatStatusUpdateMessage(data);
            case 'notification':
                return this.formatNotificationMessage(data);
            default:
                return { text: data.text || JSON.stringify(data) };
        }
    }

    /**
     * 민원 접수 메시지 포맷
     */
    formatComplaintMessage(complaint) {
        return {
            text: [
                '🚨 새로운 민원이 접수되었습니다',
                '',
                `📋 민원번호: ${complaint.id}`,
                `👤 작성자: ${complaint.author.username}`,
                `⏰ 접수시간: ${complaint.timestamp}`,
                `📊 상태: 📋 처리 대기`,
                '',
                `📄 내용:`,
                complaint.content,
                '',
                `💻 디스코드에서 확인: https://discord.com/channels/@me/${complaint.channelId}/${complaint.messageId}`
            ].join('\n'),
            // 추가 메타데이터 (웹훅 서비스에 따라 사용)
            metadata: {
                type: 'complaint',
                id: complaint.id,
                priority: 'normal',
                timestamp: complaint.timestamp
            }
        };
    }

    /**
     * 상태 업데이트 메시지 포맷
     */
    formatStatusUpdateMessage(data) {
        const statusEmojis = {
            pending: '📋',
            processing: '⚙️',
            resolved: '✅',
            closed: '🔒'
        };

        const statusNames = {
            pending: '처리 대기',
            processing: '처리 중',
            resolved: '해결 완료',
            closed: '종료'
        };

        return {
            text: [
                '📊 민원 상태가 업데이트되었습니다',
                '',
                `📋 민원번호: ${data.complaintId}`,
                `📄 새로운 상태: ${statusEmojis[data.status]} ${statusNames[data.status]}`,
                `⏰ 업데이트 시간: ${data.updatedAt}`,
                '',
                data.note ? `📝 비고: ${data.note}` : ''
            ].filter(line => line !== '').join('\n'),
            metadata: {
                type: 'status_update',
                complaintId: data.complaintId,
                status: data.status,
                timestamp: data.updatedAt
            }
        };
    }

    /**
     * 일반 알림 메시지 포맷
     */
    formatNotificationMessage(data) {
        return {
            text: data.text,
            metadata: {
                type: 'notification',
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 웹훅 URL 유효성 검증
     */
    validateWebhookUrl() {
        if (!this.webhookUrl) {
            return { valid: false, error: 'Webhook URL이 설정되지 않았습니다.' };
        }

        try {
            new URL(this.webhookUrl);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: '유효하지 않은 URL 형식입니다.' };
        }
    }

    /**
     * 연결 테스트
     */
    async testConnection() {
        const validation = this.validateWebhookUrl();
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        try {
            const testMessage = {
                type: 'notification',
                data: {
                    text: '🔍 카카오톡 연동 테스트 메시지입니다.\n디스코드 민원 봇이 정상적으로 작동하고 있습니다.'
                }
            };

            await this.sendMessage(testMessage);
            return { success: true, message: '카카오톡 연동 테스트 성공' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = KakaoService; 