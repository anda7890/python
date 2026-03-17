from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class BaseProfile(BaseModel):
    register_days: int = 0
    kyc_level: str = 'L0'
    trusted_device_count: int = 0
    historical_pass_rate: float = 0.0


class BehaviorProfile(BaseModel):
    auth_count_1d: int = 0
    auth_count_7d: int = 0
    auth_count_30d: int = 0
    device_switch_count_7d: int = 0
    geo_change_count_7d: int = 0
    active_hours: List[str] = Field(default_factory=list)


class BioProfile(BaseModel):
    liveness_mean_30d: float = 0.0
    liveness_std_30d: float = 0.0
    identity_mean_30d: float = 0.0
    identity_std_30d: float = 0.0
    probe_stability_score: float = 0.0


class RiskProfile(BaseModel):
    recent_risk_level: str = 'low'
    risk_uptrend: bool = False
    top_reason_codes: List[str] = Field(default_factory=list)


class UserProfile(BaseModel):
    user_id: str
    profile_version: str = 'v1'
    tags: List[str] = Field(default_factory=list)
    base_profile: BaseProfile = Field(default_factory=BaseProfile)
    behavior_profile: BehaviorProfile = Field(default_factory=BehaviorProfile)
    bio_profile: BioProfile = Field(default_factory=BioProfile)
    risk_profile: RiskProfile = Field(default_factory=RiskProfile)
    updated_at: datetime
