# UBA 프로파일 마법사

사용자 및 엔터티 행동 분석(UBA) 프로파일을 생성하고 관리하는 웹 기반 애플리케이션입니다.

## 기능

- UBA 프로파일 생성 마법사
- 프로파일 목록 관리
- 프로파일 편집 및 삭제
- 프로파일 상세 정보 보기
- 로컬 스토리지 데이터 저장

## 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- npm 또는 yarn

### 설치

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

3. 서버 실행
```bash
npm start
# 또는
yarn start
```

4. 브라우저에서 `http://localhost:3000`으로 접속

## 개발 모드

개발 중에는 자동 새로고침을 위해 nodemon을 사용할 수 있습니다:

```bash
npm run dev
# 또는
yarn dev
```

## 기술 스택

- HTML/CSS/JavaScript (순수 프론트엔드)
- localStorage (클라이언트 측 데이터 저장)
- Express.js (간단한 웹 서버)

## 라이선스

MIT 