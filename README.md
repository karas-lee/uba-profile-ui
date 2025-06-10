# UBA 프로파일 마법사 및 통합 관리 대시보드

사용자 및 엔터티 행동 분석(UBA) 프로파일을 생성하고 관리하는 웹 기반 애플리케이션입니다.
정상적인 사용자 행동 패턴을 학습하여 이상 징후를 탐지하는 보안 시스템을 위한 UI 컴포넌트입니다.

## 주요 기능

### 프로파일 관리
- UBA 프로파일 생성 마법사 (5단계 설정 프로세스)
- 프로파일 목록 관리 (카드 뷰/리스트 뷰)
- 프로파일 편집 및 삭제
- 프로파일 상세 정보 보기
- **🆕 베이스라인 엔진 API 통합**: 외부 베이스라인 엔진과의 완전한 통합
- **🆕 VPN 프로파일 지원**: VPN 로그 분석에 최적화된 프로파일 생성 및 검증

### 통합 관리 기능
- **통합 실행 관리**: 모든 프로파일의 실행 상태 확인 및 일괄 제어
- **통합 실행 이력**: 전체 프로파일의 실행 이력 타임라인 및 상세 조회
- **시스템 상태 모니터링**: CPU, 메모리, 디스크 사용량 및 프로파일별 리소스 모니터링

### 분석 기능
- 프로파일 실행 일정 관리 및 수동 실행
- 실행 이력 조회 및 비교 분석
- 베이스라인 관리 (재학습, 리셋)
- 알림 설정 관리

### 결과 시각화
- 위험 점수 및 이상 징후 시각화
- 행동 패턴 분석 차트
- 베이스라인 비교 그래프
- 시간대별 활동 히트맵

## 페이지 구조

### 메인 화면
- **메인 대시보드** (index.html): 프로파일 목록 조회 및 관리

### 프로파일 기능
- **프로파일 마법사** (uba_profile_wizard.html): 5단계 프로파일 생성 과정
- **프로파일 결과** (uba_profile_results.html): 분석 결과 및 이상 징후 확인

### 통합 관리 기능
- **통합 실행 관리** (uba_integrated_management.html): 통합 대시보드 및 프로파일 일괄 제어
- **통합 실행 이력** (uba_integrated_execution.html): 통합 타임라인 및 실행 이력 관리
- **시스템 상태** (uba_system_health.html): 시스템 리소스 및 성능 모니터링

## 주요 화면 기능

### 통합 실행 관리
- 상태별 프로파일 수 (실행 중, 대기 중, 일시 중지, 중지) 대시보드
- 프로파일 목록 조회 및 상태 확인
- 선택/전체 프로파일 일괄 시작, 일시 중지, 중지 제어
- 프로파일 스케줄링 관리

### 통합 실행 이력
- 모든 프로파일의 실행 이력 타임라인 시각화
- 날짜, 프로파일, 상태, 결과별 필터링
- 상세 실행 이력 및 결과 조회
- 실행 상세 정보 팝업

### 시스템 상태 모니터링
- CPU, 메모리, 디스크, 네트워크 사용률 실시간 모니터링
- 프로파일별 리소스 사용량 상세 확인
- 시스템 상태 요약 대시보드
- 10초 간격 자동 데이터 갱신

## 기술 스택

- **프론트엔드**: HTML, CSS, 순수 JavaScript
- **백엔드 서버**: Express.js (API 서버 및 정적 파일 제공)
- **데이터베이스**: PostgreSQL (프로파일 및 상태 정보 저장)
- **폴백 메커니즘**: 로컬 메모리 스토리지 (데이터베이스 연결 실패 시)
- **실행 환경**: Node.js (v14 이상)
- **🆕 외부 API 통합**: Axios 기반 베이스라인 엔진 API 클라이언트

## 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- PostgreSQL (v12 이상)

### PostgreSQL 설치 및 설정

#### Windows에 PostgreSQL 설치

1. [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/windows/)에서 설치 프로그램 다운로드
2. 설치 프로그램 실행 및 기본 옵션으로 설치 진행
3. 설치 중 요청되는 superuser(postgres) 비밀번호 설정 및 기억
4. 기본 포트(5432) 사용 권장
5. 설치 완료 후 pgAdmin 또는 psql 명령줄 도구로 접속 테스트

