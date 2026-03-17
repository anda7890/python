from app.repositories.memory_store import POLICIES


def decide(liveness_score: float, identity_score: float, profile_score: float) -> dict:
    weights = POLICIES['weights']
    thresholds = POLICIES['thresholds']

    event_score = 1 - ((liveness_score * 0.5) + (identity_score * 0.5))
    bio_shift_score = max(0.0, (0.85 - liveness_score)) * 0.5 + max(0.0, (0.85 - identity_score)) * 0.5
    total = (
        event_score * weights['event_score']
        + bio_shift_score * weights['bio_shift_score']
        + profile_score * weights['profile_behavior_score']
    )
    total = round(min(max(total, 0.0), 1.0), 4)

    if total < thresholds['pass']:
        risk_level = 'low'
        decision = 'pass'
    elif total < thresholds['review']:
        risk_level = 'medium'
        decision = 'challenge'
    else:
        risk_level = 'high'
        decision = 'reject'

    return {
        'risk_score': total,
        'risk_level': risk_level,
        'decision': decision,
        'policy_version': POLICIES['version'],
    }
