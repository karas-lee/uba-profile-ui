# 베이스라인 엔진 API 구현 요청사항

## 개요
UBA 프로파일 UI에서 실제 베이스라인 분석 결과를 표시하기 위해 베이스라인 엔진에 다음 API들의 구현이 필요합니다.

## 🔧 필수 구현 API

### 1. 베이스라인 목록 조회 API
**엔드포인트**: `GET /api/v1/baselines/{profile_id}`

**설명**: 특정 프로파일에 대해 생성된 베이스라인 목록을 조회합니다.

**요청 파라미터**:
- `profile_id` (path): 프로파일 ID
- `metric_name` (query, optional): 특정 메트릭 필터
- `version` (query, optional): 베이스라인 버전 필터

**응답 예시**:
```json
{
  "baselines": [
    {
      "id": "baseline_001",
      "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
      "metric_name": "login_time_pattern",
      "version": "1.0",
      "status": "active",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ],
  "total_count": 15
}
```

### 2. 베이스라인 상세 조회 API
**엔드포인트**: `GET /api/v1/baselines/{profile_id}/{baseline_id}`

**설명**: 특정 베이스라인의 상세 정보와 분석 결과를 조회합니다.

**응답 예시**:
```json
{
  "id": "baseline_001",
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "metric_name": "login_time_pattern",
  "version": "1.0",
  "status": "active",
  "baseline_data": {
    "normal_patterns": [
      {
        "time_range": "09:00-10:00",
        "frequency": 0.8,
        "confidence": 0.92
      }
    ],
    "thresholds": {
      "warning": 0.6,
      "alert": 0.8
    }
  },
  "statistics": {
    "training_samples": 1000,
    "accuracy": 0.95,
    "last_training": "2025-01-01T10:00:00Z"
  }
}
```

### 3. 이상치 탐지 결과 조회 API
**엔드포인트**: `GET /api/v1/deviations/{profile_id}/anomalies`

**설명**: 특정 프로파일에서 탐지된 이상치 목록을 조회합니다.

**요청 파라미터**:
- `profile_id` (path): 프로파일 ID
- `date` (query, optional): 조회 날짜 (YYYY-MM-DD)
- `min_score` (query, optional): 최소 편차 점수 (기본: 0.7)
- `limit` (query, optional): 최대 결과 수 (기본: 50)

**응답 예시**:
```json
{
  "anomalies": [
    {
      "id": "anomaly_001",
      "target_entity": "user001",
      "metric_name": "login_time_pattern",
      "deviation_score": 0.85,
      "detection_time": "2025-01-02T03:30:00Z",
      "details": {
        "expected_pattern": "09:00-17:00",
        "actual_pattern": "03:30",
        "description": "업무시간 외 로그인"
      }
    }
  ],
  "total_count": 5,
  "summary": {
    "high_risk": 2,
    "medium_risk": 3,
    "low_risk": 0
  }
}
```

### 4. 편차 점수 계산 API
**엔드포인트**: `POST /api/v1/deviations/calculate`

**설명**: 특정 엔터티에 대한 실시간 편차 점수를 계산합니다.

**요청 바디**:
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "target_entity": "user001",
  "calculation_date": "2025-01-02",
  "metric_names": ["login_time_pattern", "session_duration"]
}
```

**응답 예시**:
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "target_entity": "user001",
  "calculation_date": "2025-01-02",
  "deviation_scores": [
    {
      "metric_name": "login_time_pattern",
      "deviation_score": 0.75,
      "confidence": 0.92,
      "details": {
        "baseline_value": "09:00-17:00",
        "current_value": "23:30",
        "explanation": "정상 로그인 시간대를 벗어남"
      }
    },
    {
      "metric_name": "session_duration",
      "deviation_score": 0.35,
      "confidence": 0.88,
      "details": {
        "baseline_value": "4.2 hours",
        "current_value": "6.1 hours",
        "explanation": "평균 세션 시간보다 약간 긴 편"
      }
    }
  ],
  "overall_risk_score": 0.55
}
```

## 📊 권장 구현 API (선택사항)

### 5. 베이스라인 통계 조회 API
**엔드포인트**: `GET /api/v1/profiles/{profile_id}/baseline/statistics`

**응답 예시**:
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "total_baselines": 15,
  "active_baselines": 15,
  "total_entities": 250,
  "monitoring_period": "30 days",
  "last_update": "2025-01-02T10:00:00Z",
  "anomaly_summary": {
    "last_24h": 3,
    "last_7d": 12,
    "last_30d": 45
  }
}
```

### 6. 베이스라인 성능 메트릭 API
**엔드포인트**: `GET /api/v1/baselines/{profile_id}/performance`

**응답 예시**:
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "performance_metrics": [
    {
      "metric_name": "login_time_pattern",
      "accuracy": 0.95,
      "precision": 0.92,
      "recall": 0.88,
      "f1_score": 0.90,
      "false_positive_rate": 0.05
    }
  ],
  "overall_performance": {
    "average_accuracy": 0.93,
    "detection_rate": 0.87,
    "false_alarm_rate": 0.06
  }
}
```

## 🔄 API 응답 구조 표준화

모든 API 응답은 다음 구조를 따라주세요:

### 성공 응답:
```json
{
  "status": "success",
  "data": { /* 실제 데이터 */ },
  "timestamp": "2025-01-02T10:00:00Z",
  "request_id": "req_12345"
}
```

### 오류 응답:
```json
{
  "status": "error",
  "error": {
    "code": "BASELINE_NOT_FOUND",
    "message": "요청한 베이스라인을 찾을 수 없습니다",
    "details": "Profile ID: ce8bde1e-5b43-4790-943f-aedc076b6574"
  },
  "timestamp": "2025-01-02T10:00:00Z",
  "request_id": "req_12345"
}
```

## 🎯 우선순위

1. **높음 (필수)**: 베이스라인 목록/상세 조회, 이상치 탐지 결과 조회
2. **중간**: 편차 점수 계산 API
3. **낮음 (권장)**: 통계 및 성능 메트릭 API

## 📝 참고사항

1. **인증**: 현재 UI는 인증 없이 동작하지만, 추후 JWT 토큰 기반 인증 추가 예정
2. **페이징**: 대용량 데이터를 위해 `limit`, `offset` 파라미터 지원 권장
3. **필터링**: 날짜 범위, 상태별 필터링 기능 지원 권장
4. **성능**: 응답 시간 3초 이내 목표
5. **에러 처리**: 상세한 에러 메시지와 HTTP 상태 코드 활용

## 🧪 테스트 데이터

테스트를 위해 다음 프로파일 ID를 사용하고 있습니다:
- `ce8bde1e-5b43-4790-943f-aedc076b6574` (VPN 프로파일, 15개 메트릭)

해당 프로파일에 대해 샘플 베이스라인 및 이상치 데이터를 제공해주시면 UI 테스트에 도움이 됩니다.
