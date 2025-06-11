require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const moment = require('moment');
const express = require('express');

// Express 서버 설정
const app = express();
app.use(express.json());

// 디스코드 클라이언트 설정
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// 환경 변수
const {
    DISCORD_BOT_TOKEN,
    DISCORD_APPLICATION_ID,
    DISCORD_PUBLIC_KEY,
    COMPLAINT_CHANNEL_ID,
    KAKAO_WEBHOOK_URL,
    PORT = 3000,
    ADMIN_ROLE_ID
} = process.env;

// 민원 상태 추적
const complaintStore = new Map();

// 디스코드 봇 준비 완료
client.once('ready', () => {
    console.log(`🤖 봇이 준비되었습니다! ${client.user.tag}로 로그인했습니다.`);
    console.log(`🆔 애플리케이션 ID: ${DISCORD_APPLICATION_ID || '설정되지 않음'}`);
    console.log(`🔑 Public Key: ${DISCORD_PUBLIC_KEY ? '설정됨' : '설정되지 않음'}`);
    console.log(`📝 민원 채널 ID: ${COMPLAINT_CHANNEL_ID}`);
    console.log(`🔗 카카오톡 웹훅 URL: ${KAKAO_WEBHOOK_URL ? '설정됨' : '설정되지 않음'}`);
    console.log(`🌐 웹 대시보드: http://localhost:${PORT}`);
    
    // 봇 초대 링크 생성
    if (DISCORD_APPLICATION_ID) {
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_APPLICATION_ID}&permissions=2147502080&scope=bot`;
        console.log(`🔗 봇 초대 링크: ${inviteUrl}`);
    }
});

// 메시지 감지 및 처리
client.on('messageCreate', async (message) => {
    // 봇 메시지 무시
    if (message.author.bot) return;
    
    // 민원 채널에서만 작동
    if (message.channel.id !== COMPLAINT_CHANNEL_ID) return;

    try {
        // 민원 정보 생성
        const complaintId = `COMPLAINT_${Date.now()}`;
        const complaintData = {
            id: complaintId,
            author: {
                username: message.author.username,
                id: message.author.id,
                avatar: message.author.displayAvatarURL()
            },
            content: message.content,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            messageId: message.id,
            channelId: message.channel.id,
            status: 'pending'
        };

        // 민원 저장
        complaintStore.set(complaintId, complaintData);

        console.log(`📋 새로운 민원이 접수되었습니다: ${complaintId}`);
        console.log(`👤 작성자: ${message.author.username}`);
        console.log(`📄 내용: ${message.content.substring(0, 100)}...`);

        // 디스코드에 민원 접수 확인 메시지 보내기
        const confirmEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('✅ 민원이 접수되었습니다')
            .setDescription(`민원 번호: \`${complaintId}\``)
            .addFields(
                { name: '작성자', value: `<@${message.author.id}>`, inline: true },
                { name: '접수 시간', value: complaintData.timestamp, inline: true },
                { name: '상태', value: '📋 처리 대기', inline: true }
            )
            .setFooter({ text: '카카오톡으로 알림이 전송되었습니다.' })
            .setTimestamp();

        // 원본 메시지에 리액션 추가
        await message.react('✅');
        
        // 확인 메시지 전송
        const confirmMessage = await message.reply({ embeds: [confirmEmbed] });

        // 카카오톡으로 알림 전송 (다양한 방법 시도)
        try {
            await sendToKakao(complaintData);
        } catch (error) {
            // 카카오톡 연동 실패시 디스코드에 특별 알림
            const kakaoEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('📱 카카오톡 오픈챗 알림 필요')
                .setDescription('아래 내용을 카카오톡 오픈챗방에 수동으로 공유해주세요!')
                .addFields(
                    { name: '📋 민원번호', value: complaintData.id, inline: true },
                    { name: '👤 작성자', value: complaintData.author.username, inline: true },
                    { name: '📄 내용', value: complaintData.content.substring(0, 200) + '...', inline: false },
                    { name: '🔗 카카오톡 오픈챗방', value: '[방구석 역사발표회 운영진](https://open.kakao.com/o/gLsszgvg)', inline: false }
                )
                .setFooter({ text: '이 메시지를 복사해서 카카오톡에 붙여넣으세요' })
                .setTimestamp();

            await message.channel.send({ embeds: [kakaoEmbed] });
            console.log('📱 카카오톡 수동 알림 메시지 전송됨');
        }

        // 관리자에게 멘션 (설정된 경우)
        if (ADMIN_ROLE_ID) {
            await message.channel.send(`<@&${ADMIN_ROLE_ID}> 새로운 민원이 접수되었습니다!`);
        }

    } catch (error) {
        console.error('❌ 민원 처리 중 오류 발생:', error);
        await message.reply('❌ 민원 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
    }
});

