# UBA 프로파일 탐지 마법사 - UI 컴포넌트 PRD

## 📋 문서 정보
- **프로젝트명**: UBA Profile Detection Wizard - UI Component
- **버전**: v1.1
- **작성일**: 2025년 6월 10일 (업데이트)
- **작성자**: Security Engineering Team
- **승인자**: CISO, CTO
- **문서 유형**: Product Requirements Document (PRD)

---

## 🎯 1. 제품 개요

### 1.1 제품 목적
SIEM 시스템 내에서 보안 전문가가 직관적이고 효율적으로 UBA(User and Entity Behavior Analytics) 프로파일을 생성할 수 있도록 하는 웹 기반 마법사 인터페이스 개발

### 1.2 핵심 가치 제안
- **복잡성 단순화**: 복잡한 UBA 설정을 5단계 마법사로 간소화
- **실시간 유효성 검사**: 로그 소스별 가능한 메트릭만 활성화하여 설정 오류 방지
- **전문가 가이드**: 각 설정 옵션에 대한 상세한 설명과 권장사항 제공
- **즉시 피드백**: 설정 변경 시 실시간으로 영향도와 예상 결과 표시
- **중앙 집중식 관리**: 다중 프로파일의 효율적인 통합 관리 및 모니터링

### 1.3 타겟 사용자
- **Primary**: SIEM 보안 분석가 (2-5년 경험)
- **Secondary**: 보안 관리자 (팀 리더, CISO)
- **Tertiary**: 시스템 관리자 (SIEM 운영자)

---

## 🛠️ 2. 기능 요구사항

### 2.1 핵심 기능 (Core Features)

#### 2.1.1 5단계 마법사 플로우
```
Step 1: 기본 정보 설정
├── 프로파일 이름 입력 (필수)
├── 프로파일 설명 입력 (선택)
├── 프로파일 유형 선택 (User/Entity/Hybrid)
└── 분석 범위 선택 (부서별/역할별/전체조직/사용자정의)

Step 2: 데이터 소스 선택
├── 로그 소스 선택 (라디오 버튼, 단일 선택)
│   ├── Windows 이벤트 로그
│   ├── Active Directory
│   ├── 방화벽 로그
│   ├── 프록시/웹 로그
│   ├── VPN 로그
│   ├── DNS 로그
│   ├── 이메일 로그
│   └── 데이터베이스 로그
└── 학습 기간 설정 (7일/14일/30일/60일/90일)

Step 3: 분석 메트릭 설정
├── 시간 기반 분석 (8개 메트릭)
│   ├── 로그인 시간 패턴
│   ├── 세션 지속 시간
│   ├── 업무시간 외 활동
│   ├── 주말/휴일 접근
│   ├── 로그인 빈도 변화
│   ├── 동시 세션 탐지
│   ├── 비활성 시간 패턴
│   └── 시간대 이상 접근
├── 네트워크 기반 분석 (9개 메트릭)
│   ├── IP 주소 패턴
│   ├── 지리적 위치 분석
│   ├── 데이터 전송량
│   ├── 불가능한 이동 탐지
│   ├── VPN 사용 패턴
│   ├── 디바이스 변경 탐지
│   ├── 대역폭 사용량 이상
│   ├── 연결 패턴 분석
│   └── 프록시 우회 시도
└── 접근 기반 분석 (12개 메트릭)
    ├── 리소스 접근 패턴
    ├── 인증 실패 횟수
    ├── 권한 상승 시도
    ├── 민감 데이터 접근
    ├── 파일 다운로드 패턴
    ├── 관리자 권한 사용
    ├── 애플리케이션 사용 패턴
    ├── 데이터베이스 쿼리 패턴
    ├── 이메일 행동 패턴
    ├── 시스템 명령어 실행
    ├── 원격 접근 패턴
    └── 공유 폴더 접근

Step 4: 임계값 설정
├── 이상 징후 민감도 (낮음/보통/높음/사용자정의)
├── 경고 심각도 (정보/낮음/보통/높음/매우높음)
├── 위험 점수 임계값 (0-100 슬라이더)
└── 알림 설정 (이메일/Slack/SMS/대시보드)

Step 5: 검토 및 완료
├── 설정 요약 표시
├── 예상 처리 시간 안내
├── 베이스라인 구축 일정 표시
└── 프로파일 생성 실행
```

