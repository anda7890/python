def build_reason_codes(liveness_score: float, identity_score: float, profile_factors: list[str]) -> list[str]:
    reason_codes: list[str] = []

    if liveness_score < 0.75:
        reason_codes.append('LOW_LIVENESS')

    if identity_score < 0.78:
        reason_codes.append('LOW_IDENTITY_MATCH')

    reason_codes.extend(profile_factors)

    if not reason_codes:
        reason_codes.append('NO_SIGNIFICANT_RISK')

    return reason_codes
