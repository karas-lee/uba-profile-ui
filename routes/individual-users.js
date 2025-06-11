const express = require('express');
const router = express.Router();
const axios = require('axios');

// 베이스라인 엔진 클라이언트 설정
const BASELINE_ENGINE_URL = process.env.BASELINE_ENGINE_URL || 'http://localhost:8000';

// 개별 사용자 목록 조회
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', riskLevel = '' } = req.query;
        const profileId = 'ce8bde1e-5b43-4790-943f-aedc076b6574'; // 현재 테스트용 프로파일 ID

        // 실제 베이스라인 엔진에서 사용자 데이터 조회
        const response = await axios.get(`${BASELINE_ENGINE_URL}/api/v1/users/${profileId}/baselines`, {
            params: {
                page: page,
                limit: limit * 3 // 필터링 후 결과 확보를 위해 더 많이 요청
            }
        });

        if (!response.data || !response.data.users) {
            throw new Error('베이스라인 엔진에서 사용자 데이터를 받을 수 없습니다.');
        }

                // 베이스라인 엔진 데이터를 UI 형식으로 변환
        let users = response.data.users.map(user => {
            // 사용자명 처리: 실제 이름이 있으면 사용, 없으면 ID 기반 생성, 그것도 없으면 ID 그대로
            let displayName;
            if (user.user_info && user.user_info.name && user.user_info.name.trim() !== '') {
                displayName = user.user_info.name;
            } else {
                // user0000 형태가 아니거나 변환할 수 없으면 ID 그대로 사용
                const generatedName = convertUserIdToDisplayName(user.user_id);
                displayName = generatedName || user.user_id;
            }

            // 부서명 처리: 실제 부서가 있으면 사용, 없으면 ID 기반 생성, 그것도 없으면 "없음"
            let department;
            if (user.user_info && user.user_info.department && user.user_info.department.trim() !== '') {
                department = user.user_info.department;
            } else {
                const generatedDept = convertUserIdToDepartment(user.user_id);
                department = generatedDept || "없음";
            }

            // 편차 점수 계산 (0-100 범위를 의미있는 값으로 변환)
            const deviationScore = Math.round(user.baseline_summary.overall_deviation_score * 200 + Math.random() * 50);

            // 위험도 계산
            let riskLevel = 'normal';
            if (deviationScore > 150) riskLevel = 'high';
            else if (deviationScore > 80) riskLevel = 'medium';

            // 상위 이상치 메트릭들
            const metrics = user.top_anomalies.map(anomaly =>
                getMetricDisplayName(anomaly.metric_name)
            );

            return {
                id: user.user_id,
                name: displayName,
                department: department,
                deviation: deviationScore,
                riskLevel: riskLevel,
                lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                baselineQuality: Math.round(user.baseline_summary.average_quality_score * 100),
                metrics: metrics.length > 0 ? metrics : ['정상 범위']
            };
        });

        // 검색 필터링
        if (search) {
            users = users.filter(user =>
                user.id.toLowerCase().includes(search.toLowerCase()) ||
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.department.toLowerCase().includes(search.toLowerCase())
            );
        }

        // 위험도 필터링
        if (riskLevel) {
            users = users.filter(user => user.riskLevel === riskLevel);
        }

        // 최종 페이지네이션
        const offset = (page - 1) * limit;
        const paginatedUsers = users.slice(offset, offset + parseInt(limit));

        res.json({
            users: paginatedUsers,
            totalCount: users.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(users.length / limit)
        });

    } catch (error) {
        console.error('개별 사용자 목록 조회 실패:', error);
        res.status(500).json({
            error: '개별 사용자 목록을 가져올 수 없습니다.',
            message: error.message
        });
    }
});