#### 2.1.2 동적 메트릭 활성화/비활성화
```
로그 소스별 메트릭 가용성 매트릭스:

Windows Events:
✅ 시간 기반: 7개 활성화
❌ 네트워크 기반: 0개 (비활성화)
✅ 접근 기반: 7개 활성화

VPN Logs:
✅ 시간 기반: 7개 활성화  
✅ 네트워크 기반: 8개 활성화
⚠️ 접근 기반: 1개만 활성화 (인증 실패만)

Proxy/Web Logs:
✅ 시간 기반: 6개 활성화
✅ 네트워크 기반: 8개 활성화  
✅ 접근 기반: 5개 활성화
```

#### 2.1.3 통합 관리 인터페이스
```
통합 관리 기능:
├── 메인 대시보드 통합 메뉴
│   ├── 분석 결과 - 개별 프로파일 결과 보기
│   ├── 실행 관리 - 모든 프로파일 통합 관리 (신규)
│   ├── 실행 이력 - 모든 프로파일 이력 통합 조회 (신규)
│   └── 시스템 상태 - 전체 시스템 모니터링 (신규)
│
├── 통합 실행 관리
│   ├── 실행 현황 요약 대시보드
│   │   ├── 상태별 프로파일 수 (실행/일시 중지/대기/중지)
│   │   ├── 리소스 사용률 그래프
│   │   └── 예약된 다음 실행 시간
│   ├── 일괄 제어 기능
│   │   ├── 전체/선택 프로파일 일괄 실행
│   │   ├── 전체/선택 프로파일 일괄 중지
│   │   └── 우선순위 설정
│   ├── 그룹 관리
│   │   ├── 유형별 그룹화
│   │   ├── 중요도별 그룹화
│   │   └── 부서별 그룹화
│   └── 공통 설정 관리
│       ├── 스케줄링 일괄 적용
│       ├── 리소스 할당량 조정
│       └── 베이스라인 관리
│
├── 통합 실행 이력
│   ├── 실행 이력 타임라인
│   │   ├── 프로파일별 실행 흐름 시각화
│   │   ├── 상태별 색상 코딩 (성공/실패/경고)
│   │   └── 이벤트 중첩 처리 및 확대/축소 기능
│   ├── 고급 필터링
│   │   ├── 다중 기준 검색
│   │   ├── 이상 탐지 유형별 필터링
│   │   └── 사용자 정의 필터 저장
│   ├── 결과 비교
│   │   ├── 프로파일 간 결과 비교
│   │   ├── 시간별 결과 비교
│   │   └── 베이스라인과의 편차 분석
│   └── 보고서 생성
│       ├── 종합 보고서 템플릿
│       ├── 사용자 정의 보고서
│       └── PDF/Excel/CSV 내보내기
│
└── 시스템 상태 모니터링
    ├── 실시간 리소스 모니터링
    │   ├── CPU, 메모리, 디스크 사용량 그래프
    │   ├── 네트워크 트래픽 시각화
    │   └── 프로파일별 리소스 소비 비교
    ├── 로그 분석
    │   ├── 중앙화된 로그 검색 및 필터링
    │   ├── 심각도별 로그 분류
    │   └── 자동 이상 패턴 감지
    ├── 프로세스 관리
    │   ├── 활성 프로세스 모니터링
    │   ├── 프로세스 상태 제어 (중지/재시작)
    │   └── 성능 병목 감지
    └── 알림 관리
        ├── 시스템 임계값 설정
        ├── 알림 채널 설정
        └── 알림 히스토리 및 응답 추적
```

