/**
 * baseline-engine-client.js - 베이스라인 엔진 API 클라이언트
 *
 * Python api_client_example.py를 참고하여 Node.js로 구현한
 * 베이스라인 엔진 API 클라이언트입니다.
 */

const axios = require('axios');

class BaselineEngineAPIClient {
    /**
     * API 클라이언트 초기화
     * @param {string} baseUrl - 베이스라인 엔진 API 서버 URL
     * @param {number} timeout - 요청 타임아웃 (초)
     */
    constructor(baseUrl = "http://localhost:8000", timeout = 30) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // 끝의 '/' 제거
        this.timeout = timeout * 1000; // 밀리초로 변환

        // Axios 인스턴스 생성
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // 요청/응답 인터셉터 설정
        this.client.interceptors.request.use(
            (config) => {
                console.log(`[BaselineEngine] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('[BaselineEngine] 요청 오류:', error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`[BaselineEngine] 응답 성공: ${response.status}`);
                return response;
            },
            (error) => {
                console.error('[BaselineEngine] 응답 오류:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * API 서버 상태 확인
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            console.error('헬스 체크 실패:', error.message);
            throw new Error(`베이스라인 엔진 서버 연결 실패: ${error.message}`);
        }
    }

    /**
     * 지원하는 메트릭 목록 조회
     */
    async getSupportedMetrics() {
        try {
            const response = await this.client.get('/api/v1/profiles/metrics/supported');
            return response.data;
        } catch (error) {
            console.error('지원 메트릭 조회 실패:', error.message);
            throw new Error(`지원 메트릭 조회 실패: ${error.message}`);
        }
    }

    /**
     * 새 프로파일 생성
     * @param {Object} profileData - 프로파일 설정 데이터
     */
    async createProfile(profileData) {
        try {
            const response = await this.client.post('/api/v1/profiles/', profileData);
            return response.data;
        } catch (error) {
            console.error('프로파일 생성 실패:', error.message);
            if (error.response?.data) {
                console.error('서버 오류 상세:', error.response.data);
            }
            throw new Error(`프로파일 생성 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일 목록 조회
     * @param {Object} filters - 필터 조건 (status, profile_type, log_source 등)
     */
    async getProfiles(filters = {}) {
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined)
            );

            const response = await this.client.get('/api/v1/profiles/', { params });
            return response.data;
        } catch (error) {
            console.error('프로파일 목록 조회 실패:', error.message);
            throw new Error(`프로파일 목록 조회 실패: ${error.message}`);
        }
    }

