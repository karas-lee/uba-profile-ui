#!/usr/bin/env python3
"""
베이스라인 엔진 API 클라이언트 예시

기존 프로파일 등록 마법사 UI에서 베이스라인 엔진 API를 호출하는 예시입니다.
"""

import requests
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaselineEngineAPIClient:
    """베이스라인 엔진 API 클라이언트"""

    def __init__(self, base_url: str = "http://localhost:8000", timeout: int = 30):
        """
        API 클라이언트 초기화

        Args:
            base_url: 베이스라인 엔진 API 서버 URL
            timeout: 요청 타임아웃 (초)
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()

        # 공통 헤더 설정
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def health_check(self) -> Dict[str, Any]:
        """API 서버 상태 확인"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"헬스 체크 실패: {e}")
            raise

    def get_supported_metrics(self) -> Dict[str, Any]:
        """지원하는 메트릭 목록 조회"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/profiles/metrics/supported",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"지원 메트릭 조회 실패: {e}")
            raise

    def create_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 프로파일 생성

        Args:
            profile_data: 프로파일 설정 데이터

        Returns:
            생성된 프로파일 정보
        """
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/profiles/",
                json=profile_data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 생성 실패: {e}")
            if hasattr(e.response, 'json'):
                try:
                    error_detail = e.response.json()
                    logger.error(f"서버 오류 상세: {error_detail}")
                except:
                    pass
            raise

    def get_profiles(self, **filters) -> Dict[str, Any]:
        """
        프로파일 목록 조회

        Args:
            **filters: 필터 조건 (status, profile_type, log_source 등)

        Returns:
            프로파일 목록
        """
        try:
            params = {k: v for k, v in filters.items() if v is not None}
            response = self.session.get(
                f"{self.base_url}/api/v1/profiles/",
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 목록 조회 실패: {e}")
            raise

    def get_profile(self, profile_id: str) -> Dict[str, Any]:
        """
        특정 프로파일 조회

        Args:
            profile_id: 프로파일 ID

        Returns:
            프로파일 정보
        """
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/profiles/{profile_id}",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 조회 실패: {e}")
            raise

    def update_profile(self, profile_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        프로파일 업데이트

        Args:
            profile_id: 프로파일 ID
            update_data: 업데이트할 데이터

        Returns:
            업데이트된 프로파일 정보
        """
        try:
            response = self.session.put(
                f"{self.base_url}/api/v1/profiles/{profile_id}",
                json=update_data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 업데이트 실패: {e}")
            raise

    def update_profile_status(self, profile_id: str, status: str, reason: str = None) -> Dict[str, Any]:
        """
        프로파일 상태 업데이트

        Args:
            profile_id: 프로파일 ID
            status: 새 상태 (active, inactive, error)
            reason: 상태 변경 이유

        Returns:
            업데이트된 프로파일 정보
        """
        try:
            status_data = {"status": status}
            if reason:
                status_data["reason"] = reason

            response = self.session.patch(
                f"{self.base_url}/api/v1/profiles/{profile_id}/status",
                json=status_data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 상태 업데이트 실패: {e}")
            raise

    def diagnose_profile(self, profile_id: str) -> Dict[str, Any]:
        """
        프로파일 진단

        Args:
            profile_id: 프로파일 ID

        Returns:
            진단 결과
        """
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/profiles/{profile_id}/diagnose",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 진단 실패: {e}")
            raise

    def delete_profile(self, profile_id: str) -> bool:
        """
        프로파일 삭제

        Args:
            profile_id: 프로파일 ID

        Returns:
            삭제 성공 여부
        """
        try:
            response = self.session.delete(
                f"{self.base_url}/api/v1/profiles/{profile_id}",
                timeout=self.timeout
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"프로파일 삭제 실패: {e}")
            raise


class VpnProfileHelper:
    """VPN 프로파일 생성 도우미"""

    # VPN 관련 메트릭 목록
    VPN_RELEVANT_METRICS = [
        # 시간 기반
        "login_time_pattern",
        "session_duration",
        "after_hours_activity",
        "weekend_holiday_access",
        "login_frequency_change",
        "concurrent_session_detection",
        "timezone_anomaly_access",

        # 네트워크 기반
        "ip_address_pattern",
        "geo_location_analysis",
        "data_volume_transfer",
        "impossible_travel_detection",
        "vpn_usage_pattern",
        "network_device_change",
        "bandwidth_usage_anomaly",
        "connection_pattern_analysis"
    ]

    @staticmethod
    def create_vpn_profile_config(
        name: str,
        description: str = None,
        departments: List[str] = None,
        user_types: List[str] = None,
        selected_metrics: List[str] = None,
        learning_period: int = 30,
        alert_threshold: float = 0.8,
        warning_threshold: float = 0.6
    ) -> Dict[str, Any]:
        """
        VPN 프로파일 설정 생성

        Args:
            name: 프로파일 이름
            description: 프로파일 설명
            departments: 대상 부서 목록
            user_types: 대상 사용자 유형 목록
            selected_metrics: 선택된 메트릭 목록
            learning_period: 학습 기간 (일)
            alert_threshold: 알림 임계값
            warning_threshold: 경고 임계값

        Returns:
            프로파일 설정 딕셔너리
        """
        # 기본값 설정
        if description is None:
            description = f"{name} - VPN 접속 패턴 및 네트워크 행동 분석"

        if departments is None:
            departments = ["IT", "Finance", "HR", "Sales", "Engineering"]

        if user_types is None:
            user_types = ["employee", "contractor", "admin"]

        if selected_metrics is None:
            # 기본적으로 가장 중요한 VPN 메트릭들만 선택
            selected_metrics = [
                "login_time_pattern",
                "session_duration",
                "vpn_usage_pattern",
                "geo_location_analysis",
                "impossible_travel_detection",
                "network_device_change"
            ]

        return {
            "name": name,
            "description": description,
            "profile_type": "user",
            "analysis_scope": "network_access",
            "log_source": "vpn",
            "learning_period": learning_period,
            "selected_metrics": selected_metrics,
            "threshold_settings": {
                "alert_threshold": alert_threshold,
                "warning_threshold": warning_threshold,
                "minimum_deviation_score": 0.3
            },
            "target_entities": {
                "departments": departments,
                "user_types": user_types
            }
        }

    @staticmethod
    def validate_vpn_metrics(selected_metrics: List[str]) -> Dict[str, Any]:
        """
        VPN 메트릭 선택 유효성 검증

        Args:
            selected_metrics: 선택된 메트릭 목록

        Returns:
            검증 결과
        """
        # VPN에 적합하지 않은 메트릭들
        vpn_incompatible = [
            "database_query_pattern",
            "email_behavior_pattern",
            "system_command_execution",
            "shared_folder_access",
            "application_usage_pattern"
        ]

        invalid_metrics = [m for m in selected_metrics if m in vpn_incompatible]
        missing_essential = []

        # 필수 메트릭 체크
        essential_metrics = ["login_time_pattern", "session_duration", "vpn_usage_pattern"]
        for essential in essential_metrics:
            if essential not in selected_metrics:
                missing_essential.append(essential)

        warnings = []
        recommendations = []

        if invalid_metrics:
            warnings.append(f"VPN 로그에 적합하지 않은 메트릭: {', '.join(invalid_metrics)}")
            recommendations.append("VPN 로그에 적합한 메트릭으로 변경하세요")

        if missing_essential:
            warnings.append(f"필수 메트릭 누락: {', '.join(missing_essential)}")
            recommendations.append("VPN 분석을 위한 필수 메트릭을 추가하세요")

        if len(selected_metrics) < 3:
            warnings.append("선택된 메트릭이 너무 적습니다")
            recommendations.append("최소 3개 이상의 메트릭을 선택하세요")

        return {
            "is_valid": len(invalid_metrics) == 0 and len(missing_essential) == 0,
            "warnings": warnings,
            "recommendations": recommendations,
            "invalid_metrics": invalid_metrics,
            "missing_essential": missing_essential
        }


def example_usage():
    """API 클라이언트 사용 예시"""

    # API 클라이언트 초기화
    client = BaselineEngineAPIClient("http://localhost:8000")

    try:
        # 1. 서버 상태 확인
        health = client.health_check()
        print(f"서버 상태: {health}")

        # 2. 지원 메트릭 조회
        metrics = client.get_supported_metrics()
        print(f"지원 메트릭: {metrics}")

        # 3. VPN 프로파일 설정 생성
        vpn_config = VpnProfileHelper.create_vpn_profile_config(
            name="VPN 사용자 베이스라인 프로파일",
            description="VPN 접속 패턴 및 보안 행동 분석",
            departments=["IT", "Finance", "Engineering"],
            selected_metrics=[
                "login_time_pattern",
                "session_duration",
                "vpn_usage_pattern",
                "geo_location_analysis",
                "impossible_travel_detection"
            ]
        )

        # 4. 메트릭 유효성 검증
        validation = VpnProfileHelper.validate_vpn_metrics(vpn_config["selected_metrics"])
        print(f"메트릭 검증 결과: {validation}")

        if validation["is_valid"]:
            # 5. 프로파일 생성
            profile = client.create_profile(vpn_config)
            print(f"생성된 프로파일: {profile}")

            profile_id = profile["id"]

            # 6. 프로파일 진단
            diagnosis = client.diagnose_profile(profile_id)
            print(f"프로파일 진단: {diagnosis}")

            # 7. 프로파일 상태 활성화
            updated_profile = client.update_profile_status(
                profile_id,
                "active",
                "VPN 모니터링 시작"
            )
            print(f"활성화된 프로파일: {updated_profile}")

        else:
            print("메트릭 검증 실패:")
            for warning in validation["warnings"]:
                print(f"  - {warning}")
            for recommendation in validation["recommendations"]:
                print(f"  권장사항: {recommendation}")

        # 8. 기존 프로파일 목록 조회
        profiles = client.get_profiles(status="active", log_source="vpn")
        print(f"활성 VPN 프로파일 수: {profiles['count']}")

    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")


if __name__ == "__main__":
    # 사용 예시 실행
    example_usage()