### 2.2 고급 기능 (Advanced Features)

#### 2.2.1 실시간 유효성 검사
- **단계별 필수 필드 검증**: 다음 단계 진행 전 필수 입력값 확인
- **로그 소스 호환성 검사**: 선택된 로그 소스와 메트릭 조합 유효성 검사
- **설정 충돌 감지**: 상호 배타적인 설정 조합 경고
- **예상 성능 영향 계산**: 선택된 설정의 시스템 리소스 영향도 표시

#### 2.2.2 컨텍스트 도움말
- **단계별 가이드**: 각 단계별 상세한 설명과 모범 사례
- **메트릭 설명**: 각 분석 메트릭의 의미와 탐지 가능한 위협 유형
- **권장 설정**: 조직 유형별 권장 설정 템플릿
- **예시 시나리오**: 실제 보안 시나리오와 대응 설정 예시

#### 2.2.3 설정 템플릿
```
템플릿 카테고리:
├── 조직 유형별
│   ├── 금융기관 (높은 보안)
│   ├── 제조업 (표준 보안)
│   ├── 스타트업 (기본 보안)
│   └── 의료기관 (규제 준수)
├── 위협 유형별
│   ├── 내부자 위협 탐지
│   ├── 계정 탈취 탐지
│   ├── 데이터 유출 탐지
│   └── APT 탐지
└── 로그 소스별
    ├── VPN 중심 모니터링
    ├── AD 중심 모니터링
    └── 웹 트래픽 중심
```

### 2.3 사용자 경험 (UX) 요구사항

#### 2.3.1 인터페이스 디자인 원칙
- **Progressive Disclosure**: 복잡한 정보를 단계별로 점진적 노출
- **Immediate Feedback**: 사용자 액션에 대한 즉시 피드백 제공
- **Error Prevention**: 오류 발생 가능한 상황을 사전에 방지
- **Accessibility**: WCAG 2.1 AA 수준 접근성 준수

#### 2.3.2 반응형 디자인
```
화면 크기별 레이아웃:
├── Desktop (1920x1080+)
│   ├── 풀 위드 레이아웃
│   ├── 사이드바 네비게이션
│   └── 멀티 컬럼 메트릭 표시
├── Tablet (768x1024)
│   ├── 적응형 레이아웃
│   ├── 축소된 사이드바
│   └── 2컬럼 메트릭 표시
└── Mobile (375x667)
    ├── 단일 컬럼 레이아웃
    ├── 햄버거 메뉴
    └── 스택형 메트릭 표시
```

#### 2.3.3 다국어 지원
- **1차 지원**: 한국어, 영어
- **2차 지원**: 일본어, 중국어 (간체)
- **번역 범위**: UI 텍스트, 도움말, 오류 메시지
- **지역화**: 날짜/시간 형식, 숫자 형식

---

## 💻 3. 기술 요구사항

### 3.1 프론트엔드 기술 스택
```
Core Technologies:
├── Framework: React 18+ (TypeScript)
├── State Management: Redux Toolkit + RTK Query
├── Styling: Tailwind CSS + Styled Components
├── UI Components: Custom Design System
├── Icons: Lucide React
├── Charts: Recharts
├── Form Handling: React Hook Form + Zod
├── Testing: Jest + React Testing Library
└── Build Tool: Vite

Development Tools:
├── Package Manager: pnpm
├── Code Quality: ESLint + Prettier
├── Type Checking: TypeScript 5.0+
├── Git Hooks: Husky + lint-staged
└── CI/CD: GitHub Actions
```

### 3.2 성능 요구사항
```
Performance Targets:
├── 초기 로딩 시간: < 3초
├── 단계 전환 시간: < 500ms  
├── API 응답 시간: < 2초
├── Lighthouse 점수: > 90점
├── Bundle 크기: < 1MB (gzipped)
├── 메모리 사용량: < 100MB
└── 지원 브라우저: Chrome 90+, Firefox 88+, Safari 14+
```

