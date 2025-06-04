/**
 * db.js - PostgreSQL 데이터베이스 연결 및 쿼리 모듈
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 데이터베이스 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // 연결 풀 설정
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 시도 타임아웃
});

// 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err);
    console.error('애플리케이션을 실행하려면 PostgreSQL 데이터베이스 연결이 필요합니다.');
    console.error('데이터베이스 서버가 실행 중인지 확인하고, .env 파일의 연결 정보를 확인해주세요.');
    process.exit(1); // 프로세스 종료 (오류 코드 1)
  } else {
    console.log('데이터베이스 연결 성공:', res.rows[0]);
  }
});

// 쿼리 래퍼 함수
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('실행된 쿼리:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('쿼리 실행 오류:', err);
    throw err; // 오류를 호출자에게 전파
  }
};

// 트랜잭션 관리 함수
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('트랜잭션 오류:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  withTransaction,
  pool
};
