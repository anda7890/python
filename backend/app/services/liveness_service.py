from app.schemas.risk import EventEnvelope


def score_liveness(event: EventEnvelope) -> float:
    payload = event.payload or {}
    eye_blink = float(payload.get('eye_blink_score', 0.8))
    mouth_motion = float(payload.get('mouth_motion_score', 0.8))
    texture_consistency = float(payload.get('texture_consistency', 0.8))

    score = (eye_blink * 0.3) + (mouth_motion * 0.3) + (texture_consistency * 0.4)
    return round(max(0.0, min(score, 1.0)), 4)
