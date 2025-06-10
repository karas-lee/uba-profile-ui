# 베이스라인 엔진 시계열 데이터 API 요구사항

## 개요
UBA 프로파일 분석 결과 페이지에서 "기간별 활동 추이 차트"를 구현하기 위해 베이스라인 엔진에서 추가로 제공해야 하는 시계열 데이터 API 스펙입니다.

## 현재 문제점
- 베이스라인 엔진에서 시계열 활동 데이터를 제공하지 않음
- `temporal_baseline`에 기본적인 통계 정보만 포함 (일평균, 사용 일관성)
- 기간별 활동 추이, 시간대별 분포, 트렌드 분석 데이터 부족

---

## 1. 🔄 **기존 API 확장 (우선순위: 높음)**

### 1.1 개별 베이스라인 상세 정보 API 확장

**엔드포인트:** `GET /api/v1/baselines/{profile_id}/{baseline_id}`

**현재 응답 구조:**
```json
{
  "baseline_id": "3ae6e05e-78d8-40c3-bc2a-8ddca020d425",
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "metric_name": "connection_pattern_analysis",
  "temporal_baseline": {
    "pattern_type": "frequency",
    "daily_average": 3.616471959592813,
    "usage_consistency": 0
  }
}
```

**요구되는 확장 구조:**
```json
{
  "baseline_id": "3ae6e05e-78d8-40c3-bc2a-8ddca020d425",
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "metric_name": "connection_pattern_analysis",
  "temporal_baseline": {
    "pattern_type": "frequency",
    "daily_average": 3.616471959592813,
    "usage_consistency": 0,

    // 📊 새로 추가 필요한 시계열 데이터
    "daily_distribution": {
      "2025-05-11": 4.2,
      "2025-05-12": 3.8,
      "2025-05-13": 3.1,
      "2025-05-14": 4.5,
      "2025-05-15": 3.9,
      // ... 학습 기간 동안의 일별 데이터 (30일)
      "2025-06-09": 3.6
    },

    "weekly_distribution": {
      "week1": { "avg": 3.9, "min": 3.1, "max": 4.5, "std": 0.5 },
      "week2": { "avg": 3.7, "min": 2.8, "max": 4.2, "std": 0.4 },
      "week3": { "avg": 3.4, "min": 2.9, "max": 4.0, "std": 0.3 },
      "week4": { "avg": 3.2, "min": 2.7, "max": 3.8, "std": 0.4 }
    },

    "hourly_distribution": {
      "0": 0.1, "1": 0.0, "2": 0.0, "3": 0.0,
      "4": 0.0, "5": 0.0, "6": 0.2, "7": 0.5,
      "8": 1.8, "9": 2.5, "10": 4.1, "11": 3.8,
      "12": 3.2, "13": 3.5, "14": 3.9, "15": 4.0,
      "16": 3.7, "17": 2.8, "18": 1.5, "19": 0.8,
      "20": 0.4, "21": 0.2, "22": 0.1, "23": 0.0
    },

    "trend_analysis": {
      "direction": "decreasing",    // increasing, stable, decreasing
      "slope": -0.1,               // 회귀 기울기
      "confidence": 0.85,          // 트렌드 신뢰도
      "anomaly_periods": [
        {
          "date": "2025-05-20",
          "value": 8.5,
          "deviation_score": 2.3
        }
      ]
    },

    "seasonal_patterns": {
      "weekday_avg": 3.8,
      "weekend_avg": 2.1,
      "monday_pattern": "high",      // high, normal, low
      "friday_pattern": "normal",
      "peak_hours": [9, 10, 14, 15],
      "low_hours": [0, 1, 2, 3, 4, 5, 22, 23]
    }
  }
}
```

---

## 2. 📈 **새로운 시계열 집계 API (우선순위: 중간)**

### 2.1 프로파일 전체 활동 추이 API

**엔드포인트:** `GET /api/v1/profiles/{profile_id}/timeline`

**쿼리 파라미터:**
- `period`: `daily`, `weekly`, `monthly` (기본: `daily`)
- `days`: 조회 기간 일수 (기본: 30, 최대: 90)
- `metrics[]`: 특정 메트릭만 조회 (선택적)