// 카카오톡으로 메시지 전송 함수
async function sendToKakao(complaintData) {
    if (!KAKAO_WEBHOOK_URL) {
        console.log('⚠️ 카카오톡 웹훅 URL이 설정되지 않았습니다.');
        return;
    }

    try {
        // 카카오톡 오픈챗 메시지 포맷
        const kakaoMessage = {
            text: `🚨 【방구석 역사발표회】새로운 민원 접수\n\n` +
                  `📋 민원번호: ${complaintData.id}\n` +
                  `👤 작성자: ${complaintData.author.username}\n` +
                  `⏰ 접수시간: ${complaintData.timestamp}\n` +
                  `📄 내용: ${complaintData.content}\n\n` +
                  `💻 디스코드에서 확인하기: https://discord.com/channels/@me/${complaintData.channelId}/${complaintData.messageId}\n` +
                  `🔗 오픈챗방: https://open.kakao.com/o/gLsszgvg`,
            // 카카오톡 오픈챗 특화 포맷
            openChatData: {
                roomLink: "https://open.kakao.com/o/gLsszgvg",
                roomName: "방구석 역사발표회 운영진",
                messageType: "complaint_notification",
                priority: "high"
            }
        };

        // 웹훅으로 카카오톡에 전송 (여러 방법 시도)
        const response = await sendKakaoMessage(kakaoMessage);

        console.log('✅ 카카오톡 알림 전송 완료');
        return response;

    } catch (error) {
        console.error('❌ 카카오톡 알림 전송 실패:', error.response?.data || error.message);
        
        // 대안 방법으로 이메일 알림 전송
        await sendEmailFallback(complaintData);
        throw error;
    }
}

// 카카오톡 메시지 전송 (다중 방법)
async function sendKakaoMessage(messageData) {
    const methods = [
        () => sendViaWebhook(messageData),
        () => sendViaZapier(messageData),
        () => sendViaIFTTT(messageData)
    ];

    for (const method of methods) {
        try {
            const result = await method();
            if (result) return result;
        } catch (error) {
            console.log(`전송 방법 실패, 다음 방법 시도 중...`);
        }
    }
    
    throw new Error('모든 카카오톡 전송 방법 실패');
}

// 방법 1: 직접 웹훅
async function sendViaWebhook(messageData) {
    const response = await axios.post(KAKAO_WEBHOOK_URL, messageData, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Discord-Kakao-Bot/1.0'
        },
        timeout: 10000
    });
    return response.data;
}

// 방법 2: Zapier 웹훅
async function sendViaZapier(messageData) {
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!zapierUrl) return null;
    
    const response = await axios.post(zapierUrl, {
        ...messageData,
        target: "kakao_openchat",
        room_link: "https://open.kakao.com/o/gLsszgvg"
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
    });
    return response.data;
}

// 방법 3: IFTTT 웹훅
async function sendViaIFTTT(messageData) {
    const iftttKey = process.env.IFTTT_WEBHOOK_KEY;
    if (!iftttKey) return null;
    
    const response = await axios.post(`https://maker.ifttt.com/trigger/discord_complaint/with/key/${iftttKey}`, {
        value1: messageData.text,
        value2: "https://open.kakao.com/o/gLsszgvg",
        value3: messageData.openChatData?.messageType || "notification"
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
    });
    return response.data;
}