    /**
     * 특정 프로파일 조회
     * @param {string} profileId - 프로파일 ID
     */
    async getProfile(profileId) {
        try {
            const response = await this.client.get(`/api/v1/profiles/${profileId}`);
            return response.data;
        } catch (error) {
            console.error(`프로파일 조회 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 조회 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일 업데이트
     * @param {string} profileId - 프로파일 ID
     * @param {Object} updateData - 업데이트할 데이터
     */
    async updateProfile(profileId, updateData) {
        try {
            console.log('===== 베이스라인 엔진 프로파일 업데이트 요청 =====');
            console.log('프로파일 ID:', profileId);
            console.log('업데이트 데이터 (JSON BODY):', JSON.stringify(updateData, null, 2));
            console.log('===============================================');

            const response = await this.client.put(`/api/v1/profiles/${profileId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`프로파일 업데이트 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 업데이트 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일 상태 업데이트
     * @param {string} profileId - 프로파일 ID
     * @param {string} status - 새 상태 (active, inactive, error)
     * @param {string} reason - 상태 변경 이유
     */
    async updateProfileStatus(profileId, status, reason = null) {
        try {
            const statusData = { status };
            if (reason) {
                statusData.reason = reason;
            }

            const response = await this.client.patch(`/api/v1/profiles/${profileId}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error(`프로파일 상태 업데이트 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 상태 업데이트 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일 진단
     * @param {string} profileId - 프로파일 ID
     */
    async diagnoseProfile(profileId) {
        try {
            const response = await this.client.post(`/api/v1/profiles/${profileId}/diagnose`);
            return response.data;
        } catch (error) {
            console.error(`프로파일 진단 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 진단 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일 삭제
     * @param {string} profileId - 프로파일 ID
     */
    async deleteProfile(profileId) {
        try {
            const response = await this.client.delete(`/api/v1/profiles/${profileId}`);
            // HTTP 204 No Content는 성공으로 처리
            if (response.status === 204 || response.status === 200) {
                console.log(`[BaselineEngine] 프로파일 ${profileId} 삭제 성공 (${response.status})`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`프로파일 삭제 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 삭제 실패: ${error.message}`);
        }
    }

    /**
     * 베이스라인 생성
     * @param {Object} profileConfig - 프로파일 설정 정보
     */
    async createBaseline(profileConfig) {
        try {
            const response = await this.client.post('/api/v1/baselines/create', profileConfig);
            return response.data;
        } catch (error) {
            console.error('베이스라인 생성 실패:', error.message);
            throw new Error(`베이스라인 생성 실패: ${error.message}`);
        }
    }

    /**
     * 수동 베이스라인 생성
     * @param {Array<string>} profileIds - 프로파일 ID 배열
     * @param {boolean} force - 강제 실행 여부 (기본값: false)
     */
    async generateManualBaseline(profileIds, force = false) {
        try {
            const requestData = {
                profile_ids: profileIds,
                force: force
            };
            const response = await this.client.post('/api/v1/baselines/manual', requestData);
            return response.data;
        } catch (error) {
            console.error('수동 베이스라인 생성 실패:', error.message);
            throw new Error(`수동 베이스라인 생성 실패: ${error.message}`);
        }
    }

    /**
     * 베이스라인 생성 작업 상태 조회
     * @param {string} jobId - 작업 ID
     */
    async getBaselineJobStatus(jobId) {
        try {
            const response = await this.client.get(`/api/v1/baselines/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            console.error(`베이스라인 작업 상태 조회 실패 (${jobId}):`, error.message);
            throw new Error(`베이스라인 작업 상태 조회 실패: ${error.message}`);
        }
    }

    /**
     * 베이스라인 실행 이력 조회 (베이스라인 엔진 전용)
     * @param {Object} filters - 필터 조건
     * @param {string} filters.profile_id - 프로파일 ID
     * @param {string} filters.status - 상태 (completed, in_progress, failed)
     * @param {number} filters.limit - 최대 결과 수
     * @param {number} filters.offset - 오프셋
     */
    async getBaselineExecutionHistory(filters = {}) {
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined)
            );

            const response = await this.client.get('/api/v1/baselines/history', { params });
            return response.data;
        } catch (error) {
            console.error('베이스라인 실행 이력 조회 실패:', error.message);
            throw new Error(`베이스라인 실행 이력 조회 실패: ${error.message}`);
        }
    }

    /**
     * 프로파일별 최근 베이스라인 실행 상태 조회
     * @param {string} profileId - 프로파일 ID
     */
    async getProfileBaselineStatus(profileId) {
        try {
            const response = await this.client.get(`/api/v1/profiles/${profileId}/baseline/status`);
            return response.data;
        } catch (error) {
            console.error(`프로파일 베이스라인 상태 조회 실패 (${profileId}):`, error.message);
            throw new Error(`프로파일 베이스라인 상태 조회 실패: ${error.message}`);
        }
    }

    /**
     * 베이스라인 목록 조회
     * @param {string} profileId - 프로파일 ID
     * @param {string} metricName - 메트릭 이름 (선택)
     * @param {number} version - 베이스라인 버전 (선택)
     */
    async getBaselines(profileId, metricName = null, version = null) {
        try {
            const params = {};
            if (metricName) params.metric_name = metricName;
            if (version) params.version = version;

            const response = await this.client.get(`/api/v1/baselines/${profileId}`, { params });
            return response.data;
        } catch (error) {
            console.error(`베이스라인 목록 조회 실패 (${profileId}):`, error.message);
            throw new Error(`베이스라인 목록 조회 실패: ${error.message}`);
        }
    }

    /**
     * 베이스라인 상세 조회
     * @param {string} profileId - 프로파일 ID
     * @param {string} baselineId - 베이스라인 ID
     */
    async getBaselineDetail(profileId, baselineId) {
        try {
            const response = await this.client.get(`/api/v1/baselines/${profileId}/${baselineId}`);
            return response.data;
        } catch (error) {
            console.error(`베이스라인 상세 조회 실패 (${profileId}/${baselineId}):`, error.message);
            throw new Error(`베이스라인 상세 조회 실패: ${error.message}`);
        }
    }

    /**
     * 편차 점수 계산
     * @param {string} profileId - 프로파일 ID
     * @param {string} targetEntity - 대상 엔터티
     * @param {string} calculationDate - 계산 기준일 (선택)
     * @param {Array} metricNames - 메트릭 이름 목록 (선택)
     */
    async calculateDeviationScores(profileId, targetEntity, calculationDate = null, metricNames = null) {
        try {
            const requestData = {
                profile_id: profileId,
                target_entity: targetEntity
            };

            if (calculationDate) requestData.calculation_date = calculationDate;
            if (metricNames) requestData.metric_names = metricNames;

            const response = await this.client.post('/api/v1/deviations/calculate', requestData);
            return response.data;
        } catch (error) {
            console.error('편차 점수 계산 실패:', error.message);
            throw new Error(`편차 점수 계산 실패: ${error.message}`);
        }
    }

    /**
     * 이상치 엔터티 목록 조회
     * @param {string} profileId - 프로파일 ID
     * @param {string} date - 조회 날짜 (선택)
     * @param {number} minScore - 최소 점수 (선택)
     * @param {number} limit - 최대 결과 수 (선택)
     */
    async getAnomalies(profileId, date = null, minScore = 0.7, limit = 50) {
        try {
            const params = { min_score: minScore, limit };
            if (date) params.date = date;

            const response = await this.client.get(`/api/v1/deviations/${profileId}/anomalies`, { params });
            return response.data;
        } catch (error) {
            console.error(`이상치 조회 실패 (${profileId}):`, error.message);
            throw new Error(`이상치 조회 실패: ${error.message}`);
        }
    }
}

/**
 * VPN 프로파일 생성 도우미
 */
class VpnProfileHelper {
        // VPN 관련 메트릭 목록 (실제 베이스라인 엔진 API 기준)
    static VPN_RELEVANT_METRICS = [
        // 시간 기반
        "login_time_pattern",
        "session_duration",
        "after_hours_activity",
        "weekend_holiday_access",
        "login_frequency_change",
        "concurrent_session_detection",
        "timezone_anomaly_access",
        "idle_time_pattern",

        // 네트워크 기반
        "ip_address_pattern",
        "geo_location_analysis",
        "data_volume_transfer",
        "impossible_travel_detection",
        "vpn_usage_pattern",
        "network_device_change",
        "bandwidth_usage_anomaly",
        "connection_pattern_analysis",
        "proxy_bypass_attempt",

        // 접근 기반 (VPN 관련)
        "authentication_failure_count",
        "privilege_escalation_attempt",
        "remote_access_pattern",
        "resource_access_pattern"
    ];

    /**
     * VPN 프로파일 설정 생성
     */
    static createVpnProfileConfig({
        name,
        description = null,
        departments = null,
        userTypes = null,
        selectedMetrics = null,
        learningPeriod = 30,
        alertThreshold = 0.8,
        warningThreshold = 0.6
    }) {
        // 기본값 설정
        if (!description) {
            description = `${name} - VPN 접속 패턴 및 네트워크 행동 분석`;
        }

        if (!departments) {
            departments = ["IT", "Finance", "HR", "Sales", "Engineering"];
        }

        if (!userTypes) {
            userTypes = ["employee", "contractor", "admin"];
        }

        if (!selectedMetrics) {
            selectedMetrics = [
                "login_time_pattern",
                "session_duration",
                "vpn_usage_pattern",
                "geo_location_analysis",
                "impossible_travel_detection",
                "network_device_change"
            ];
        }

        return {
            name,
            description,
            profile_type: "user",
            analysis_scope: "network_access",
            log_source: "vpn",
            learning_period: learningPeriod,
            selected_metrics: selectedMetrics,
            threshold_settings: {
                alert_threshold: alertThreshold,
                warning_threshold: warningThreshold,
                minimum_deviation_score: 0.3
            },
            target_entities: {
                departments,
                user_types: userTypes
            }
        };
    }

    /**
     * VPN 메트릭 선택 유효성 검증
     */
    static validateVpnMetrics(selectedMetrics) {
        // VPN에 적합하지 않은 메트릭들
        const vpnIncompatible = [
            "database_query_pattern",
            "email_behavior_pattern",
            "system_command_execution",
            "shared_folder_access",
            "application_usage_pattern"
        ];

        const invalidMetrics = selectedMetrics.filter(m => vpnIncompatible.includes(m));
        const missingEssential = [];

        // 필수 메트릭 체크
        const essentialMetrics = ["login_time_pattern", "session_duration", "vpn_usage_pattern"];
        for (const essential of essentialMetrics) {
            if (!selectedMetrics.includes(essential)) {
                missingEssential.push(essential);
            }
        }

        const warnings = [];
        const recommendations = [];

        if (invalidMetrics.length > 0) {
            warnings.push(`VPN 로그에 적합하지 않은 메트릭: ${invalidMetrics.join(', ')}`);
            recommendations.push("VPN 로그에 적합한 메트릭으로 변경하세요");
        }

        if (missingEssential.length > 0) {
            warnings.push(`필수 메트릭 누락: ${missingEssential.join(', ')}`);
            recommendations.push("VPN 분석을 위한 필수 메트릭을 추가하세요");
        }

        if (selectedMetrics.length < 3) {
            warnings.push("선택된 메트릭이 너무 적습니다");
            recommendations.push("최소 3개 이상의 메트릭을 선택하세요");
        }

        return {
            is_valid: invalidMetrics.length === 0 && missingEssential.length === 0,
            warnings,
            recommendations,
            invalid_metrics: invalidMetrics,
            missing_essential: missingEssential
        };
    }
}

module.exports = {
    BaselineEngineAPIClient,
    VpnProfileHelper
};