**응답 구조:**
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "period": "daily",
  "date_range": {
    "start_date": "2025-05-11",
    "end_date": "2025-06-09",
    "total_days": 30
  },
  "timeline_data": {
    "2025-05-11": {
      "total_activity": 45.2,
      "metrics": {
        "login_time_pattern": 4.2,
        "session_duration": 8.5,
        "vpn_usage_pattern": 12.3,
        "connection_pattern_analysis": 4.1
      },
      "anomaly_count": 0,
      "quality_score": 0.85
    },
    "2025-05-12": {
      "total_activity": 42.8,
      "metrics": {
        "login_time_pattern": 3.8,
        "session_duration": 7.9,
        "vpn_usage_pattern": 11.7,
        "connection_pattern_analysis": 3.9
      },
      "anomaly_count": 1,
      "quality_score": 0.82
    }
    // ... 30일간 데이터
  },
  "summary": {
    "avg_daily_activity": 38.6,
    "peak_day": "2025-05-15",
    "peak_value": 52.1,
    "low_day": "2025-05-28",
    "low_value": 28.3,
    "trend": {
      "direction": "decreasing",
      "slope": -0.3,
      "confidence": 0.78
    },
    "total_anomalies": 5
  }
}
```

### 2.2 메트릭별 시간대별 분포 API

**엔드포인트:** `GET /api/v1/profiles/{profile_id}/hourly-patterns`

**쿼리 파라미터:**
- `metric_name`: 특정 메트릭 (선택적, 없으면 모든 메트릭)
- `date_range`: 분석 기간 (기본: 최근 30일)

**응답 구조:**
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "date_range": {
    "start_date": "2025-05-11",
    "end_date": "2025-06-09"
  },
  "hourly_patterns": {
    "login_time_pattern": {
      "0": { "avg": 0.1, "count": 3, "std": 0.2 },
      "1": { "avg": 0.0, "count": 0, "std": 0.0 },
      "8": { "avg": 1.8, "count": 25, "std": 0.4 },
      "9": { "avg": 2.5, "count": 28, "std": 0.6 },
      "10": { "avg": 4.1, "count": 30, "std": 0.8 },
      // ... 24시간 데이터
    },
    "session_duration": {
      "9": { "avg": 45.2, "count": 28, "std": 12.3 },
      "10": { "avg": 52.1, "count": 30, "std": 15.8 }
      // ... 시간별 세션 지속시간 데이터
    }
  },
  "patterns": {
    "peak_hours": [9, 10, 14, 15],
    "off_hours": [0, 1, 2, 3, 4, 5, 22, 23],
    "business_hours_activity": 0.85,
    "after_hours_activity": 0.15
  }
}
```

---

## 3. 🔍 **이상치 시계열 분석 API (우선순위: 중간)**

### 3.1 시계열 이상치 탐지 API

**엔드포인트:** `GET /api/v1/profiles/{profile_id}/anomalies/timeline`

**쿼리 파라미터:**
- `days`: 조회 기간 (기본: 30)
- `threshold`: 이상치 임계값 (기본: 0.8)