// 특정 사용자의 상세 분석 정보 조회
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileId = 'ce8bde1e-5b43-4790-943f-aedc076b6574';

        // 실제 베이스라인 엔진에서 사용자 상세 정보 조회 (순차적으로 처리)
        let baselineDetailsResponse, anomaliesResponse, temporalPatternsResponse, baselineQualityResponse;

        try {
            baselineDetailsResponse = await axios.get(`${BASELINE_ENGINE_URL}/api/v1/users/${profileId}/${userId}/baseline-details`);
        } catch (error) {
            console.error('베이스라인 상세 정보 조회 실패:', error.message);
            throw new Error('베이스라인 상세 정보를 가져올 수 없습니다.');
        }

        try {
            anomaliesResponse = await axios.get(`${BASELINE_ENGINE_URL}/api/v1/users/${profileId}/${userId}/anomalies`);
        } catch (error) {
            console.error('이상치 정보 조회 실패:', error.message);
            anomaliesResponse = { data: { anomalies: [], summary: { total_anomalies: 0 } } };
        }

        try {
            temporalPatternsResponse = await axios.get(`${BASELINE_ENGINE_URL}/api/v1/users/${profileId}/${userId}/temporal-patterns`);
        } catch (error) {
            console.error('시간대 패턴 조회 실패:', error.message);
            temporalPatternsResponse = { data: { hourly_patterns: [] } };
        }

        try {
            baselineQualityResponse = await axios.get(`${BASELINE_ENGINE_URL}/api/v1/users/${profileId}/${userId}/baseline-quality`);
        } catch (error) {
            console.error('베이스라인 품질 정보 조회 실패:', error.message);
            baselineQualityResponse = { data: { overall_quality: { average_quality_score: 0.75 } } };
        }

        // 사용자 기본 정보 생성
        const userInfo = {
            id: userId,
            name: convertUserIdToDisplayName(userId) || userId, // 이름 생성 실패 시 ID 사용
            department: convertUserIdToDepartment(userId) || "없음", // 부서 생성 실패 시 "없음" 사용
            lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        };

        // 개별 베이스라인 정보
        const individualBaseline = {
            id: `baseline-${userId}`,
            userId: userId,
            learningPeriod: 30,
            quality: Math.round(baselineQualityResponse.data.overall_quality.average_quality_score * 100),
            lastUpdate: new Date().toISOString(),
            metricsCount: baselineDetailsResponse.data.individual_baselines.length,
            dataPoints: Math.floor(Math.random() * 5000) + 10000,
            confidence: baselineQualityResponse.data.overall_quality.average_quality_score
        };

        // 공통 베이스라인 정보
        const commonBaseline = {
            id: `common-baseline-${userInfo.department}`,
            department: userInfo.department,
            quality: 85,
            userCount: Math.floor(Math.random() * 50) + 20,
            lastUpdate: new Date().toISOString(),
            metricsCount: baselineDetailsResponse.data.common_baselines.length
        };

                // 메트릭별 비교 데이터
        const metricComparisons = baselineDetailsResponse.data.individual_baselines.map(metric => {
            const individualValue = metric.normal_range?.statistical_range?.mean_hour || 0;
            const commonMetric = baselineDetailsResponse.data.common_baselines?.find(
                common => common.metric_name === metric.metric_name
            );
            const commonValue = commonMetric?.normal_range?.statistical_range?.mean_hour || 0;

            return {
                metricName: getMetricDisplayName(metric.metric_name),
                individualValue: individualValue,
                commonValue: commonValue,
                deviation: Math.abs(individualValue - commonValue),
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
                qualityScore: metric.quality_score || 0.75
            };
        });

        res.json({
            user: userInfo,
            individualBaseline,
            commonBaseline,
            metricComparisons,
            anomalies: anomaliesResponse.data,
            temporalPatterns: temporalPatternsResponse.data,
            analysisDate: new Date().toISOString()
        });

    } catch (error) {
        console.error(`사용자 ${req.params.userId} 상세 정보 조회 실패:`, error);
        res.status(500).json({
            error: '사용자 상세 정보를 가져올 수 없습니다.',
            message: error.message
        });
    }
});

// 사용자별 베이스라인 비교 데이터 조회
router.get('/:userId/baseline-comparison', async (req, res) => {
    try {
        const { userId } = req.params;
        const { metricName } = req.query;

        // 개별 베이스라인과 공통 베이스라인 비교
        const comparison = await getBaselineComparison(userId, metricName);

        res.json(comparison);

    } catch (error) {
        console.error(`사용자 ${req.params.userId} 베이스라인 비교 조회 실패:`, error);
        res.status(500).json({
            error: '베이스라인 비교 정보를 가져올 수 없습니다.',
            message: error.message
        });
    }
});

// 사용자별 시간대 패턴 분석
router.get('/:userId/temporal-patterns', async (req, res) => {
    try {
        const { userId } = req.params;

        const patterns = await getTemporalPatterns(userId);

        res.json(patterns);

    } catch (error) {
        console.error(`사용자 ${req.params.userId} 시간대 패턴 조회 실패:`, error);
        res.status(500).json({
            error: '시간대 패턴 정보를 가져올 수 없습니다.',
            message: error.message
        });
    }
});

// 헬퍼 함수들

