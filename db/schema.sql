-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS uba_profile_db;

-- 데이터베이스 선택
\c uba_profile_db;

-- 프로파일 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    profile_type VARCHAR(20) NOT NULL, -- user, entity, hybrid
    analysis_scope VARCHAR(20) NOT NULL, -- department, role, global, custom
    log_source_name VARCHAR(100),
    log_source_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB NOT NULL -- 기타 프로필 데이터 JSON 형태로 저장
);

-- 프로필 상태 테이블
CREATE TABLE IF NOT EXISTS profile_status (
    profile_id VARCHAR(50) PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'stopped', -- stopped, running, paused, waiting
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 실행 이력 테이블
CREATE TABLE IF NOT EXISTS execution_history (
    id SERIAL PRIMARY KEY,
    profile_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- completed, failed, running
    results JSONB, -- 실행 결과 데이터
    alerts_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 베이스라인 설정 테이블
CREATE TABLE IF NOT EXISTS baseline_settings (
    profile_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    threshold FLOAT NOT NULL,
    sensitivity INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id, metric_name)
);

-- 베이스라인 작업 테이블 (수동 베이스라인 생성 추적)
CREATE TABLE IF NOT EXISTS baseline_jobs (
    job_id VARCHAR(100) PRIMARY KEY,
    profile_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- in_progress, completed, failed, cancelled
    progress_percentage INT DEFAULT 0,
    message TEXT,
    request_data JSONB, -- 요청 데이터 저장
    result_data JSONB, -- 결과 데이터 저장
    error_details TEXT, -- 오류 상세 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_profiles_type ON profiles(profile_type);
CREATE INDEX idx_profiles_scope ON profiles(analysis_scope);
CREATE INDEX idx_status_status ON profile_status(status);
CREATE INDEX idx_execution_profile_id ON execution_history(profile_id);
CREATE INDEX idx_execution_start_time ON execution_history(start_time);
CREATE INDEX idx_baseline_jobs_profile_id ON baseline_jobs(profile_id);
CREATE INDEX idx_baseline_jobs_status ON baseline_jobs(status);
CREATE INDEX idx_baseline_jobs_created_at ON baseline_jobs(created_at);