#### macOS에 PostgreSQL 설치

##### Homebrew를 사용한 설치 (권장)
```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# PostgreSQL 설치
brew install postgresql@14

# PostgreSQL 서비스 시작
brew services start postgresql@14
```

##### 공식 설치 프로그램 사용
1. [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/macosx/)에서 설치 프로그램 다운로드
2. 설치 프로그램 실행 및 지시에 따라 설치
3. 설치 중 요청되는 superuser(postgres) 비밀번호 설정

#### Linux(Ubuntu)에 PostgreSQL 설치
```bash
# 패키지 리스트 업데이트
sudo apt update

# PostgreSQL 설치
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 비밀번호 설정
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
```

#### 데이터베이스 및 테이블 생성

1. PostgreSQL에 접속:
```bash
# macOS/Linux
psql -U postgres

# Windows (명령 프롬프트에서)
psql -U postgres
```

2. UBA 프로파일 데이터베이스 생성:
```sql
CREATE DATABASE uba_profiles;
```

3. 새로 생성한 데이터베이스에 연결:
```sql
\c uba_profiles
```

4. 필요한 테이블 생성:
```sql
CREATE TABLE profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    profile_type VARCHAR(20),
    analysis_scope VARCHAR(20),
    log_source_name VARCHAR(100),
    log_source_type VARCHAR(50),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile_status (
    id SERIAL PRIMARY KEY,
    profile_id VARCHAR(50) REFERENCES profiles(id),
    status VARCHAR(20) NOT NULL,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 환경 설정

1. 프로젝트 루트에 `.env` 파일 생성:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=uba_profiles
PORT=3000
```

2. `.env` 파일의 DB_PASSWORD를 설치 시 설정한 PostgreSQL 비밀번호로 변경

### 설치 및 실행

1. 저장소 복제
```bash
git clone https://github.com/yourusername/uba-profile-ui.git
cd uba-profile-ui
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 서버 실행 (방법 1 - 일반 실행)
```bash
npm start
# 또는
yarn start
```

4. 서버 실행 (방법 2 - PowerShell 정책 이슈가 있는 경우)
```bash
# 명령 프롬프트(CMD)를 통한 실행
cmd /c start-server.bat

# 또는 npm 스크립트 사용
npm run start-cmd

# 또는 PowerShell에서 정책 변경 후 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm start
```

5. 브라우저에서 `http://localhost:3000`으로 접속

### PowerShell 실행 정책 관련 이슈

PowerShell에서 `npm start` 명령어 실행 시 다음과 같은 오류가 발생할 수 있습니다:
```
이 시스템에서 스크립트를 실행할 수 없으므로 파일을 로드할 수 없습니다. 자세한 내용은 about_Execution_Policies를 참조하십시오.
```

이 경우 다음 방법으로 해결할 수 있습니다:

1. CMD를 사용한 실행: `cmd /c start-server.bat` 또는 `npm run start-cmd`
2. PowerShell 정책 변경: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 개발 모드

개발 중에는 자동 새로고침을 위해 nodemon을 사용할 수 있습니다:

```bash
npm run dev
# 또는
yarn dev
```

## 데이터 저장 메커니즘

### 기본 데이터 저장 - PostgreSQL
모든 프로파일 데이터 및 상태 정보는 PostgreSQL 데이터베이스에 저장됩니다.
애플리케이션은 API를 통해 데이터베이스와 통신합니다.

### 폴백 메커니즘 - 메모리 스토리지
데이터베이스 연결이 실패할 경우, 애플리케이션은 자동으로 인메모리 스토리지로 전환되어
로컬 개발 환경에서도 중단 없이 기능을 테스트할 수 있습니다. 이 모드에서는 서버 재시작 시
데이터가 초기화됩니다.

## 최근 변경 사항

### 데이터베이스 통합
- PostgreSQL 데이터베이스 연결 및 쿼리 지원 추가
- 데이터베이스 연결 실패 시 자동 메모리 스토리지 폴백 메커니즘 구현
- 프로파일 및 상태 정보를 위한 테이블 스키마 설계