### 3.3 보안 요구사항
```
Security Measures:
├── 인증: JWT + Refresh Token
├── 권한 관리: RBAC (Role-Based Access Control)
├── CSRF 보호: SameSite Cookie + CSRF Token
├── XSS 방지: Content Security Policy
├── 입력 검증: 클라이언트/서버 이중 검증
├── 암호화: HTTPS 강제, TLS 1.3
└── 감사 로그: 모든 사용자 액션 로깅
```

---

## 🎨 4. UI/UX 디자인 명세

### 4.1 디자인 시스템

#### 4.1.1 컬러 팔레트
```
Primary Colors:
├── Primary: #6366f1 (Indigo-500)
├── Primary Hover: #5856eb (Indigo-600)
├── Primary Light: #a5b4fc (Indigo-300)
└── Primary Dark: #3730a3 (Indigo-800)

Semantic Colors:
├── Success: #10b981 (Emerald-500)
├── Warning: #f59e0b (Amber-500)  
├── Error: #ef4444 (Red-500)
├── Info: #3b82f6 (Blue-500)
└── Critical: #dc2626 (Red-600)

Neutral Colors:
├── Gray 50: #f9fafb
├── Gray 100: #f3f4f6
├── Gray 200: #e5e7eb
├── Gray 500: #6b7280
├── Gray 700: #374151
├── Gray 800: #1f2937
└── Gray 900: #111827

Dark Mode:
├── Background: #0f1419
├── Surface: #1a2332
├── Text Primary: #e2e8f0
└── Text Secondary: #94a3b8
```

#### 4.1.2 타이포그래피
```
Font Family: 'Segoe UI', 'Noto Sans KR', sans-serif

Heading Scales:
├── H1: 2.5rem (40px) / font-weight: 700
├── H2: 2rem (32px) / font-weight: 600  
├── H3: 1.5rem (24px) / font-weight: 600
├── H4: 1.25rem (20px) / font-weight: 600
└── H5: 1.125rem (18px) / font-weight: 500

Body Text:
├── Body Large: 1.125rem (18px) / line-height: 1.6
├── Body Regular: 1rem (16px) / line-height: 1.5
├── Body Small: 0.875rem (14px) / line-height: 1.4
└── Caption: 0.75rem (12px) / line-height: 1.3
```

#### 4.1.3 컴포넌트 라이브러리
```
Form Components:
├── Input Field (text, email, password)
├── Select Dropdown (single, multi)
├── Radio Button Group
├── Checkbox Group  
├── Toggle Switch
├── Slider (range, single value)
├── Textarea
└── File Upload

Navigation:
├── Progress Stepper
├── Breadcrumb
├── Tab Navigation
├── Sidebar Menu
└── Pagination

Feedback:
├── Alert/Toast Messages
├── Loading Spinners
├── Progress Bars
├── Modal Dialog
├── Tooltip
└── Popover

Data Display:
├── Card Container
├── Tag/Badge
├── Avatar
├── Data Table
├── Charts (Line, Bar, Pie)
└── Metrics Dashboard
```

### 4.2 레이아웃 구조

#### 4.2.1 마법사 레이아웃
```
Layout Structure:
┌─────────────────────────────────────────┐
│ Header (70px)                           │
│ ├── Logo + Title                       │
│ ├── Progress Indicator                 │
│ └── Help/Settings                      │
├─────────────────────────────────────────┤
│ Main Content Area                       │
│ ┌─────────────────────────────────────┐ │
│ │ Step Content (Dynamic)              │ │
│ │ ├── Step Title + Description       │ │
│ │ ├── Form Fields                    │ │
│ │ ├── Validation Messages            │ │
│ │ └── Help Text/Examples             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Footer (80px)                           │
│ ├── Previous Button                    │
│ ├── Progress Info                      │
│ └── Next/Complete Button               │
└─────────────────────────────────────────┘
```

