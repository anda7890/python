from typing import List, Optional, Tuple

from app.repositories.profile_store import PROFILE_DB
from app.schemas.user_profile import UserProfile


def get_user_profile(user_id: str) -> Optional[UserProfile]:
    return PROFILE_DB.get(user_id)


def build_profile_risk_factors(
    profile: UserProfile,
    current_liveness: float,
    current_identity: float,
) -> Tuple[float, List[str]]:
    factors: List[str] = []
    score = 0.0

    if profile.behavior_profile.auth_count_1d >= 5:
        score += 0.15
        factors.append('HIGH_AUTH_FREQUENCY')

    if profile.behavior_profile.device_switch_count_7d >= 3:
        score += 0.20
        factors.append('DEVICE_SWITCH_ABNORMAL')

    if profile.behavior_profile.geo_change_count_7d >= 2:
        score += 0.15
        factors.append('GEO_DRIFT')

    if abs(current_liveness - profile.bio_profile.liveness_mean_30d) > 0.15:
        score += 0.20
        factors.append('BIO_PATTERN_SHIFT')

    if abs(current_identity - profile.bio_profile.identity_mean_30d) > 0.12:
        score += 0.20
        factors.append('IDENTITY_PATTERN_SHIFT')

    if profile.risk_profile.risk_uptrend:
        score += 0.10
        factors.append('RISK_UPTREND')

    return round(min(score, 1.0), 4), factors
