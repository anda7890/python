from fastapi import APIRouter

from app.repositories.memory_store import EVENTS, FEEDBACKS, POLICIES, SCORES
from app.schemas.risk import EventEnvelope, FeedbackRequest, IngestResponse, RealtimeScoreRequest, RealtimeScoreResponse
from app.services.identity_service import score_identity
from app.services.liveness_service import score_liveness
from app.services.policy_engine import decide
from app.services.risk_explainer import build_reason_codes
from app.services.user_profile_service import build_profile_risk_factors, get_user_profile

router = APIRouter()


@router.post('/events/ingest', response_model=IngestResponse)
def ingest_event(event: EventEnvelope):
    EVENTS[event.trace_id] = event.model_dump(mode='json')
    return IngestResponse(trace_id=event.trace_id, accepted=True, message='event accepted')


@router.post('/score/realtime', response_model=RealtimeScoreResponse)
def score_realtime(req: RealtimeScoreRequest):
    event = req.event
    liveness = score_liveness(event)
    identity = score_identity(event)

    profile = get_user_profile(event.user_id)
    if profile:
        profile_score, profile_factors = build_profile_risk_factors(profile, liveness, identity)
        profile_snapshot = {
            'tags': profile.tags,
            'baseline_liveness': profile.bio_profile.liveness_mean_30d,
            'current_liveness': liveness,
            'baseline_identity': profile.bio_profile.identity_mean_30d,
            'current_identity': identity,
            'profile_risk_factors': profile_factors,
        }
    else:
        profile_score, profile_factors = 0.0, []
        profile_snapshot = {
            'tags': [],
            'baseline_liveness': 0.0,
            'current_liveness': liveness,
            'baseline_identity': 0.0,
            'current_identity': identity,
            'profile_risk_factors': [],
        }

    decision_result = decide(liveness, identity, profile_score)
    reason_codes = build_reason_codes(liveness, identity, profile_factors)

    result = {
        'trace_id': event.trace_id,
        'user_id': event.user_id,
        'risk_score': decision_result['risk_score'],
        'risk_level': decision_result['risk_level'],
        'decision': decision_result['decision'],
        'reason_codes': reason_codes,
        'policy_version': decision_result['policy_version'],
        'liveness_score': liveness,
        'identity_score': identity,
        'profile_snapshot': profile_snapshot,
        'feature_snapshot': event.payload,
    }

    SCORES[event.trace_id] = result
    return result


@router.post('/feedback')
def submit_feedback(req: FeedbackRequest):
    FEEDBACKS.append(req.model_dump())
    return {'success': True, 'trace_id': req.trace_id}


@router.get('/history')
def get_history():
    items = list(SCORES.values())
    items.sort(key=lambda x: x['trace_id'], reverse=True)
    return {'total': len(items), 'items': items}


@router.get('/policies')
def get_policies():
    return POLICIES