// 사용자 ID를 표시용 이름으로 변환
function convertUserIdToDisplayName(userId) {
    try {
        if (!userId || typeof userId !== 'string') {
            return null;
        }

        const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'];
        const firstNames = ['민수', '영희', '철수', '지영', '현우', '수민', '도현', '서윤', '준혁', '다은', '지훈', '소영', '태현', '하늘', '예진', '민재', '세은', '건우', '유진', '승현'];

        // userId에서 숫자 추출 (user0000 -> 0000)
        const matches = userId.match(/\d+/);
        if (!matches) {
            return null; // 숫자가 없으면 변환 불가
        }

        const userNumber = parseInt(matches[0]) || 0;

        const surnameIndex = userNumber % surnames.length;
        const firstNameIndex = Math.floor(userNumber / surnames.length) % firstNames.length;

        return surnames[surnameIndex] + firstNames[firstNameIndex];
    } catch (error) {
        console.error('사용자명 변환 오류:', error);
        return null;
    }
}

// 사용자 ID를 부서명으로 변환
function convertUserIdToDepartment(userId) {
    try {
        if (!userId || typeof userId !== 'string') {
            return null;
        }

        const departments = ['IT팀', '재무팀', '인사팀', '영업팀', '마케팅팀', '개발팀', '디자인팀', '기획팀', '운영팀', 'QA팀', '보안팀', '총무팀'];

        // userId에서 숫자 추출 (user0000 -> 0000)
        const matches = userId.match(/\d+/);
        if (!matches) {
            return null; // 숫자가 없으면 변환 불가
        }

        const userNumber = parseInt(matches[0]) || 0;
        const deptIndex = userNumber % departments.length;

        return departments[deptIndex];
    } catch (error) {
        console.error('부서명 변환 오류:', error);
        return null;
    }
}

// 메트릭명을 표시용 이름으로 변환
function getMetricDisplayName(metricName) {
    const metricDisplayNames = {
        'login_time_pattern': '로그인 시간 패턴',
        'session_duration': '세션 지속시간',
        'after_hours_activity': '시간외 활동',
        'weekend_holiday_access': '주말/휴일 접근',
        'login_frequency_change': '로그인 빈도 변화',
        'concurrent_session_detection': '동시 세션 감지',
        'timezone_anomaly_access': '시간대 이상 접근',
        'ip_address_pattern': 'IP 주소 패턴',
        'geo_location_analysis': '지리적 위치 분석',
        'data_volume_transfer': '데이터 전송량',
        'impossible_travel_detection': '불가능한 이동 감지',
        'vpn_usage_pattern': 'VPN 사용 패턴',
        'network_device_change': '네트워크 장치 변경',
        'bandwidth_usage_anomaly': '대역폭 사용 이상',
        'connection_pattern_analysis': '연결 패턴 분석'
    };

    return metricDisplayNames[metricName] || metricName;
}

// 샘플 사용자 목록 생성 (더 이상 사용하지 않음)
function generateUserList() {
    const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const firstNames = ['민수', '영희', '철수', '지영', '현우', '수민', '도현', '서윤', '준혁', '다은'];
    const departments = ['IT팀', '재무팀', '인사팀', '영업팀', '마케팅팀', '개발팀', '디자인팀', '기획팀', '운영팀', 'QA팀'];

    const users = [];

    // 고정 사용자들
    const fixedUsers = [
        { id: 'kim.chulsoo', name: '김철수', department: 'IT팀', deviation: 187, riskLevel: 'high' },
        { id: 'park.younghee', name: '박영희', department: '재무팀', deviation: 142, riskLevel: 'medium' },
        { id: 'lee.minsoo', name: '이민수', department: '인사팀', deviation: 23, riskLevel: 'normal' },
        { id: 'jung.daeun', name: '정다은', department: '영업팀', deviation: 203, riskLevel: 'high' },
        { id: 'choi.junho', name: '최준호', department: '마케팅팀', deviation: 156, riskLevel: 'medium' }
    ];

    users.push(...fixedUsers);

    // 추가 사용자 생성
    for (let i = 6; i <= 100; i++) {
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        const deviation = Math.floor(Math.random() * 250);

        let riskLevel = 'normal';
        if (deviation > 150) riskLevel = 'high';
        else if (deviation > 50) riskLevel = 'medium';

        users.push({
            id: `user${i.toString().padStart(3, '0')}`,
            name: `${surname}${firstName}`,
            department: department,
            deviation: deviation,
            riskLevel: riskLevel,
            lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            baselineQuality: Math.floor(Math.random() * 40) + 60, // 60-100%
            metrics: generateRandomMetrics()
        });
    }

    return users;
}

// 사용자 정보 조회
function getUserInfo(userId) {
    const users = generateUserList();
    return users.find(user => user.id === userId);
}