#### 4.2.2 단계별 화면 구성

##### Step 1: 기본 정보
```
┌─────────────────────────────────────────┐
│ 🎯 UBA 프로파일 기본 정보                │
├─────────────────────────────────────────┤
│ [프로파일 이름*] ___________________     │
│ [설명] ________________________________ │
│       ________________________________ │
│                                         │
│ [프로파일 유형] [사용자 ▼] [분석범위] [부서별 ▼] │
│                                         │
│ ℹ️ 정보: UBA 프로파일은 정상적인 사용자    │
│   행동 패턴을 학습하여...                │
└─────────────────────────────────────────┘
```

##### Step 2: 데이터 소스
```
┌─────────────────────────────────────────┐
│ 📊 데이터 소스 선택                       │
├─────────────────────────────────────────┤
│ 로그 소스 선택 * (하나만 선택)             │
│                                         │
│ ○ Windows 이벤트 로그                    │
│   로그인, 로그아웃, 시스템 이벤트         │
│                                         │
│ ● VPN 로그                              │
│   원격 접속, 지역별 연결 패턴             │
│                                         │
│ ○ 방화벽 로그                           │
│   네트워크 트래픽, IP 접근 패턴           │
│                                         │
│ [학습 기간] [30일 ▼]                     │
│                                         │
│ ℹ️ 권장: 정확한 베이스라인 설정을 위해     │
│   최소 30일간의 학습 기간을 권장합니다     │
└─────────────────────────────────────────┘
```

##### Step 3: 분석 메트릭
```
┌─────────────────────────────────────────┐
│ 📈 분석 메트릭 설정                       │
├─────────────────────────────────────────┤
│ 📋 선택된 로그 소스: VPN 로그              │
│ 📊 분석 가능한 메트릭: 로그인 시간 패턴,   │
│     세션 지속 시간, IP 주소 패턴...       │
│                                         │
│ 📅 시간 기반 분석                        │
│ ☑️ 로그인 시간 패턴  ☑️ 세션 지속 시간    │
│ ☑️ 업무시간 외 활동  ☐ 주말/휴일 접근    │
│                                         │
│ 🌐 네트워크 기반 분석                     │
│ ☑️ IP 주소 패턴     ☑️ 지리적 위치       │
│ ☑️ 데이터 전송량    ☐ 불가능한 이동      │
│                                         │
│ 🔐 접근 기반 분석                        │
│ ☑️ 인증 실패 횟수                       │
│ ⚠️ VPN 로그는 VPN 연결 정보만 제공하며,   │
│   내부 리소스 접근은 추적할 수 없습니다   │
└─────────────────────────────────────────┘
```

#### 4.2.3 통합 관리 레이아웃

##### 통합 실행 관리 페이지
```
┌─────────────────────────────────────────┐
│ Header: 통합 실행 관리                   │
├─────────────────────────────────────────┤
│ 실행 현황 요약                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ 실행 중:  │ │ 대기 중:  │ │ 중지됨:  │    │
│ │   3 개   │ │   5 개   │ │   2 개   │    │
│ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│ [일괄 실행] [일괄 중지] [스케줄링]        │
├─────────────────────────────────────────┤
│ 프로파일 목록                           │
│ ┌───┬────────┬─────────┬─────────┬────┐│
│ │ ☑ │프로파일1│ 실행 중 │06-01 12:30│ ▶ ││
│ ├───┼────────┼─────────┼─────────┼────┤│
│ │ ☐ │프로파일2│ 중지됨  │  -      │ ▶ ││
│ ├───┼────────┼─────────┼─────────┼────┤│
│ │ ☑ │프로파일3│ 대기 중 │06-02 00:00│ ▶ ││
│ └───┴────────┴─────────┴─────────┴────┘│
├─────────────────────────────────────────┤
│ [선택 실행] [선택 중지] [선택 스케줄 설정] │
├─────────────────────────────────────────┤
│ 공통 베이스라인 관리                     │
│ 학습 기간: [30일▼]  데이터 소스: [전체▼]  │
│ [선택 항목 재학습]                       │
└─────────────────────────────────────────┘
```

