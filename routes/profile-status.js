/**
 * routes/profile-status.js - 프로파일 상태 관리 API 라우트
 */

const express = require('express');
const router = express.Router();
const db = require('../db/db');

/**
 * GET /api/profile-status - 모든 프로파일 상태 조회
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ps.*, p.name as profile_name
      FROM profile_status ps
      JOIN profiles p ON ps.profile_id = p.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('프로파일 상태 조회 오류:', err);
    res.status(500).json({ error: '프로파일 상태 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/profile-status/:profileId - 특정 프로파일 상태 조회
 */
router.get('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const result = await db.query('SELECT * FROM profile_status WHERE profile_id = $1', [profileId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일 상태를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 상태 조회 오류:', err);
    res.status(500).json({ error: '프로파일 상태 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * PUT /api/profile-status/:profileId - 프로파일 상태 업데이트
 */
router.put('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { status, nextRun, priority } = req.body;

    const updateFields = [];
    const values = [profileId];
    let valueIndex = 2;

    // 동적으로 업데이트할 필드 구성
    if (status) {
      updateFields.push(`status = $${valueIndex}`);
      values.push(status);
      valueIndex++;
    }

    if (nextRun !== undefined) {
      updateFields.push(`next_run = $${valueIndex}`);
      values.push(nextRun);
      valueIndex++;
    }

    if (priority) {
      updateFields.push(`priority = $${valueIndex}`);
      values.push(priority);
      valueIndex++;
    }

    // status가 running인 경우 last_run 업데이트
    if (status === 'running') {
      updateFields.push(`last_run = CURRENT_TIMESTAMP`);
    }

    // 업데이트할 필드가 없는 경우
    if (updateFields.length === 0) {
      return res.status(400).json({ error: '업데이트할 필드가 없습니다.' });
    }

    // updated_at은 항상 업데이트
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE profile_status
      SET ${updateFields.join(', ')}
      WHERE profile_id = $1
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로파일 상태를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('프로파일 상태 업데이트 오류:', err);
    res.status(500).json({ error: '프로파일 상태 업데이트 중 오류가 발생했습니다.' });
  }
});

// 프로파일 상태 일괄 조회(프로파일 기본 정보와 함께)
router.get('/all/with-profile', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.name, p.profile_type, p.analysis_scope,
             ps.status, ps.last_run, ps.next_run, ps.priority
      FROM profiles p
      LEFT JOIN profile_status ps ON p.id = ps.profile_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('프로파일 상태 조회 오류:', err);
    res.status(500).json({ error: '프로파일 상태 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
