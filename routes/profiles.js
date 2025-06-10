/**
 * routes/profiles.js - 프로파일 관리 API 라우트
 * 베이스라인 엔진 API로 프록시하여 통합 관리
 */

const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { BaselineEngineAPIClient } = require('../services/baseline-engine-client');
const fetch = require('node-fetch');

// 베이스라인 엔진 클라이언트 인스턴스 생성
const baselineClient = new BaselineEngineAPIClient(
    process.env.BASELINE_ENGINE_URL || 'http://localhost:8000'
);

// 한글-영어 메트릭 이름 매핑
const METRIC_TRANSLATION_MAP = {
    // 시간 기반 메트릭
    '로그인 시간 패턴': 'login_time_pattern',
    '세션 지속 시간': 'session_duration',
    '업무시간 외 활동': 'after_hours_activity',
    '주말/휴일 접근': 'weekend_holiday_access',
    '로그인 빈도 변화': 'login_frequency_change',
    '동시 세션 탐지': 'concurrent_session_detection',
    '시간대 이상 접근': 'timezone_anomaly_access',
    '유휴 시간 패턴': 'idle_time_pattern',

    // 네트워크 기반 메트릭
    'IP 주소 패턴': 'ip_address_pattern',
    '지리적 위치 분석': 'geo_location_analysis',
    '데이터 전송량': 'data_volume_transfer',
    '불가능한 이동 탐지': 'impossible_travel_detection',
    'VPN 사용 패턴': 'vpn_usage_pattern',
    '디바이스 변경 탐지': 'network_device_change',
    '대역폭 사용량 이상': 'bandwidth_usage_anomaly',
    '연결 패턴 분석': 'connection_pattern_analysis',
    '프록시 우회 시도': 'proxy_bypass_attempt',

    // 접근 기반 메트릭
    '인증 실패 횟수': 'authentication_failure_count',
    '권한 상승 시도': 'privilege_escalation_attempt',
    '원격 접근 패턴': 'remote_access_pattern',
    '리소스 접근 패턴': 'resource_access_pattern',
    '민감한 데이터 접근': 'sensitive_data_access',
    '파일 다운로드 패턴': 'file_download_pattern',
    '관리자 권한 사용': 'admin_privilege_usage',
    '애플리케이션 사용 패턴': 'application_usage_pattern',
    '데이터베이스 쿼리 패턴': 'database_query_pattern',
    '이메일 행동 패턴': 'email_behavior_pattern',
    '시스템 명령어 실행': 'system_command_execution',
    '공유 폴더 접근': 'shared_folder_access'
};

// 한글 메트릭을 영어로 변환하는 함수
function translateMetricsToEnglish(koreanMetrics) {
    if (!Array.isArray(koreanMetrics)) {
        return [];
    }

    console.log('=== 서버 측 메트릭 번역 디버깅 ===');
    console.log('입력 메트릭 (한글):', koreanMetrics);

    const translatedMetrics = koreanMetrics.map(metric => {
        const englishMetric = METRIC_TRANSLATION_MAP[metric];
        if (englishMetric) {
            console.log(`번역 성공: "${metric}" → "${englishMetric}"`);
            return englishMetric;
        } else {
            console.warn(`알 수 없는 메트릭: ${metric}`);
            return metric; // 영어 메트릭명일 수도 있으므로 그대로 반환
        }
    }).filter(metric => metric); // 빈 값 제거

    console.log('번역된 메트릭 (영문):', translatedMetrics);
    console.log('===========================');

    return translatedMetrics;
}

/**
 * GET /api/profiles - 모든 프로파일 조회 (베이스라인 엔진 프록시)
 */
