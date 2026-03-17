from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class EventEnvelope(BaseModel):
    trace_id: str
    schema_version: str = '1.0.0'
    scene: str
    user_id: str
    device_id: Optional[str] = None
    ip: Optional[str] = None
    event_time: datetime
    payload: Dict[str, Any] = Field(default_factory=dict)


class RealtimeScoreRequest(BaseModel):
    event: EventEnvelope


class ProfileSnapshot(BaseModel):
    tags: List[str] = Field(default_factory=list)
    baseline_liveness: float = 0.0
    current_liveness: float = 0.0
    baseline_identity: float = 0.0
    current_identity: float = 0.0
    profile_risk_factors: List[str] = Field(default_factory=list)


class RealtimeScoreResponse(BaseModel):
    trace_id: str
    user_id: str
    risk_score: float
    risk_level: str
    decision: str
    reason_codes: List[str]
    policy_version: str
    liveness_score: float
    identity_score: float
    profile_snapshot: ProfileSnapshot
    feature_snapshot: Dict[str, Any] = Field(default_factory=dict)


class FeedbackRequest(BaseModel):
    trace_id: str
    user_id: str
    feedback_type: str
    comment: Optional[str] = None


class IngestResponse(BaseModel):
    trace_id: str
    accepted: bool
    message: str