### 비동기 처리 개선
- 프로파일 생성 및 수정 함수를 비동기(async/await) 방식으로 전환
- API 호출 패턴 개선으로 응답성 향상
- 로딩 상태 표시 및 에러 처리 강화

### UI/UX 개선
- 프로파일 수정 시 기존 데이터 정확히 로드되도록 개선
- 메트릭 선택 로직 개선 및 부분 일치 검색 기능 추가
- 로그 소스 선택 시 DOM 이벤트 처리 안정성 강화
- 디버깅 로그 추가 및 에러 처리 개선

## 주요 기능 사용법

### 프로파일 생성
1. 메인 대시보드에서 "새 프로파일 생성" 버튼 클릭
2. 5단계 마법사를 통해 프로파일 설정 진행:
   - 기본 정보 입력 (이름, 설명, 유형)
   - 데이터 소스 선택 (로그 소스, 학습 기간)
   - 분석 메트릭 설정 (시간/네트워크/접근 기반 분석)
   - 임계값 설정 (알림 심각도, 위험 점수)
   - 설정 검토 및 완료

### 프로파일 편집
1. 메인 대시보드에서 프로파일 카드의 "편집" 버튼 클릭
2. 기존 설정이 미리 로드된 마법사에서 필요한 변경 수행
3. 모든 단계를 검토 후 "프로파일 수정" 버튼 클릭하여 저장

### 통합 관리
1. 메인 대시보드 상단의 "통합 실행 관리" 버튼 클릭
2. 다음 작업 수행 가능:
   - 프로파일 상태 확인 (실행 중, 대기 중, 일시 중지, 중지)
   - 선택한 프로파일 일괄 실행/중지/일시 중지
   - 프로파일 스케줄링 설정

### 실행 이력 조회
1. 메인 대시보드 상단의 "통합 실행 이력" 버튼 클릭
2. 다음 작업 수행 가능:
   - 타임라인에서 프로파일별 실행 이력 확인
   - 날짜, 프로파일, 상태, 결과별 필터링
   - 실행 상세 정보 조회

## 문제 해결

### 데이터베이스 연결 문제
- PostgreSQL 서비스가 실행 중인지 확인: `systemctl status postgresql` 또는 `brew services list`
- 포트가 올바르게 설정되었는지 확인 (기본값: 5432)
- `.env` 파일의 데이터베이스 자격 증명이 올바른지 확인
- 방화벽 설정 확인 및 필요한 경우 PostgreSQL 포트 허용

### 서버 실행 문제
- 포트 충돌 시 `.env` 파일에서 PORT 값 변경
- Node.js 버전 확인: `node -v` (v14 이상 권장)
- npm 패키지 설치 확인: `npm list express pg dotenv`

## 기여 방법

1. 이 저장소를 Fork합니다.
2. 새로운 기능이나 수정을 위한 브랜치를 생성합니다.
3. 변경사항을 커밋하고 Push합니다.
4. Pull Request를 생성합니다.

## 🆕 베이스라인 엔진 API 통합

### 개요
이 버전에서는 외부 베이스라인 엔진과의 완전한 API 통합이 추가되었습니다. 이를 통해 더 고급의 행동 분석 기능과 VPN 로그 분석에 특화된 기능을 제공합니다.

### 새로운 기능들

#### 1. 베이스라인 엔진 API 클라이언트
- **위치**: `services/baseline-engine-client.js`
- **기능**: Python api_client_example.py를 Node.js로 이식하여 완전한 API 통합 제공
- **주요 클래스**:
  - `BaselineEngineAPIClient`: 메인 API 클라이언트
  - `VpnProfileHelper`: VPN 프로파일 생성 및 검증 도우미

#### 2. 베이스라인 엔진 API 라우트
- **위치**: `routes/baseline-engine.js`
- **베이스 URL**: `/api/baseline-engine/*`
- **사용 가능한 엔드포인트**:

```
GET  /api/baseline-engine/health                     # 베이스라인 엔진 서버 상태 확인
GET  /api/baseline-engine/metrics/supported          # 지원하는 메트릭 목록 조회
GET  /api/baseline-engine/profiles                   # 베이스라인 엔진에서 프로파일 목록 조회
POST /api/baseline-engine/profiles                   # 베이스라인 엔진에 새 프로파일 생성
GET  /api/baseline-engine/profiles/:id               # 특정 프로파일 조회
PUT  /api/baseline-engine/profiles/:id               # 프로파일 업데이트
PATCH /api/baseline-engine/profiles/:id/status       # 프로파일 상태 업데이트
POST /api/baseline-engine/profiles/:id/diagnose      # 프로파일 진단
DELETE /api/baseline-engine/profiles/:id             # 프로파일 삭제
GET  /api/baseline-engine/vpn-profile/metrics        # VPN 관련 메트릭 목록 조회
POST /api/baseline-engine/vpn-profile/validate       # VPN 프로파일 메트릭 검증
POST /api/baseline-engine/vpn-profile/config         # VPN 프로파일 설정 생성
```

#### 3. VPN 프로파일 전용 기능
- **VPN 최적화 메트릭**: 시간 기반 및 네트워크 기반 메트릭으로 분류
- **자동 검증**: VPN 로그에 적합하지 않은 메트릭 필터링
- **필수 메트릭 체크**: VPN 분석에 꼭 필요한 메트릭 확인

#### 4. 프론트엔드 API 함수
새로운 JavaScript API 함수들이 `js/api.js`에 추가되었습니다:

```javascript
// 베이스라인 엔진 서버 상태 확인
checkBaselineEngineHealth()

// 지원하는 메트릭 목록 조회
fetchSupportedMetrics()

// 베이스라인 엔진 프로파일 관리
fetchBaselineEngineProfiles(filters)
createBaselineEngineProfile(profileData)
fetchBaselineEngineProfile(profileId)
updateBaselineEngineProfileStatus(profileId, status, reason)
diagnoseBaselineEngineProfile(profileId)

// VPN 프로파일 전용 기능
validateVpnProfileMetrics(selectedMetrics)
generateVpnProfileConfig(configData)
fetchVpnProfileMetrics()
```

### 환경 설정

베이스라인 엔진 API 서버 URL을 설정하려면 `.env` 파일에 다음을 추가하세요:

```bash
# 베이스라인 엔진 설정
BASELINE_ENGINE_URL=http://localhost:8000
```

설정하지 않으면 기본값 `http://localhost:8000`이 사용됩니다.

### 베이스라인 엔진 서버 설정

베이스라인 엔진 서버를 시작하려면:

```bash
# 베이스라인 엔진 프로젝트 디렉토리에서
cd /path/to/baseline-engine
python -m uvicorn main:app --reload --port 8000
```

### 통합 테스트

베이스라인 엔진 API 통합이 올바르게 작동하는지 테스트하려면:

```bash
# 통합 테스트 실행
node test-baseline-integration.js
```

이 테스트는 다음을 확인합니다:
- 베이스라인 엔진 서버 연결 상태
- API 엔드포인트 응답
- VPN 프로파일 기능 작동
- 메트릭 검증 기능

### VPN 프로파일 생성 예시

#### JavaScript에서 VPN 프로파일 생성:

```javascript
// VPN 프로파일 설정 생성
const vpnConfig = await generateVpnProfileConfig({
    name: 'VPN 사용자 베이스라인 프로파일',
    description: 'VPN 접속 패턴 및 보안 행동 분석',
    departments: ['IT', 'Finance', 'Engineering'],
    selectedMetrics: [
        'login_time_pattern',
        'session_duration',
        'vpn_usage_pattern',
        'geo_location_analysis',
        'impossible_travel_detection'
    ]
});

// 메트릭 검증
const validation = await validateVpnProfileMetrics(vpnConfig.data.selected_metrics);

if (validation.data.is_valid) {
    // 베이스라인 엔진에 프로파일 생성
    const result = await createBaselineEngineProfile(vpnConfig.data);
    console.log('프로파일 생성 완료:', result);
} else {
    console.log('메트릭 검증 실패:', validation.data.warnings);
}
```

### 주의사항

1. **베이스라인 엔진 서버**: 베이스라인 엔진 API 기능을 사용하려면 별도의 베이스라인 엔진 서버가 실행되고 있어야 합니다.

2. **네트워크 연결**: 베이스라인 엔진 서버에 네트워크로 접근할 수 있어야 합니다.

3. **호환성**: 현재 통합은 베이스라인 엔진 API v1과 호환됩니다.

## 라이선스

MIT
