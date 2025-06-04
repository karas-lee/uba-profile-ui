/**
 * routes/profiles.js - 프로파일 관리 API 라우트
 */

const express = require('express');
const router = express.Router();
const db = require('../db/db');

/**
 * GET /api/profiles - 모든 프로파일 조회
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('프로파일 조회 오류:', err);
    res.status(500).json({ error: '프로파일 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/profiles/:id - 특정 프로파일 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM profiles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일을 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 조회 오류:', err);
    res.status(500).json({ error: '프로파일 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/profiles - 새 프로파일 생성
 */
router.post('/', async (req, res) => {
  try {
    const {
      id, name, profileType, analysisScope, logSourceName, logSourceType, description, ...otherData
    } = req.body;

    // 모든 데이터를 JSON으로 저장
    const data = { ...otherData };

    console.log('프로필 생성 요청:', { id, name, profileType, analysisScope, logSourceName, logSourceType });

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

    console.log('프로필 생성 완료:', result.rows[0]);

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
 * PUT /api/profiles/:id - 프로파일 업데이트
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, profileType, analysisScope, logSourceName, logSourceType, description, ...otherData
    } = req.body;

    // 모든 데이터를 JSON으로 저장
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 업데이트 오류:', err);
    res.status(500).json({ error: '프로파일 업데이트 중 오류가 발생했습니다.' });
  }
});

/**
 * DELETE /api/profiles/:id - 프로파일 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 관련 상태 정보도 함께 삭제 (CASCADE 설정으로 자동 삭제됨)
    const result = await db.query('DELETE FROM profiles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일을 찾을 수 없습니다.' });
    }

    res.json({ message: '프로파일이 삭제되었습니다.', profile: result.rows[0] });
  } catch (err) {
    console.error('프로파일 삭제 오류:', err);
    res.status(500).json({ error: '프로파일 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