##### 통합 실행 이력 페이지
```
┌─────────────────────────────────────────┐
│ Header: 통합 실행 이력                   │
├─────────────────────────────────────────┤
│ 필터:                                  │
│ 기간: [최근 7일▼] 프로파일: [전체▼] 상태: [전체▼] │
├─────────────────────────────────────────┤
│ 실행 이력 타임라인                       │
│ ┌──────────────────────────────────────┐│
│ │ 05-31     06-01     06-02     06-03  ││
│ │                                      ││
│ │ P1 [=====][=====][ 실행 중... ]       ││
│ │ P2 [====][ 실패 ]                    ││
│ │ P3 [================]                ││
│ └──────────────────────────────────────┘│
├─────────────────────────────────────────┤
│ 상세 이력                               │
│ ┌───┬────┬────────┬───────┬────────┬───┐│
│ │#ID│프로파일│  시작   │  종료  │  상태 │결과││
│ ├───┼────┼────────┼───────┼────────┼───┤│
│ │001│ P1 │06-01 09:00│06-01 09:30│성공│ 2 ││
│ ├───┼────┼────────┼───────┼────────┼───┤│
│ │002│ P2 │06-01 10:00│06-01 10:15│실패│ - ││
│ └───┴────┴────────┴───────┴────────┴───┘│
└─────────────────────────────────────────┘
```

##### 시스템 상태 페이지
```
┌─────────────────────────────────────────┐
│ Header: 시스템 상태                      │
├─────────────────────────────────────────┤
│ 시스템 상태 요약                         │
│ [CPU: 35%] [메모리: 60%] [디스크: 45%]    │
│ [알림: 2개] [활성 프로세스: 5개]          │
├─────────────────────────────────────────┤
│ 리소스 모니터링                          │
│ CPU 사용량                              │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│ 메모리 사용량                           │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│ 디스크 I/O                              │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
├─────────────────────────────────────────┤
│ 프로파일별 리소스 사용량                  │
│ ┌────────┬────┬──────┬────────┬───────┐ │
│ │프로파일 │ CPU │메모리  │디스크 I/O│처리량 │ │
│ ├────────┼────┼──────┼────────┼───────┤ │
│ │프로파일1│ 25% │500MB  │15MB/s   │1.2K/s│ │
│ ├────────┼────┼──────┼────────┼───────┤ │
│ │프로파일2│ 10% │200MB  │5MB/s    │0.5K/s│ │
│ └────────┴────┴──────┴────────┴───────┘ │
└─────────────────────────────────────────┘
```

### 4.3 상호작용 디자인

#### 4.3.1 마이크로 인터랙션
```
Interaction Patterns:
├── Hover Effects
│   ├── Button: 색상 변화 + 2px 상승 효과
│   ├── Card: 그림자 증가 + 3px 상승
│   └── Input: 테두리 색상 변화
├── Click Feedback  
│   ├── Button: 0.95 스케일 + 색상 변화
│   ├── Checkbox: 체크 애니메이션
│   └── Radio: 원형 확산 효과
├── Loading States
│   ├── Button: 스피너 + "처리 중..." 텍스트
│   ├── Form: 스켈레톤 UI
│   └── Page: 진행률 표시
└── Transitions
    ├── Step 전환: 슬라이드 애니메이션 (300ms)
    ├── Modal: 페이드 인/아웃 (200ms)
    └── Tooltip: 페이드 + 스케일 (150ms)
```

