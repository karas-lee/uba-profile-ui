/**
 * routes/baseline-engine.js - 베이스라인 엔진 API 라우트
 *
 * 베이스라인 엔진 서버와의 통신을 담당하는 라우트입니다.
 */

const express = require('express');
const router = express.Router();
const { BaselineEngineAPIClient, VpnProfileHelper } = require('../services/baseline-engine-client');

// 베이스라인 엔진 클라이언트 인스턴스 생성
const baselineClient = new BaselineEngineAPIClient(
    process.env.BASELINE_ENGINE_URL || 'http://localhost:8000'
);

/**
 * GET /api/baseline-engine/health - 베이스라인 엔진 서버 상태 확인
 */
router.get('/health', async (req, res) => {
    try {
        const health = await baselineClient.healthCheck();
        res.json({
            status: 'success',
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('베이스라인 엔진 헬스 체크 실패:', error);
        res.status(503).json({
            status: 'error',
            error: '베이스라인 엔진 서버에 연결할 수 없습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/baseline-engine/metrics/supported - 지원하는 메트릭 목록 조회
 */
router.get('/metrics/supported', async (req, res) => {
    try {
        const metrics = await baselineClient.getSupportedMetrics();
        res.json({
            status: 'success',
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('지원 메트릭 조회 실패:', error);
        res.status(500).json({
            status: 'error',
            error: '지원 메트릭 조회 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/baseline-engine/profiles - 베이스라인 엔진에서 프로파일 목록 조회
 */
router.get('/profiles', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            profile_type: req.query.profile_type,
            log_source: req.query.log_source
        };

        const profiles = await baselineClient.getProfiles(filters);
        res.json({
            status: 'success',
            data: profiles,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('베이스라인 엔진 프로파일 목록 조회 실패:', error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 목록 조회 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/baseline-engine/profiles/:id - 베이스라인 엔진에서 특정 프로파일 조회
 */
router.get('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await baselineClient.getProfile(id);

        res.json({
            status: 'success',
            data: profile,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`베이스라인 엔진 프로파일 조회 실패 (${req.params.id}):`, error);

        if (error.message.includes('404')) {
            res.status(404).json({
                status: 'error',
                error: '프로파일을 찾을 수 없습니다.',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                status: 'error',
                error: '프로파일 조회 중 오류가 발생했습니다.',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
});

/**
 * POST /api/baseline-engine/profiles - 베이스라인 엔진에 새 프로파일 생성
 */
router.post('/profiles', async (req, res) => {
    try {
        const profileData = req.body;

        // VPN 프로파일인 경우 메트릭 검증
        if (profileData.log_source === 'vpn' && profileData.selected_metrics) {
            const validation = VpnProfileHelper.validateVpnMetrics(profileData.selected_metrics);

            if (!validation.is_valid) {
                return res.status(400).json({
                    status: 'error',
                    error: '메트릭 검증 실패',
                    validation_result: validation,
                    timestamp: new Date().toISOString()
                });
            }
        }

        const createdProfile = await baselineClient.createProfile(profileData);

        res.status(201).json({
            status: 'success',
            data: createdProfile,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('베이스라인 엔진 프로파일 생성 실패:', error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 생성 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * PUT /api/baseline-engine/profiles/:id - 베이스라인 엔진에서 프로파일 업데이트
 */
router.put('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedProfile = await baselineClient.updateProfile(id, updateData);

        res.json({
            status: 'success',
            data: updatedProfile,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`베이스라인 엔진 프로파일 업데이트 실패 (${req.params.id}):`, error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 업데이트 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * PATCH /api/baseline-engine/profiles/:id/status - 베이스라인 엔진에서 프로파일 상태 업데이트
 */
router.patch('/profiles/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!status) {
            return res.status(400).json({
                status: 'error',
                error: '상태 값이 필요합니다.',
                timestamp: new Date().toISOString()
            });
        }

        const updatedProfile = await baselineClient.updateProfileStatus(id, status, reason);

        res.json({
            status: 'success',
            data: updatedProfile,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`베이스라인 엔진 프로파일 상태 업데이트 실패 (${req.params.id}):`, error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 상태 업데이트 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/baseline-engine/profiles/:id/diagnose - 베이스라인 엔진에서 프로파일 진단
 */
router.post('/profiles/:id/diagnose', async (req, res) => {
    try {
        const { id } = req.params;
        const diagnosis = await baselineClient.diagnoseProfile(id);

        res.json({
            status: 'success',
            data: diagnosis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`베이스라인 엔진 프로파일 진단 실패 (${req.params.id}):`, error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 진단 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * DELETE /api/baseline-engine/profiles/:id - 베이스라인 엔진에서 프로파일 삭제
 */
router.delete('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await baselineClient.deleteProfile(id);

        res.json({
            status: 'success',
            message: '프로파일이 성공적으로 삭제되었습니다.',
            profile_id: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`베이스라인 엔진 프로파일 삭제 실패 (${req.params.id}):`, error);
        res.status(500).json({
            status: 'error',
            error: '프로파일 삭제 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/baseline-engine/vpn-profile/validate - VPN 프로파일 메트릭 검증
 */
router.post('/vpn-profile/validate', (req, res) => {
    try {
        const { selected_metrics } = req.body;

        if (!selected_metrics || !Array.isArray(selected_metrics)) {
            return res.status(400).json({
                status: 'error',
                error: '선택된 메트릭 배열이 필요합니다.',
                timestamp: new Date().toISOString()
            });
        }

        const validation = VpnProfileHelper.validateVpnMetrics(selected_metrics);

        res.json({
            status: 'success',
            data: validation,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('VPN 프로파일 메트릭 검증 실패:', error);
        res.status(500).json({
            status: 'error',
            error: '메트릭 검증 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/baseline-engine/vpn-profile/config - VPN 프로파일 설정 생성
 */
router.post('/vpn-profile/config', (req, res) => {
    try {
        const config = VpnProfileHelper.createVpnProfileConfig(req.body);

        res.json({
            status: 'success',
            data: config,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('VPN 프로파일 설정 생성 실패:', error);
        res.status(500).json({
            status: 'error',
            error: 'VPN 프로파일 설정 생성 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/baseline-engine/vpn-profile/metrics - VPN 관련 메트릭 목록 조회
 */
router.get('/vpn-profile/metrics', (req, res) => {
    try {
        res.json({
            status: 'success',
            data: {
                vpn_relevant_metrics: VpnProfileHelper.VPN_RELEVANT_METRICS,
                time_based: VpnProfileHelper.VPN_RELEVANT_METRICS.filter(m =>
                    m.includes('time') || m.includes('session') || m.includes('frequency') ||
                    m.includes('timezone') || m.includes('concurrent') || m.includes('hours') ||
                    m.includes('weekend')
                ),
                network_based: VpnProfileHelper.VPN_RELEVANT_METRICS.filter(m =>
                    m.includes('ip') || m.includes('geo') || m.includes('data') ||
                    m.includes('travel') || m.includes('vpn') || m.includes('network') ||
                    m.includes('bandwidth') || m.includes('connection')
                )
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('VPN 메트릭 목록 조회 실패:', error);
        res.status(500).json({
            status: 'error',
            error: 'VPN 메트릭 목록 조회 중 오류가 발생했습니다.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
