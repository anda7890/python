from app.schemas.risk import EventEnvelope


def score_identity(event: EventEnvelope) -> float:
    payload = event.payload or {}
    face_match = float(payload.get('face_match_score', 0.8))
    id_match = float(payload.get('id_match_score', 0.8))
    embedding_similarity = float(payload.get('embedding_similarity', 0.8))

    score = (face_match * 0.45) + (id_match * 0.25) + (embedding_similarity * 0.30)
    return round(max(0.0, min(score, 1.0)), 4)