#### 4.3.2 에러 처리 및 피드백
```
Error Handling:
├── Field Validation
│   ├── 실시간 검증 (onBlur)
│   ├── 에러 메시지 표시 (빨간색)
│   └── 성공 표시 (녹색 체크)
├── Form Submission
│   ├── 진행률 표시
│   ├── 에러 시 구체적 메시지
│   └── 성공 시 확인 알림
├── Network Errors
│   ├── 재시도 버튼 제공
│   ├── 오프라인 상태 표시
│   └── 자동 재시도 (지수 백오프)
└── User Feedback
    ├── Toast 알림 (4초 자동 닫힘)
    ├── 인라인 메시지
    └── Modal 확인창
```

### 4.4 통합 관리 상호작용

#### 4.4.1 일괄 작업 패턴
```
Batch Operation Flow:
├── 선택 프로세스
│   ├── 전체 선택/해제
│   ├── 필터 기반 선택
│   └── 개별 항목 선택
├── 작업 실행
│   ├── 확인 다이얼로그
│   ├── 진행 상태 표시
│   └── 결과 요약 표시
└── 완료 후 피드백
    ├── 성공/실패 항목 구분
    ├── 오류 세부 정보
    └── 권장 조치 안내
```

#### 4.4.2 비교 분석 패턴
```
Comparison Analysis Flow:
├── 비교 대상 선택
│   ├── 프로파일 선택
│   ├── 시간 범위 선택
│   └── 메트릭 선택
├── 시각화 옵션
│   ├── 그래프 유형 (선형/막대/분포)
│   ├── 정렬 옵션
│   └── 그룹화 옵션
└── 인사이트 도출
    ├── 핵심 차이점 하이라이트
    ├── 통계적 유의성 표시
    └── 추세 및 이상치 식별
```

---

## 📊 5. 성능 및 최적화

### 5.1 로딩 성능 최적화
```
Performance Optimizations:
├── Code Splitting
│   ├── Route-based splitting
│   ├── Component lazy loading
│   └── Dynamic imports
├── Bundle Optimization
│   ├── Tree shaking
│   ├── Minification
│   └── Compression (gzip/brotli)
├── Asset Optimization
│   ├── Image optimization (WebP)
│   ├── Font subsetting
│   └── Critical CSS inlining
└── Caching Strategy
    ├── Browser caching
    ├── Service worker
    └── CDN utilization
```

### 5.2 런타임 성능 최적화
```
Runtime Optimizations:
├── React Optimizations
│   ├── useMemo/useCallback 활용
│   ├── React.memo for pure components
│   └── Virtual scrolling (큰 리스트)
├── State Management
│   ├── Redux Toolkit 최적화
│   ├── Selector memoization
│   └── Normalized state structure
├── API Optimizations
│   ├── Request debouncing
│   ├── Response caching
│   └── Optimistic updates
└── Memory Management
    ├── Event listener cleanup
    ├── Timer cleanup
    └── Memory leak prevention
```

### 5.3 통합 관리 성능 최적화
```
Integrated Management Optimizations:
├── 데이터 처리
│   ├── 페이지네이션 (50항목/페이지)
│   ├── 가상 스크롤 (1000+ 항목)
│   └── 점진적 로딩 (실행 이력)
├── 백그라운드 업데이트
│   ├── WebSocket 실시간 업데이트
│   ├── 데이터 폴링 최적화 (15초)
│   └── 변경 사항만 갱신
└── 렌더링 최적화
    ├── 타임라인 컴포넌트 (Canvas 기반)
    ├── 그래프 렌더링 제한 (최대 1000점)
    └── 비활성 탭 업데이트 중단
```

---

## 🧪 6. 테스트 요구사항

### 6.1 테스트 전략
```
Testing Strategy:
├── Unit Tests (80% coverage)
│   ├── Component testing
│   ├── Utility function testing
│   └── Custom hook testing
├── Integration Tests (60% coverage)
│   ├── API integration
│   ├── State management
│   └── User flow testing
├── E2E Tests (Critical paths)
│   ├── Complete wizard flow
│   ├── Error scenarios
│   └── Browser compatibility
└── Performance Tests
    ├── Load testing
    ├── Memory leak testing
    └── Bundle size monitoring
```