**응답 구조:**
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "anomaly_timeline": {
    "2025-05-15": [
      {
        "time": "14:30:00",
        "metric_name": "impossible_travel_detection",
        "severity": "high",
        "deviation_score": 2.3,
        "baseline_value": 0.0,
        "actual_value": 1.0,
        "description": "Geographic impossibility detected"
      }
    ],
    "2025-05-22": [
      {
        "time": "03:15:00",
        "metric_name": "after_hours_activity",
        "severity": "medium",
        "deviation_score": 1.8,
        "baseline_value": 0.1,
        "actual_value": 3.2,
        "description": "Unusual after-hours activity"
      }
    ]
  },
  "anomaly_trends": {
    "daily_counts": {
      "2025-05-11": 0,
      "2025-05-12": 1,
      "2025-05-13": 0,
      // ... 일별 이상치 개수
    },
    "severity_distribution": {
      "high": 2,
      "medium": 8,
      "low": 15
    },
    "metric_frequency": {
      "impossible_travel_detection": 5,
      "after_hours_activity": 8,
      "login_frequency_change": 3
    }
  }
}
```

---

## 4. 📊 **성능 및 품질 지표 API (우선순위: 낮음)**

### 4.1 베이스라인 품질 추이 API

**엔드포인트:** `GET /api/v1/profiles/{profile_id}/quality-trends`

**응답 구조:**
```json
{
  "profile_id": "ce8bde1e-5b43-4790-943f-aedc076b6574",
  "quality_timeline": {
    "2025-05-11": {
      "overall_quality": 0.85,
      "metrics": {
        "login_time_pattern": 0.88,
        "session_duration": 0.82,
        "vpn_usage_pattern": 0.87
      },
      "confidence_level": 0.78,
      "sample_size": 156
    }
    // ... 일별 품질 데이터
  },
  "quality_trends": {
    "improvement_rate": 0.02,  // 일일 개선율
    "stability_score": 0.91,   // 품질 안정성
    "learning_effectiveness": 0.85
  }
}
```

---

## 5. 🛠️ **구현 우선순위 및 일정**

### Phase 1 (우선순위: 높음, 목표: 1주)
1. **기존 베이스라인 API 확장**
   - `temporal_baseline`에 `daily_distribution`, `hourly_distribution` 추가
   - 기본적인 시계열 데이터 제공

### Phase 2 (우선순위: 중간, 목표: 2주)
2. **프로파일 전체 활동 추이 API**
   - `/api/v1/profiles/{profile_id}/timeline` 구현
   - 일별/주별 집계 데이터 제공

### Phase 3 (우선순위: 중간, 목표: 3주)
3. **시간대별 패턴 분석 API**
   - `/api/v1/profiles/{profile_id}/hourly-patterns` 구현
   - 메트릭별 시간대별 분포 제공

### Phase 4 (우선순위: 낮음, 목표: 4주)
4. **이상치 시계열 분석 API**
   - 시계열 이상치 탐지 및 트렌드 분석

---

## 6. 📋 **프론트엔드 구현 계획**

### 6.1 차트 유형별 데이터 활용
- **라인 차트**: `daily_distribution` → 일별 활동 추이
- **바 차트**: `hourly_distribution` → 시간대별 분포
- **히트맵**: `weekly_distribution` + `hourly_distribution` → 요일별 시간대별 활동 패턴
- **스파크라인**: `trend_analysis` → 각 메트릭별 트렌드 표시

### 6.2 Chart.js 구현 예시
```javascript
// 일별 활동 추이 차트
function createTimelineChart(timelineData) {
  const dates = Object.keys(timelineData.daily_distribution);
  const values = Object.values(timelineData.daily_distribution);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: '일별 활동량',
        data: values,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
```

---

## 7. 🔧 **데이터베이스 스키마 제안**

베이스라인 엔진에서 시계열 데이터를 효율적으로 저장하고 조회하기 위한 테이블 구조:

```sql
-- 시계열 베이스라인 데이터 테이블
CREATE TABLE baseline_timeseries (
    id UUID PRIMARY KEY,
    baseline_id UUID REFERENCES baselines(id),
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    activity_value DECIMAL(10, 4),
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(baseline_id, date, hour)
);

-- 인덱스 생성
CREATE INDEX idx_baseline_timeseries_baseline_date
ON baseline_timeseries(baseline_id, date);

CREATE INDEX idx_baseline_timeseries_baseline_hour
ON baseline_timeseries(baseline_id, hour);
```

---

## 8. 📞 **API 호출 예시**

### 프론트엔드에서 시계열 데이터 조회 순서:
1. **베이스라인 목록 조회**: `GET /api/v1/profiles/{id}/baseline/results`
2. **개별 베이스라인 상세 조회**: `GET /api/v1/baselines/{profile_id}/{baseline_id}`
3. **프로파일 전체 활동 추이**: `GET /api/v1/profiles/{id}/timeline?period=daily&days=30`
4. **시간대별 패턴**: `GET /api/v1/profiles/{id}/hourly-patterns`

이 API들이 구현되면 UBA 프로파일 분석 결과 페이지에서 완전한 기간별 활동 추이 차트를 표시할 수 있습니다.