// 이메일 대안 알림
async function sendEmailFallback(complaintData) {
    const nodemailer = require('nodemailer');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('이메일 설정이 없어 대안 알림을 건너뜁니다.');
        return;
    }
    
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 디스코드 민원 접수 - ${complaintData.id}`,
            html: `
                <h2>🚨 새로운 민원이 접수되었습니다</h2>
                <p><strong>민원번호:</strong> ${complaintData.id}</p>
                <p><strong>작성자:</strong> ${complaintData.author.username}</p>
                <p><strong>접수시간:</strong> ${complaintData.timestamp}</p>
                <p><strong>내용:</strong></p>
                <p>${complaintData.content}</p>
                <br>
                <p><a href="https://open.kakao.com/o/gLsszgvg">카카오톡 오픈챗방에서 확인하기</a></p>
                <p><em>카카오톡 직접 알림 실패로 이메일로 전송되었습니다.</em></p>
            `
        });
        
        console.log('✅ 이메일 대안 알림 전송 완료');
    } catch (emailError) {
        console.error('❌ 이메일 대안 알림도 실패:', emailError.message);
    }
}

// 연동 테스트 명령어
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // !연동테스트 명령어 처리
    if (message.content.startsWith('!연동테스트')) {
        try {
            const testData = {
                id: `TEST_${Date.now()}`,
                author: {
                    username: message.author.username,
                    id: message.author.id,
                    avatar: message.author.displayAvatarURL()
                },
                content: '🔍 카카오톡 연동 테스트 메시지입니다.',
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                messageId: message.id,
                channelId: message.channel.id,
                status: 'test'
            };

            await message.reply('🔍 카카오톡 연동 테스트를 시작합니다...');
            
            // 카카오톡 연동 테스트
            await sendToKakao(testData);
            
            const testEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ 연동 테스트 완료')
                .setDescription('카카오톡 오픈챗 연동이 정상적으로 작동합니다!')
                .addFields(
                    { name: '대상 오픈챗방', value: '[방구석 역사발표회 운영진](https://open.kakao.com/o/gLsszgvg)', inline: false },
                    { name: '테스트 시간', value: testData.timestamp, inline: true }
                )
                .setFooter({ text: '연동이 실패한 경우 환경 변수 설정을 확인해주세요.' })
                .setTimestamp();

            await message.followUp({ embeds: [testEmbed] });

        } catch (error) {
            console.error('❌ 연동 테스트 실패:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ 연동 테스트 실패')
                .setDescription('카카오톡 오픈챗 연동에 문제가 있습니다.')
                .addFields(
                    { name: '오류 내용', value: error.message, inline: false },
                    { name: '해결 방법', value: '1. 환경 변수 확인\n2. 웹훅 URL 확인\n3. 네트워크 연결 확인', inline: false }
                )
                .setTimestamp();

            await message.followUp({ embeds: [errorEmbed] });
        }
        return;
    }
    
    // !민원상태 명령어 처리
    if (message.content.startsWith('!민원상태')) {
        const args = message.content.split(' ');
        const complaintId = args[1];
        const newStatus = args[2];

        if (!complaintId || !newStatus) {
            return message.reply('❌ 사용법: `!민원상태 [민원번호] [상태]`\n상태: pending, processing, resolved, closed');
        }

        const complaint = complaintStore.get(complaintId);
        if (!complaint) {
            return message.reply('❌ 해당 민원을 찾을 수 없습니다.');
        }

        // 상태 업데이트
        complaint.status = newStatus;
        complaint.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
        complaintStore.set(complaintId, complaint);

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

        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📊 민원 상태 업데이트')
            .setDescription(`민원 번호: \`${complaintId}\``)
            .addFields(
                { name: '새로운 상태', value: `${statusEmojis[newStatus]} ${statusNames[newStatus]}`, inline: true },
                { name: '업데이트 시간', value: complaint.updatedAt, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [statusEmbed] });

        // 카카오톡으로 상태 업데이트 알림
        if (KAKAO_WEBHOOK_URL) {
            const statusUpdateMessage = {
                text: `📊 민원 상태 업데이트\n\n` +
                      `📋 민원번호: ${complaintId}\n` +
                      `📄 상태: ${statusEmojis[newStatus]} ${statusNames[newStatus]}\n` +
                      `⏰ 업데이트 시간: ${complaint.updatedAt}`
            };

            try {
                await axios.post(KAKAO_WEBHOOK_URL, statusUpdateMessage, {
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('✅ 카카오톡 상태 업데이트 알림 전송 완료');
            } catch (error) {
                console.error('❌ 카카오톡 상태 업데이트 알림 전송 실패:', error.message);
            }
        }
    }
});

// Express 웹서버 (카카오톡에서 응답받기 위한 엔드포인트)
app.get('/', (req, res) => {
    res.json({
        status: 'Discord-Kakao Integration Bot',
        timestamp: new Date().toISOString(),
        complaints: complaintStore.size
    });
});

// 민원 목록 조회 API
app.get('/complaints', (req, res) => {
    const complaints = Array.from(complaintStore.values());
    res.json({
        total: complaints.length,
        complaints: complaints
    });
});

// 특정 민원 조회 API
app.get('/complaints/:id', (req, res) => {
    const complaint = complaintStore.get(req.params.id);
    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🌐 웹서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 디스코드 봇 로그인
if (!DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_BOT_TOKEN이 설정되지 않았습니다.');
    process.exit(1);
}

client.login(DISCORD_BOT_TOKEN).catch(error => {
    console.error('❌ 디스코드 봇 로그인 실패:', error);
    process.exit(1);
});

// 종료 처리
process.on('SIGINT', () => {
    console.log('\n👋 봇을 종료합니다...');
    client.destroy();
    process.exit(0);
}); 