### 6.2 테스트 시나리오
```
Test Scenarios:
├── Happy Path
│   ├── 정상적인 5단계 완료
│   ├── 모든 로그 소스 테스트
│   └── 다양한 메트릭 조합
├── Error Cases
│   ├── 네트워크 에러 처리
│   ├── 잘못된 입력값 처리
│   └── 세션 만료 처리
├── Edge Cases
│   ├── 극단적 설정값
│   ├── 브라우저 새로고침
│   └── 뒤로가기 동작
└── Accessibility
    ├── 키보드 내비게이션
    ├── 스크린 리더 호환성
    └── 고대비 모드 지원
```

### 6.3 통합 관리 테스트 시나리오
```
Integrated Management Test Cases:
├── 대규모 데이터 테스트
│   ├── 100+ 프로파일 관리 성능
│   ├── 10,000+ 실행 이력 검색/필터링
│   └── 30일+ 타임라인 렌더링
├── 일괄 작업 테스트
│   ├── 전체 프로파일 일괄 시작/중지
│   ├── 그룹 작업 성공/실패 처리
│   └── 병렬 작업 최대 부하 테스트
└── 동시 사용자 테스트
    ├── 다중 관리자 작업 충돌 해결
    ├── 락(Lock) 메커니즘 테스트
    └── 최근 변경 사항 실시간 동기화
```

---

## 🚀 7. 배포 및 운영

### 7.1 배포 환경
```
Deployment Environments:
├── Development
│   ├── Local development server
│   ├── Hot reload enabled
│   └── Debug tools active
├── Staging
│   ├── Production-like environment
│   ├── Integration testing
│   └── Performance monitoring
├── Production
│   ├── High availability setup
│   ├── CDN integration
│   └── Monitoring/alerting
└── DR (Disaster Recovery)
    ├── Backup environment
    ├── Automated failover
    └── Data replication
```

### 7.2 모니터링 및 분석
```
Monitoring & Analytics:
├── Application Performance
│   ├── Response time monitoring
│   ├── Error rate tracking
│   └── Resource utilization
├── User Experience
│   ├── User journey analytics
│   ├── Conversion funnel
│   └── Drop-off point analysis
├── Business Metrics
│   ├── Profile creation success rate
│   ├── Feature adoption rate
│   └── User satisfaction scores
└── Technical Metrics
    ├── Bundle size tracking
    ├── Performance budget
    └── Accessibility compliance
```

---

## 📅 8. 개발 일정

### 8.1 마일스톤
```
Development Timeline (20 weeks):

Phase 1: Foundation (Weeks 1-4)
├── Week 1-2: 프로젝트 설정 및 기술 스택 구성
├── Week 3: 디자인 시스템 및 컴포넌트 라이브러리
└── Week 4: 기본 라우팅 및 레이아웃 구현

Phase 2: Core Development (Weeks 5-10)  
├── Week 5-6: Step 1-2 구현 (기본 정보, 데이터 소스)
├── Week 7-8: Step 3 구현 (분석 메트릭)
├── Week 9: Step 4 구현 (임계값 설정)
└── Week 10: Step 5 구현 (검토 및 완료)

Phase 3: Integrated Management (Weeks 11-15) - 신규
├── Week 11: 통합 실행 관리 기본 구조
├── Week 12: 통합 실행 이력 및 타임라인
├── Week 13: 시스템 상태 모니터링
├── Week 14: 일괄 작업 및 비교 분석 기능
└── Week 15: 통합 관리 UI 최적화

Phase 4: Advanced Features (Weeks 16-18)
├── Week 16: 동적 메트릭 활성화 로직
├── Week 17: 템플릿 및 컨텍스트 도움말
└── Week 18: 성능 최적화 및 접근성

Phase 5: Testing & Polish (Weeks 19-20)
├── Week 19: 종합 테스트 및 버그 수정
└── Week 20: 사용자 수용 테스트 및 최종 배포
```

### 8.2 위험 요소 및 대응방안
```