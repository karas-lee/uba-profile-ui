/**
 * api.js - API 서비스 모듈
 * 서버 API 호출을 위한 공통 함수를 제공합니다.
 */

// 프로필 관련 API 호출

// 모든 프로필 목록 조회
async function fetchProfiles() {
  try {
    console.log('API 호출: 모든 프로필 가져오기 시작');
    const response = await fetch('/api/profiles');

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`프로필 데이터를 가져오는데 실패했습니다. 상태 코드: ${response.status}`, errorText);

      if (response.status === 500) {
        alert('서버에 오류가 발생했습니다. 데이터베이스 연결이 올바르게 구성되었는지 확인하세요.');
      }

      throw new Error(`프로필 데이터를 가져오는데 실패했습니다. 상태 코드: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API 응답 텍스트:', responseText);

    // 빈 응답 처리
    if (!responseText.trim()) {
      console.warn('서버에서 빈 응답을 반환했습니다. 빈 배열 반환');
      return [];
    }

    try {
      const data = JSON.parse(responseText);
      console.log('가져온 프로필 수:', data.length);
      return data;
    } catch (jsonError) {
      console.error('JSON 파싱 오류:', jsonError);
      return [];
    }
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return [];
  }
}

// 특정 프로필 조회
async function fetchProfileById(id) {
  try {
    const response = await fetch(`/api/profiles/${id}`);
    if (!response.ok) {
      throw new Error('프로필 데이터를 가져오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error(`프로필 ${id} 조회 오류:`, error);
    return null;
  }
}

// 프로필 생성
async function createProfile(profileData) {
  try {
    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('프로필 생성에 실패했습니다.');
    }

    // 응답 내용이 있는지 확인
    const text = await response.text();
    if (!text) {
      console.log('서버에서 빈 응답을 반환했습니다.');
      return { id: profileData.id };
    }

    // JSON 파싱 시도
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('응답을 JSON으로 파싱하는데 실패했습니다:', jsonError);
      return { id: profileData.id };
    }
  } catch (error) {
    console.error('프로필 생성 오류:', error);
    return null;
  }
}

// 프로필 업데이트
async function updateProfile(id, profileData) {
  try {
    const response = await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('프로필 업데이트에 실패했습니다.');
    }

    // 응답 내용이 있는지 확인
    const text = await response.text();
    if (!text) {
      console.log('서버에서 빈 응답을 반환했습니다.');
      return { id: profileData.id };
    }

    // JSON 파싱 시도
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('응답을 JSON으로 파싱하는데 실패했습니다:', jsonError);
      return { id: profileData.id };
    }
  } catch (error) {
    console.error(`프로필 ${id} 업데이트 오류:`, error);
    return null;
  }
}

// 프로필 삭제
async function deleteProfile(id) {
  try {
    const response = await fetch(`/api/profiles/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('프로필 삭제에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error(`프로필 ${id} 삭제 오류:`, error);
    return false;
  }
}

// 프로필 상태 관련 API 호출

// 모든 프로필 상태 조회
async function fetchProfileStatuses() {
  try {
    const response = await fetch('/api/profile-status');
    if (!response.ok) {
      throw new Error('프로필 상태 데이터를 가져오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('프로필 상태 조회 오류:', error);
    return [];
  }
}

// 특정 프로필 상태 조회
async function fetchProfileStatus(profileId) {
  try {
    const response = await fetch(`/api/profile-status/${profileId}`);
    if (!response.ok) {
      throw new Error('프로필 상태 데이터를 가져오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error(`프로필 ${profileId} 상태 조회 오류:`, error);
    return null;
  }
}

// 프로필 상태 업데이트
async function updateProfileStatus(profileId, statusData) {
  try {
    const response = await fetch(`/api/profile-status/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      throw new Error('프로필 상태 업데이트에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error(`프로필 ${profileId} 상태 업데이트 오류:`, error);
    return null;
  }
}

// 로컬 스토리지와 호환성 유지를 위한 함수들

// 로컬 스토리지에서 프로필 목록을 가져오는 함수를 오버라이드
// 실제로는 서버 API를 호출하지만 UI 코드는 최소한으로 변경하기 위해 같은 형태로 제공
async function getProfilesCompat() {
  const profiles = await fetchProfiles();
  return profiles;
}

// 로컬 스토리지용 프로필 저장 함수를 오버라이드
// 실제로는 서버 API를 호출하지만 기존 코드와 호환성 유지
async function saveProfileCompat(profileData) {
  let result;
  if (profileData.id) {
    // 기존 프로필 업데이트
    result = await updateProfile(profileData.id, profileData);
  } else {
    // 새 프로필 생성
    profileData.id = generateUniqueId(); // ID 생성
    result = await createProfile(profileData);
  }
  return !!result;
}

// 로컬 스토리지용 프로필 상태 저장 함수를 오버라이드
async function saveProfileStatusCompat(profileId, statusData) {
  const result = await updateProfileStatus(profileId, statusData);
  return !!result;
}

// 로컬 스토리지용 프로필 상태 조회 함수를 오버라이드
async function getProfileStatusCompat(profileId) {
  const status = await fetchProfileStatus(profileId);
  return status || {
    status: 'stopped',
    lastRun: null,
    nextRun: null,
    priority: 'medium'
  };
}

// 로컬 스토리지용 프로필 삭제 함수를 오버라이드
async function deleteProfileCompat(profileId) {
  return await deleteProfile(profileId);
}

// 고유 ID 생성 함수 유지
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