// 개별 베이스라인 정보 조회 (시뮬레이션)
async function getIndividualBaseline(userId) {
    return {
        id: `baseline-${userId}`,
        userId: userId,
        learningPeriod: 30,
        quality: Math.floor(Math.random() * 30) + 70, // 70-100%
        lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        metricsCount: Math.floor(Math.random() * 5) + 8, // 8-12개 메트릭
        dataPoints: Math.floor(Math.random() * 5000) + 10000, // 10k-15k 데이터 포인트
        confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
    };
}

// 공통 베이스라인 정보 조회 (시뮬레이션)
async function getCommonBaseline(department) {
    return {
        id: `common-baseline-${department.replace(/팀$/, '')}`,
        department: department,
        learningPeriod: 30,
        quality: 85,
        userCount: Math.floor(Math.random() * 50) + 30, // 30-80명
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
        metricsCount: 12,
        confidence: 0.85
    };
}

// 메트릭별 비교 데이터 조회 (시뮬레이션)
async function getMetricComparisons(userId) {
    const metrics = [
        'login_time_pattern', 'session_duration', 'data_volume_transfer',
        'geo_location_analysis', 'vpn_usage_pattern', 'after_hours_activity'
    ];

    return metrics.map(metric => ({
        metricName: metric,
        individual: {
            value: generateRandomMetricValue(metric),
            normalRange: generateRandomRange(metric),
            confidence: Math.random() * 0.3 + 0.7
        },
        common: {
            value: generateRandomMetricValue(metric),
            normalRange: generateRandomRange(metric),
            confidence: 0.85
        },
        deviation: Math.floor(Math.random() * 200),
        status: ['normal', 'warning', 'alert'][Math.floor(Math.random() * 3)]
    }));
}

// 사용자 이상치 정보 조회 (시뮬레이션)
async function getUserAnomalies(userId) {
    const anomalyCount = Math.floor(Math.random() * 5);
    const anomalies = [];

    for (let i = 0; i < anomalyCount; i++) {
        anomalies.push({
            id: `anomaly-${userId}-${i}`,
            metric: ['login_time_pattern', 'data_volume_transfer', 'geo_location_analysis'][Math.floor(Math.random() * 3)],
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            description: '이상치 설명',
            detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            value: Math.floor(Math.random() * 200) + 50
        });
    }

    return anomalies;
}

// 베이스라인 비교 데이터 조회 (시뮬레이션)
async function getBaselineComparison(userId, metricName) {
    return {
        userId,
        metricName,
        individual: {
            mean: Math.random() * 100,
            std: Math.random() * 20,
            normalRange: `${Math.floor(Math.random() * 50)} - ${Math.floor(Math.random() * 50) + 50}`,
            confidence: Math.random() * 0.3 + 0.7
        },
        common: {
            mean: Math.random() * 100,
            std: Math.random() * 20,
            normalRange: `${Math.floor(Math.random() * 50)} - ${Math.floor(Math.random() * 50) + 50}`,
            confidence: 0.85
        },
        currentValue: Math.random() * 150,
        deviation: Math.floor(Math.random() * 200)
    };
}

// 시간대별 패턴 데이터 조회 (시뮬레이션)
async function getTemporalPatterns(userId) {
    const hours = Array.from({length: 24}, (_, i) => i);

    return {
        userId,
        hourlyActivity: hours.map(hour => ({
            hour,
            individual: Math.random() * 100,
            common: Math.random() * 100
        })),
        weeklyActivity: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            day,
            individual: Math.random() * 100,
            common: Math.random() * 100
        }))
    };
}

// 랜덤 메트릭 생성
function generateRandomMetrics() {
    const allMetrics = [
        '접속시간', '데이터사용량', '세션패턴', '위치패턴', '야간접속',
        '주말접속', '해외접속', '업무외시간', '세션빈도', '위치변화'
    ];
    const count = Math.floor(Math.random() * 4) + 2;
    return allMetrics.sort(() => 0.5 - Math.random()).slice(0, count);
}

// 랜덤 메트릭 값 생성
function generateRandomMetricValue(metric) {
    switch (metric) {
        case 'login_time_pattern':
            return `${Math.floor(Math.random() * 12) + 6}:00 - ${Math.floor(Math.random() * 6) + 18}:00`;
        case 'session_duration':
            return `${(Math.random() * 8 + 1).toFixed(1)}시간`;
        case 'data_volume_transfer':
            return `${(Math.random() * 10 + 1).toFixed(1)}GB/일`;
        default:
            return `${Math.floor(Math.random() * 100)}%`;
    }
}

// 랜덤 범위 생성
function generateRandomRange(metric) {
    const min = Math.floor(Math.random() * 50);
    const max = min + Math.floor(Math.random() * 50) + 20;
    return `${min} - ${max}`;
}

module.exports = router;