router.get('/', async (req, res) => {
  try {
    // 먼저 베이스라인 엔진에서 프로파일 조회 시도
    try {
      const filters = {
        status: req.query.status,
        profile_type: req.query.profile_type,
        log_source: req.query.log_source
      };

      const baselineData = await baselineClient.getProfiles(filters);

      console.log('===== 베이스라인 엔진 응답 구조 분석 =====');
      console.log('전체 응답:', JSON.stringify(baselineData, null, 2));
      console.log('응답 타입:', typeof baselineData);
      console.log('키 목록:', baselineData ? Object.keys(baselineData) : 'null');
      console.log('==========================================');

      // 베이스라인 엔진 응답을 기존 API 형식에 맞게 변환
      if (baselineData) {
        // 다양한 응답 구조 대응
        let profiles = [];
        let count = 0;

        if (Array.isArray(baselineData)) {
          // 응답이 배열인 경우
          profiles = baselineData;
          count = baselineData.length;
        } else if (baselineData.profiles && Array.isArray(baselineData.profiles)) {
          // { profiles: [...], count: X } 구조인 경우
          profiles = baselineData.profiles;
          count = baselineData.count || baselineData.profiles.length;
        } else if (baselineData.data && Array.isArray(baselineData.data)) {
          // { data: [...] } 구조인 경우
          profiles = baselineData.data;
          count = baselineData.data.length;
        } else if (baselineData.results && Array.isArray(baselineData.results)) {
          // { results: [...] } 구조인 경우
          profiles = baselineData.results;
          count = baselineData.results.length;
        }

        console.log(`베이스라인 엔진에서 ${count}개 프로파일 조회 성공`);
        return res.json(profiles);
      }
    } catch (baselineError) {
      console.warn('베이스라인 엔진 연결 실패, 로컬 데이터베이스로 폴백:', baselineError.message);
    }

    // 베이스라인 엔진 실패 시 로컬 데이터베이스 사용 (폴백)
    const result = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
    console.log(`로컬 데이터베이스에서 ${result.rows.length}개 프로파일 조회 (폴백)`);
    res.json(result.rows);
  } catch (err) {
    console.error('프로파일 조회 오류:', err);
    res.status(500).json({ error: '프로파일 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/profiles/:id - 특정 프로파일 조회 (베이스라인 엔진 프록시)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 먼저 베이스라인 엔진에서 프로파일 조회 시도
    try {
      const baselineData = await baselineClient.getProfile(id);
      if (baselineData) {
        console.log(`베이스라인 엔진에서 프로파일 ${id} 조회 성공`);
        return res.json(baselineData);
      }
    } catch (baselineError) {
      console.warn(`베이스라인 엔진에서 프로파일 ${id} 조회 실패, 로컬 데이터베이스로 폴백:`, baselineError.message);
    }

    // 베이스라인 엔진 실패 시 로컬 데이터베이스 사용 (폴백)
    const result = await db.query('SELECT * FROM profiles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일을 찾을 수 없습니다.' });
    }

    console.log(`로컬 데이터베이스에서 프로파일 ${id} 조회 (폴백)`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 조회 오류:', err);
    res.status(500).json({ error: '프로파일 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/profiles - 새 프로파일 생성 (베이스라인 엔진 프록시)
 */
router.post('/', async (req, res) => {
  try {
    const {
      id, name, profileType, analysisScope, logSourceName, logSourceType, description, ...otherData
    } = req.body;

        console.log('===== 프로파일 생성 요청 상세 정보 =====');
    console.log('기본 필드:', { id, name, profileType, analysisScope, logSourceName, logSourceType, description });
    console.log('기타 데이터 (otherData):', JSON.stringify(otherData, null, 2));

    // 한글 메트릭을 영어로 변환
    const koreanMetrics = otherData.selectedMetrics || [];
    const englishMetrics = translateMetricsToEnglish(koreanMetrics);

    console.log('메트릭 변환:', {
      original: koreanMetrics,
      translated: englishMetrics
    });

        // 이상징후 민감도를 수치값으로 변환
    function mapAnomalyThresholdToNumeric(sensitivityText) {
      const sensitivityMap = {
        "낮음 (관대함)": { alert_threshold: 0.9, warning_threshold: 0.7, minimum_deviation_score: 0.5 },
        "보통 (권장)": { alert_threshold: 0.8, warning_threshold: 0.6, minimum_deviation_score: 0.3 },
        "높음 (민감함)": { alert_threshold: 0.6, warning_threshold: 0.4, minimum_deviation_score: 0.2 }
      };

      // 텍스트에서 키워드 추출
      if (sensitivityText.includes('낮음') || sensitivityText.includes('관대')) {
        return sensitivityMap["낮음 (관대함)"];
      } else if (sensitivityText.includes('높음') || sensitivityText.includes('민감')) {
        return sensitivityMap["높음 (민감함)"];
      } else {
        return sensitivityMap["보통 (권장)"]; // 기본값
      }
    }

    // threshold_settings 구성 - 수치화된 임계값 사용
    const sensitivityValues = mapAnomalyThresholdToNumeric(otherData.anomalyThreshold || "보통 (권장)");
    const thresholdSettings = {
      alert_threshold: sensitivityValues.alert_threshold,
      warning_threshold: sensitivityValues.warning_threshold,
      minimum_deviation_score: sensitivityValues.minimum_deviation_score,
      risk_score_threshold: parseInt(otherData.riskScore) || 70
    };

    // 알림 설정 구성
    const notificationSettings = {
      email_enabled: otherData.alerts?.includes("이메일 알림") || false,
      slack_enabled: otherData.alerts?.includes("Slack 알림") || false,
      sms_enabled: otherData.alerts?.includes("SMS 알림") || false,
      dashboard_enabled: otherData.alerts?.includes("대시보드 표시") || false
    };

    // 분석 범위 매핑 (프론트엔드 → 베이스라인 엔진) - 고정값
    function mapAnalysisScope(frontendScope) {
      const scopeMap = {
        'department': 'department',        // 부서별 → 부서별
        'role': 'user_activity',          // 역할별 → 사용자 활동 분석
        'global': 'organizational'        // 전체 조직 → 조직 단위 분석
      };
      return scopeMap[frontendScope] || 'department';
    }

    // 베이스라인 엔진 형식으로 데이터 변환
    const mappedAnalysisScope = mapAnalysisScope(analysisScope);
    const profileData = {
      name: name,
      description: description,
      profile_type: profileType || 'user',
      analysis_scope: mappedAnalysisScope,
      log_source: logSourceType || 'syslog',
      learning_period: 30,
      selected_metrics: englishMetrics,
      threshold_settings: thresholdSettings,
      notification_settings: notificationSettings
    };

    console.log(`분석 범위 매핑: ${analysisScope} → ${mappedAnalysisScope}`);

    console.log('===== 최종 베이스라인 엔진 JSON BODY =====');
    console.log('threshold_settings:', JSON.stringify(profileData.threshold_settings, null, 2));
    console.log('notification_settings:', JSON.stringify(profileData.notification_settings, null, 2));
    console.log('완전한 JSON BODY:', JSON.stringify(profileData, null, 2));
    console.log('=========================================');

    // 먼저 베이스라인 엔진에서 프로파일 생성 시도
    try {
      const baselineData = await baselineClient.createProfile(profileData);
      if (baselineData) {
        console.log(`베이스라인 엔진에서 프로파일 '${name}' 생성 성공`);
        return res.status(201).json(baselineData);
      }
    } catch (baselineError) {
      console.warn(`베이스라인 엔진에서 프로파일 생성 실패, 로컬 데이터베이스로 폴백:`, baselineError.message);
    }

    // 베이스라인 엔진 실패 시 로컬 데이터베이스 사용 (폴백)
    const data = { ...otherData };

    const result = await db.query(
      `INSERT INTO profiles
       (id, name, profile_type, analysis_scope, log_source_name, log_source_type, description, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, profileType, analysisScope, logSourceName, logSourceType, description, JSON.stringify(data)]
    );

    // 프로필 상태 초기화
    await db.query(
      `INSERT INTO profile_status (profile_id, status) VALUES ($1, 'stopped')`,
      [id]
    );

    console.log(`로컬 데이터베이스에서 프로파일 '${name}' 생성 완료 (폴백):`, result.rows[0]);

    // 응답이 비어있는 경우 기본 응답 제공
    if (!result.rows || result.rows.length === 0) {
      return res.status(201).json({
        id,
        name,
        profile_type: profileType,
        analysis_scope: analysisScope,
        log_source_name: logSourceName,
        log_source_type: logSourceType,
        description,
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 생성 오류:', err);
    res.status(500).json({ error: '프로파일 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * PUT /api/profiles/:id - 프로파일 업데이트 (베이스라인 엔진 프록시)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, profileType, analysisScope, logSourceName, logSourceType, description, ...otherData
    } = req.body;

    console.log('===== 프로파일 업데이트 상세 정보 =====');
    console.log('프로파일 ID:', id);
    console.log('기본 필드:', { name, profileType, analysisScope, logSourceName, logSourceType, description });
    console.log('기타 데이터 (otherData):', JSON.stringify(otherData, null, 2));

    // 한글 메트릭을 영어로 변환
    const koreanMetrics = otherData.selectedMetrics || [];
    const englishMetrics = translateMetricsToEnglish(koreanMetrics);

    // 학습기간 설정 (숫자로 변환)
    const learningPeriod = parseInt(otherData.learningPeriod) || parseInt(otherData.learning_period) || 30;

    // 이상징후 민감도를 수치값으로 변환 (생성 시와 동일한 로직)
    function mapAnomalyThresholdToNumeric(sensitivityText) {
      const sensitivityMap = {
        "낮음 (관대함)": { alert_threshold: 0.9, warning_threshold: 0.7, minimum_deviation_score: 0.5 },
        "보통 (권장)": { alert_threshold: 0.8, warning_threshold: 0.6, minimum_deviation_score: 0.3 },
        "높음 (민감함)": { alert_threshold: 0.6, warning_threshold: 0.4, minimum_deviation_score: 0.2 }
      };

      if (sensitivityText && sensitivityText.includes('낮음') || sensitivityText && sensitivityText.includes('관대')) {
        return sensitivityMap["낮음 (관대함)"];
      } else if (sensitivityText && sensitivityText.includes('높음') || sensitivityText && sensitivityText.includes('민감')) {
        return sensitivityMap["높음 (민감함)"];
      } else {
        return sensitivityMap["보통 (권장)"]; // 기본값
      }
    }

    // threshold_settings 구성 (기존 설정 또는 새로운 설정)
    let thresholdSettings;
    if (otherData.threshold_settings) {
      // 이미 베이스라인 엔진 형식으로 구성된 경우
      thresholdSettings = otherData.threshold_settings;
    } else {
      // 프론트엔드 형식에서 베이스라인 엔진 형식으로 변환
      const sensitivityValues = mapAnomalyThresholdToNumeric(otherData.anomalyThreshold || "보통 (권장)");
      thresholdSettings = {
        alert_threshold: sensitivityValues.alert_threshold,
        warning_threshold: sensitivityValues.warning_threshold,
        minimum_deviation_score: sensitivityValues.minimum_deviation_score,
        risk_score_threshold: parseInt(otherData.riskScore) || 70
      };
    }

    // notification_settings 구성 (기존 설정 또는 새로운 설정)
    let notificationSettings;
    if (otherData.notification_settings) {
      // 이미 베이스라인 엔진 형식으로 구성된 경우
      notificationSettings = otherData.notification_settings;
    } else {
      // 프론트엔드 형식에서 베이스라인 엔진 형식으로 변환
      notificationSettings = {
        email_enabled: otherData.alerts?.includes("이메일 알림") || false,
        slack_enabled: otherData.alerts?.includes("Slack 알림") || false,
        sms_enabled: otherData.alerts?.includes("SMS 알림") || false,
        dashboard_enabled: otherData.alerts?.includes("대시보드 표시") || false
      };
    }

    // 분석 범위 매핑 (프론트엔드 → 베이스라인 엔진) - 고정값
    function mapAnalysisScope(frontendScope) {
      const scopeMap = {
        'department': 'department',        // 부서별 → 부서별
        'role': 'user_activity',          // 역할별 → 사용자 활동 분석
        'global': 'organizational'        // 전체 조직 → 조직 단위 분석
      };
      return scopeMap[frontendScope] || 'department';
    }

    // 베이스라인 엔진 형식으로 완전한 데이터 변환
    const mappedAnalysisScope = mapAnalysisScope(analysisScope);
    const updateData = {
      name: name,
      description: description,
      profile_type: profileType || 'user',
      analysis_scope: mappedAnalysisScope,
      log_source: logSourceType || 'vpn',
      learning_period: learningPeriod,
      target_entities: otherData.target_entities,
      selected_metrics: englishMetrics,
      threshold_settings: thresholdSettings,
      notification_settings: notificationSettings
    };

    console.log('===== 완전한 업데이트 데이터 =====');
    console.log('학습기간:', learningPeriod);
    console.log('threshold_settings:', JSON.stringify(thresholdSettings, null, 2));
    console.log('notification_settings:', JSON.stringify(notificationSettings, null, 2));
    console.log('완전한 UPDATE JSON BODY:', JSON.stringify(updateData, null, 2));
    console.log('=================================');

    // 먼저 베이스라인 엔진에서 프로파일 업데이트 시도
    try {
      const baselineData = await baselineClient.updateProfile(id, updateData);
      if (baselineData) {
        console.log(`베이스라인 엔진에서 프로파일 ${id} 업데이트 성공`);
        return res.json(baselineData);
      }
    } catch (baselineError) {
      console.warn(`베이스라인 엔진에서 프로파일 ${id} 업데이트 실패, 로컬 데이터베이스로 폴백:`, baselineError.message);
    }

    // 베이스라인 엔진 실패 시 로컬 데이터베이스 사용 (폴백)
    const data = { ...otherData };

    const result = await db.query(
      `UPDATE profiles
       SET name = $1, profile_type = $2, analysis_scope = $3,
           log_source_name = $4, log_source_type = $5, description = $6,
           data = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, profileType, analysisScope, logSourceName, logSourceType, description, JSON.stringify(data), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일을 찾을 수 없습니다.' });
    }

    console.log(`로컬 데이터베이스에서 프로파일 ${id} 업데이트 완료 (폴백)`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 업데이트 오류:', err);
    res.status(500).json({ error: '프로파일 업데이트 중 오류가 발생했습니다.' });
  }
});

/**
 * DELETE /api/profiles/:id - 프로파일 삭제 (베이스라인 엔진 프록시)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 먼저 베이스라인 엔진에서 프로파일 삭제 시도
    try {
      const success = await baselineClient.deleteProfile(id);
      if (success) {
        console.log(`베이스라인 엔진에서 프로파일 ${id} 삭제 성공`);
        return res.json({ message: '프로파일이 삭제되었습니다.', profile_id: id });
      }
    } catch (baselineError) {
      console.warn(`베이스라인 엔진에서 프로파일 ${id} 삭제 실패, 로컬 데이터베이스로 폴백:`, baselineError.message);
    }

    // 베이스라인 엔진 실패 시 로컬 데이터베이스 사용 (폴백)
    const result = await db.query('DELETE FROM profiles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일을 찾을 수 없습니다.' });
    }

    console.log(`로컬 데이터베이스에서 프로파일 ${id} 삭제 완료 (폴백)`);
    res.json({ message: '프로파일이 삭제되었습니다.', profile: result.rows[0] });
  } catch (err) {
    console.error('프로파일 삭제 오류:', err);
    res.status(500).json({ error: '프로파일 삭제 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/profiles/baseline/manual - 수동 베이스라인 생성
 * 특정 프로파일에 대해 수동으로 베이스라인을 생성합니다.
 */
router.post('/baseline/manual', async (req, res) => {
  try {
    const { profileId, profileIds, force = false } = req.body;

    console.log('===== 수동 베이스라인 생성 요청 =====');
    console.log('단일 프로파일 ID:', profileId);
    console.log('다중 프로파일 IDs:', profileIds);
    console.log('강제 실행:', force);

    // 프로파일 ID 배열 구성 (단일 또는 다중 지원)
    let targetProfileIds = [];
    if (profileId) {
      targetProfileIds = [profileId];
    } else if (profileIds && Array.isArray(profileIds)) {
      targetProfileIds = profileIds;
    } else {
      return res.status(400).json({ error: '프로파일 ID 또는 프로파일 ID 배열이 필요합니다.' });
    }

    if (targetProfileIds.length === 0) {
      return res.status(400).json({ error: '최소 하나의 프로파일 ID가 필요합니다.' });
    }

    console.log('대상 프로파일 IDs:', targetProfileIds);

            // 베이스라인 엔진 API 호출 시도
    try {
      const jobs = await baselineClient.generateManualBaseline(targetProfileIds, force);
      console.log('베이스라인 엔진에서 수동 베이스라인 생성 성공:', jobs);

      // jobs 배열 응답 처리
      if (Array.isArray(jobs) && jobs.length > 0) {
        return res.status(201).json({
          success: true,
          message: '베이스라인 생성이 시작되었습니다.',
          jobs: jobs,
          count: jobs.length,
          estimatedDuration: '15-30분'
        });
      } else {
        throw new Error('베이스라인 엔진에서 유효한 작업이 생성되지 않았습니다.');
      }
    } catch (baselineError) {
      console.warn('베이스라인 엔진 API 호출 실패:', baselineError.message);

      // 베이스라인 엔진이 응답하지 않는 경우 시뮬레이션 응답
      const simulatedJobs = targetProfileIds.map(id => {
        const jobId = `manual_baseline_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        return {
          job_id: jobId,
          profile_id: id,
          status: 'in_progress',
          created_at: new Date().toISOString(),
          estimated_duration: '15-30분'
        };
      });

      console.log(`베이스라인 생성 시뮬레이션 시작 (${simulatedJobs.length}개 작업)`);

      // 베이스라인 엔진이 사용 불가능한 경우 시뮬레이션으로 처리
      console.log(`베이스라인 생성 시뮬레이션 시작 (${simulatedJobs.length}개 작업) - 베이스라인 엔진만 사용`);
      // 로컬 DB 저장 없이 베이스라인 엔진 응답만 반환

      return res.status(201).json({
        success: true,
        message: '베이스라인 생성이 시작되었습니다. (시뮬레이션 모드)',
        jobs: simulatedJobs,
        count: simulatedJobs.length,
        estimatedDuration: '15-30분',
        simulation: true
      });
    }

    // 예상치 못한 경우
    throw new Error('베이스라인 생성 요청 처리 중 예상치 못한 오류가 발생했습니다.');

  } catch (err) {
    console.error('수동 베이스라인 생성 오류:', err);
    res.status(500).json({
      error: '베이스라인 생성 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/baseline/jobs/:jobId - 베이스라인 생성 작업 상태 조회
 */
router.get('/baseline/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log(`베이스라인 작업 상태 조회: ${jobId}`);

    // 베이스라인 엔진에서 작업 상태 조회 시도
    try {
      const result = await baselineClient.getBaselineJobStatus(jobId);
      console.log('베이스라인 엔진에서 작업 상태 조회 성공:', result);
      return res.json(result);
    } catch (baselineError) {
      console.warn('베이스라인 엔진 작업 상태 조회 실패:', baselineError.message);

      // 베이스라인 엔진에서 작업 상태를 찾을 수 없는 경우 기본 응답 반환
      return res.status(404).json({
        error: '베이스라인 엔진에서 작업 상태를 조회할 수 없습니다.',
        job_id: jobId,
        details: '베이스라인 엔진의 작업 상태 조회 API가 아직 구현되지 않았을 수 있습니다.',
        suggestion: '베이스라인 생성은 백그라운드에서 진행되며, 프로파일 목록에서 베이스라인 상태를 확인하세요.'
      });
    }

  } catch (err) {
    console.error('베이스라인 작업 상태 조회 오류:', err);
    res.status(500).json({
      error: '작업 상태 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/baseline/history - 베이스라인 실행 이력 조회
 */
router.get('/baseline/history', async (req, res) => {
  try {
    const { profile_id, status, limit = 50, offset = 0 } = req.query;

    console.log('베이스라인 실행 이력 조회:', { profile_id, status, limit, offset });

    // 베이스라인 엔진에서 실행 이력 조회 시도
    try {
      const filters = {};
      if (profile_id) filters.profile_id = profile_id;
      if (status) filters.status = status;
      filters.limit = parseInt(limit);
      filters.offset = parseInt(offset);

      const result = await baselineClient.getBaselineExecutionHistory(filters);
      console.log('베이스라인 엔진에서 실행 이력 조회 성공');
      return res.json(result);
    } catch (baselineError) {
      console.warn('베이스라인 엔진 실행 이력 조회 실패:', baselineError.message);
    }

    // 베이스라인 엔진에서 이력을 가져올 수 없는 경우 안내 메시지 반환
    res.json({
      success: false,
      message: '베이스라인 엔진에서 실행 이력을 조회할 수 없습니다.',
      details: '베이스라인 엔진의 실행 이력 API가 아직 구현되지 않았을 수 있습니다.',
      suggestion: '각 프로파일의 베이스라인 상태는 프로파일 목록에서 확인하실 수 있습니다.',
      history: [],
      total: 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (err) {
    console.error('베이스라인 실행 이력 조회 오류:', err);
    res.status(500).json({
      error: '실행 이력 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/baseline/status - 프로파일별 베이스라인 상태 조회
 */
router.get('/:id/baseline/status', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`프로파일 ${id}의 베이스라인 상태 조회`);

    // 베이스라인 엔진에서 프로파일 베이스라인 상태 조회 시도
    try {
      const result = await baselineClient.getProfileBaselineStatus(id);
      console.log('베이스라인 엔진에서 프로파일 베이스라인 상태 조회 성공');
      return res.json(result);
    } catch (baselineError) {
      console.warn('베이스라인 엔진 프로파일 베이스라인 상태 조회 실패:', baselineError.message);

      // 베이스라인 엔진에서 상태를 조회할 수 없는 경우 기본 응답 반환
      return res.json({
        profile_id: id,
        message: '베이스라인 엔진에서 프로파일 상태를 조회할 수 없습니다.',
        details: '베이스라인 엔진의 프로파일 상태 조회 API가 아직 구현되지 않았을 수 있습니다.',
        suggestion: '프로파일 목록에서 전체 프로파일 정보를 확인하세요.',
        latest_baseline: null,
        source: 'baseline_engine_unavailable'
      });
    }

  } catch (err) {
    console.error('프로파일 베이스라인 상태 조회 오류:', err);
    res.status(500).json({
      error: '프로파일 베이스라인 상태 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/baseline/results - 프로파일별 베이스라인 분석 결과 조회
 */
router.get('/:id/baseline/results', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`프로파일 ${id}의 베이스라인 분석 결과 조회`);

    // 베이스라인 엔진에서 베이스라인 목록 조회
    try {
      const baselinesResult = await baselineClient.getBaselines(id);
      console.log('베이스라인 목록 조회 성공:', baselinesResult);

      // 베이스라인이 있는 경우 추가 정보 수집
      if (baselinesResult && (Array.isArray(baselinesResult) ? baselinesResult.length > 0 : baselinesResult.baselines && baselinesResult.baselines.length > 0)) {
        const baselines = Array.isArray(baselinesResult) ? baselinesResult : baselinesResult.baselines;

        // 각 베이스라인의 상세 정보 조회 (최대 5개)
        const detailPromises = baselines.slice(0, 5).map(baseline => {
          const baselineId = baseline.id || baseline.baseline_id;
          if (baselineId) {
            return baselineClient.getBaselineDetail(id, baselineId).catch(error => {
              console.warn(`베이스라인 상세 조회 실패 (${baselineId}):`, error.message);
              return null;
            });
          }
          return Promise.resolve(null);
        });

        const baselineDetails = await Promise.all(detailPromises);
        const validDetails = baselineDetails.filter(detail => detail !== null);

        // 이상치 조회
        let anomalies = null;
        try {
          anomalies = await baselineClient.getAnomalies(id, null, 0.7, 20);
          console.log('이상치 조회 성공');
        } catch (anomalyError) {
          console.warn('이상치 조회 실패:', anomalyError.message);
        }

        return res.json({
          profile_id: id,
          baselines: baselines,
          baseline_details: validDetails,
          anomalies: anomalies,
          summary: {
            total_baselines: baselines.length,
            detailed_baselines: validDetails.length,
            anomaly_count: anomalies ? (Array.isArray(anomalies) ? anomalies.length : anomalies.anomalies ? anomalies.anomalies.length : 0) : 0
          },
          source: 'baseline_engine'
        });
      } else {
        // 베이스라인이 없는 경우
        return res.json({
          profile_id: id,
          baselines: [],
          baseline_details: [],
          anomalies: null,
          summary: {
            total_baselines: 0,
            detailed_baselines: 0,
            anomaly_count: 0
          },
          message: '생성된 베이스라인이 없습니다. 베이스라인 생성을 먼저 실행해주세요.',
          source: 'baseline_engine'
        });
      }

    } catch (baselineError) {
      console.warn('베이스라인 엔진 분석 결과 조회 실패:', baselineError.message);

      return res.json({
        profile_id: id,
        baselines: [],
        baseline_details: [],
        anomalies: null,
        summary: {
          total_baselines: 0,
          detailed_baselines: 0,
          anomaly_count: 0
        },
        message: '베이스라인 엔진에서 분석 결과를 조회할 수 없습니다.',
        error: baselineError.message,
        source: 'baseline_engine_error'
      });
    }

  } catch (err) {
    console.error('프로파일 베이스라인 분석 결과 조회 오류:', err);
    res.status(500).json({
      error: '베이스라인 분석 결과 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * POST /api/profiles/:id/baseline/deviation - 프로파일별 편차 점수 계산
 */
router.post('/:id/baseline/deviation', async (req, res) => {
  try {
    const { id } = req.params;
    const { target_entity, calculation_date, metric_names } = req.body;

    console.log(`프로파일 ${id}의 편차 점수 계산:`, { target_entity, calculation_date, metric_names });

    if (!target_entity) {
      return res.status(400).json({
        error: '대상 엔터티(target_entity)가 필요합니다.',
        example: { target_entity: 'user001' }
      });
    }

    // 베이스라인 엔진에서 편차 점수 계산
    try {
      const deviationResult = await baselineClient.calculateDeviationScores(
        id,
        target_entity,
        calculation_date,
        metric_names
      );

      console.log('편차 점수 계산 성공');
      return res.json({
        profile_id: id,
        target_entity: target_entity,
        calculation_date: calculation_date || new Date().toISOString().split('T')[0],
        deviation_scores: deviationResult,
        source: 'baseline_engine'
      });

    } catch (baselineError) {
      console.warn('베이스라인 엔진 편차 점수 계산 실패:', baselineError.message);

      return res.status(500).json({
        error: '베이스라인 엔진에서 편차 점수를 계산할 수 없습니다.',
        details: baselineError.message,
        profile_id: id,
        target_entity: target_entity
      });
    }

  } catch (err) {
    console.error('편차 점수 계산 오류:', err);
    res.status(500).json({
      error: '편차 점수 계산 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/timeline - 프로파일 활동 추이 시계열 데이터 조회
 */
router.get('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'daily', days = 30 } = req.query;

    console.log(`프로파일 ${id}의 활동 추이 조회 (${period}, ${days}일)`);

    // 베이스라인 엔진에서 활동 추이 데이터 조회
    try {
      const baselineEngineUrl = process.env.BASELINE_ENGINE_URL || 'http://localhost:8000';
      const timelineResponse = await fetch(`${baselineEngineUrl}/api/v1/profiles/${id}/timeline?period=${period}&days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        console.log('활동 추이 데이터 조회 성공');
        return res.json(timelineData);
      } else {
        throw new Error(`HTTP ${timelineResponse.status}`);
      }

    } catch (baselineError) {
      console.warn('베이스라인 엔진 활동 추이 조회 실패:', baselineError.message);

      return res.status(500).json({
        error: '활동 추이 데이터를 조회할 수 없습니다.',
        details: baselineError.message,
        profile_id: id,
        requested_period: period,
        requested_days: days
      });
    }

  } catch (err) {
    console.error('활동 추이 조회 오류:', err);
    res.status(500).json({
      error: '활동 추이 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/hourly-patterns - 프로파일 시간대별 패턴 분석 조회
 */
router.get('/:id/hourly-patterns', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`프로파일 ${id}의 시간대별 패턴 조회`);

    // 베이스라인 엔진에서 시간대별 패턴 데이터 조회
    try {
      const baselineEngineUrl = process.env.BASELINE_ENGINE_URL || 'http://localhost:8000';
      const patternsResponse = await fetch(`${baselineEngineUrl}/api/v1/profiles/${id}/hourly-patterns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();
        console.log('시간대별 패턴 데이터 조회 성공');
        return res.json(patternsData);
      } else {
        throw new Error(`HTTP ${patternsResponse.status}`);
      }

    } catch (baselineError) {
      console.warn('베이스라인 엔진 시간대별 패턴 조회 실패:', baselineError.message);

      return res.status(500).json({
        error: '시간대별 패턴 데이터를 조회할 수 없습니다.',
        details: baselineError.message,
        profile_id: id
      });
    }

  } catch (err) {
    console.error('시간대별 패턴 조회 오류:', err);
    res.status(500).json({
      error: '시간대별 패턴 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/anomalies/timeline - 프로파일 이상치 시계열 분석 조회
 */
router.get('/:id/anomalies/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    console.log(`프로파일 ${id}의 이상치 시계열 조회 (${days}일)`);

    // 베이스라인 엔진에서 이상치 시계열 데이터 조회
    try {
      const baselineEngineUrl = process.env.BASELINE_ENGINE_URL || 'http://localhost:8000';
      const anomalyTimelineResponse = await fetch(`${baselineEngineUrl}/api/v1/profiles/${id}/anomalies/timeline?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (anomalyTimelineResponse.ok) {
        const anomalyTimelineData = await anomalyTimelineResponse.json();
        console.log('이상치 시계열 데이터 조회 성공');
        return res.json(anomalyTimelineData);
      } else {
        throw new Error(`HTTP ${anomalyTimelineResponse.status}`);
      }

    } catch (baselineError) {
      console.warn('베이스라인 엔진 이상치 시계열 조회 실패:', baselineError.message);

      return res.status(500).json({
        error: '이상치 시계열 데이터를 조회할 수 없습니다.',
        details: baselineError.message,
        profile_id: id,
        requested_days: days
      });
    }

  } catch (err) {
    console.error('이상치 시계열 조회 오류:', err);
    res.status(500).json({
      error: '이상치 시계열 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

/**
 * GET /api/profiles/:id/quality-trends - 프로파일 품질 추이 분석 조회
 */
router.get('/:id/quality-trends', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`프로파일 ${id}의 품질 추이 조회`);

    // 베이스라인 엔진에서 품질 추이 데이터 조회
    try {
      const baselineEngineUrl = process.env.BASELINE_ENGINE_URL || 'http://localhost:8000';
      const qualityTrendsResponse = await fetch(`${baselineEngineUrl}/api/v1/profiles/${id}/quality-trends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (qualityTrendsResponse.ok) {
        const qualityTrendsData = await qualityTrendsResponse.json();
        console.log('품질 추이 데이터 조회 성공');
        return res.json(qualityTrendsData);
      } else {
        throw new Error(`HTTP ${qualityTrendsResponse.status}`);
      }

    } catch (baselineError) {
      console.warn('베이스라인 엔진 품질 추이 조회 실패:', baselineError.message);

      return res.status(500).json({
        error: '품질 추이 데이터를 조회할 수 없습니다.',
        details: baselineError.message,
        profile_id: id
      });
    }

  } catch (err) {
    console.error('품질 추이 조회 오류:', err);
    res.status(500).json({
      error: '품질 추이 조회 중 오류가 발생했습니다.',
      details: err.message
    });
  }
});

module.exports = router;
