from typing import Any, Dict, List

EVENTS: Dict[str, dict] = {}
SCORES: Dict[str, dict] = {}
FEEDBACKS: List[dict] = []
POLICIES: Dict[str, Any] = {
    'version': 'policy_v1',
    'weights': {
        'event_score': 0.50,
        'bio_shift_score': 0.25,
        'profile_behavior_score': 0.25,
    },
    'thresholds': {
        'pass': 0.35,
        'review': 0.65,
    }
}
