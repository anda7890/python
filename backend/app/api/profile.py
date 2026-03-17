from fastapi import APIRouter, HTTPException

from app.services.user_profile_service import get_user_profile

router = APIRouter()


@router.get('/{user_id}')
def get_profile(user_id: str):
    profile = get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail='profile not found')
    return profile


@router.get('/{user_id}/diff')
def get_profile_diff(user_id: str, current_liveness: float = 0.0, current_identity: float = 0.0):
    profile = get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail='profile not found')

    return {
        'user_id': user_id,
        'baseline_liveness': profile.bio_profile.liveness_mean_30d,
        'current_liveness': current_liveness,
        'baseline_identity': profile.bio_profile.identity_mean_30d,
        'current_identity': current_identity,
        'liveness_diff': round(current_liveness - profile.bio_profile.liveness_mean_30d, 4),
        'identity_diff': round(current_identity - profile.bio_profile.identity_mean_30d, 4),
        'tags': profile.tags,
    }
