const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 데이터베이스 초기화 - 앱 시작 전에 연결 확인
const db = require('./db/db');

// 서버 포트 설정
const PORT = process.env.PORT || 3000;

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.static('./'));

// 라우터 가져오기
const profilesRouter = require('./routes/profiles');
const profileStatusRouter = require('./routes/profile-status');
const baselineEngineRouter = require('./routes/baseline-engine');

// API 라우트 설정
app.use('/api/profiles', profilesRouter);
app.use('/api/profile-status', profileStatusRouter);
app.use('/api/baseline-engine', baselineEngineRouter);

// 기본 라우트 - SPA 지원
app.get('*', (req, res) => {
    // API 요청이 아닌 경우에만 index.html 반환
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
        message: err.message
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`UBA 프로파일 마법사 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT} 에서 애플리케이션을 확인하세요.`);
});
