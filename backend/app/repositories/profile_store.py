from datetime import datetime, timezone

from app.schemas.user_profile import UserProfile

PROFILE_DB = {
    'u_10001': UserProfile(
        user_id='u_10001',
        tags=['高频认证用户', '设备漂移敏感', '真人性稳定'],
        base_profile={
            'register_days': 320,
            'kyc_level': 'L2',
            'trusted_device_count': 2,
            'historical_pass_rate': 0.93,
        },
        behavior_profile={
            'auth_count_1d': 4,
            'auth_count_7d': 19,
            'auth_count_30d': 66,
            'device_switch_count_7d': 3,
            'geo_change_count_7d': 2,
            'active_hours': ['09', '10', '21'],
        },
        bio_profile={
            'liveness_mean_30d': 0.91,
            'liveness_std_30d': 0.04,
            'identity_mean_30d': 0.88,
            'identity_std_30d': 0.06,
            'probe_stability_score': 0.86,
        },
        risk_profile={
            'recent_risk_level': 'medium',
            'risk_uptrend': True,
            'top_reason_codes': ['DEVICE_DRIFT', 'BIO_PATTERN_SHIFT'],
        },
        updated_at=datetime.now(timezone.utc),
    )
}
