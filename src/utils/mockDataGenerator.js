const EVENT_TYPES = [
  'sensor_accel',
  'sensor_gyro',
  'sensor_mag',
  'touch_pressure',
  'gesture_swipe',
  'action_route',
  'behavior_trace',
  'device_profile',
];

const MODELS = ['iPhone 13', 'Samsung Galaxy S21', 'Google Pixel 6', 'OnePlus 9', 'Huawei P40'];
const MANUFACTURERS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Huawei'];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const OUTCOMES = ['PASS', 'CHALLENGE', 'REJECT'];

const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const pick = (list) => list[randomInt(0, list.length - 1)];
const round = (num, digits = 3) => Number(num.toFixed(digits));

const getRiskLevel = (score) => {
  if (score >= 0.8) return 'HIGH';
  if (score >= 0.55) return 'MEDIUM';
  return 'LOW';
};

const getOutcome = (score) => {
  if (score >= 0.8) return 'REJECT';
  if (score >= 0.55) return 'CHALLENGE';
  return 'PASS';
};

const buildDecisionReasons = (scores, deviceInfo) => {
  const reasons = [];
  if (scores.score_live_sequence > 0.75) reasons.push('传感器时序存在机械重复性');
  if (scores.score_habit_deviation > 0.65) reasons.push('当前会话与历史习惯偏离明显');
  if (deviceInfo.emulator_signal) reasons.push('设备存在模拟器迹象');
  if (deviceInfo.root_jailbreak_signal) reasons.push('设备存在 root/jailbreak 风险');
  if (scores.score_identity_behavior > 0.7) reasons.push('行为链路与历史本人模式不一致');
  return reasons.length ? reasons : ['未发现显著风险因子'];
};

export const generateRealtimeAssessment = (index = 0) => {
  const deviceInfo = {
    model: pick(MODELS),
    manufacturer: pick(MANUFACTURERS),
    abi: pick(['arm64-v8a', 'armeabi-v7a', 'x86_64']),
    emulator_signal: Math.random() > 0.84,
    root_jailbreak_signal: Math.random() > 0.9,
    debug_signal: Math.random() > 0.87,
    sensor_count: randomInt(8, 18),
    tz: pick(['Asia/Shanghai', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']),
    locale: pick(['zh-CN', 'en-US', 'ja-JP', 'ko-KR']),
  };

  const scores = {
    score_live_human: round(random(0.15, 0.98)),
    score_live_sequence: round(random(0.08, 0.97)),
    score_identity_bio: round(random(0.12, 0.96)),
    score_identity_behavior: round(random(0.1, 0.95)),
    score_habit_deviation: round(random(0.05, 0.92)),
    device_risk_score: round(random(0.05, 0.88)),
    history_trust_score: round(random(0.2, 0.99)),
  };

  const aggregatedRisk = round(
    scores.score_live_sequence * 0.22 +
    scores.score_identity_bio * 0.24 +
    scores.score_identity_behavior * 0.22 +
    scores.score_habit_deviation * 0.18 +
    scores.device_risk_score * 0.14,
  );

  const riskLevel = getRiskLevel(aggregatedRisk);
  const outcome = getOutcome(aggregatedRisk);

  return {
    assessment_id: `asm_${Date.now()}_${index}`,
    trace_id: `trace_${Date.now()}_${index}`,
    strategy_id: 'bio_probe_strategy',
    strategy_version: 's1.2.0',
    user_id: `user_${randomInt(1000, 9999)}`,
    session_id: `sess_${randomInt(10000, 99999)}`,
    device_id: `dev_${randomInt(10000, 99999)}`,
    scene_id: pick(['login', 'payment', 'bind_card', 'profile_update']),
    event_type: pick(EVENT_TYPES),
    event_time_ms: Date.now() - randomInt(1000, 2 * 60 * 60 * 1000),
    server_recv_time_ms: Date.now() - randomInt(500, 60 * 60 * 1000),
    schema_version: pick(['v1', 'v1', 'v1', 'v2']),
    feature_version: 'v1',
    profile_version: `profile_${randomInt(3, 8)}`,
    risk_result: {
      outcome,
      risk_level: riskLevel,
      timestamp: new Date().toISOString(),
      aggregate_score: aggregatedRisk,
      scores,
      decision_reasons: buildDecisionReasons(scores, deviceInfo),
    },
    device_info: deviceInfo,
  };
};

export const generateRealTimeScores = (count = 12) =>
  Array.from({ length: count }, (_, index) => generateRealtimeAssessment(index));

export const generateRealtimeMetrics = (items) => {
  const list = items?.length ? items : generateRealTimeScores(18);
  const counts = list.reduce(
    (acc, item) => {
      const outcome = item.risk_result.outcome;
      acc.total += 1;
      acc[outcome] += 1;
      return acc;
    },
    { total: 0, PASS: 0, CHALLENGE: 0, REJECT: 0 },
  );

  const avgRiskScore =
    list.reduce((sum, item) => sum + item.risk_result.aggregate_score, 0) / Math.max(list.length, 1);

  const schemaDriftCount = list.filter((item) => item.schema_version !== 'v1').length;
  const emulatorCount = list.filter((item) => item.device_info.emulator_signal).length;

  return {
    ...counts,
    avgRiskScore: round(avgRiskScore),
    schemaDriftCount,
    emulatorCount,
    decisionLatencyP95: randomInt(120, 280),
  };
};

export const generateHistoryEvents = (count = 20) =>
  Array.from({ length: count }, (_, index) => {
    const assessment = generateRealtimeAssessment(index);
    return {
      event_id: `evt_${Date.now()}_${index}`,
      ...assessment,
      timestamp: new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString(),
      action_route: ['登录页', '验证码页', '首页', '支付页'].slice(0, randomInt(2, 4)),
      feedback_status: pick(['待反馈', '已回流', '待复核']),
      final_label: pick(['fraud', 'legit', 'pending']),
      data_quality: {
        required_missing_rate: round(random(0, 0.03), 4),
        time_skew_ms: randomInt(20, 450),
        enum_invalid_rate: round(random(0, 0.01), 4),
      },
      behavior_data: {
        pressure_data: `pressure=${round(random(0.2, 0.95), 2)}, touch_major=${round(random(1, 8), 2)}`,
        swipe_path: `(${randomInt(0, 240)}, ${randomInt(0, 600)}) -> (${randomInt(240, 420)}, ${randomInt(600, 840)})`,
        action_route: `路径: ${['登录', '验证', '支付', '完成'].slice(0, randomInt(2, 4)).join(' -> ')}`,
        behavior_pattern: `操作节奏=${pick(['平稳', '偏快', '异常中断'])}, 停留=${randomInt(3, 60)}秒`,
      },
      risk_scores: assessment.risk_result.scores,
    };
  });

export const generatePolicies = (count = 6) => {
  const policyNames = [
    '真人性快速放行策略',
    '本人性二次校验策略',
    '设备异常拦截策略',
    '时序机械化识别策略',
    '行为习惯偏离预警策略',
    '画像写回保护策略',
  ];

  return Array.from({ length: count }, (_, index) => ({
    policy_id: `policy_${index + 1}`,
    policy_name: policyNames[index % policyNames.length],
    risk_level: pick(RISK_LEVELS),
    threshold: round(random(0.35, 0.9), 2),
    decision: pick(OUTCOMES),
    strategy_version: `s1.${index}.0`,
    enabled: Math.random() > 0.2,
    scene_id: pick(['login', 'payment', 'bind_card']),
    description: '用于生物探针双任务风控的示例策略，支持版本化与回放。',
  }));
};

export const validateEventEnvelope = (payload) => {
  const requiredFields = [
    'event_id',
    'user_id',
    'session_id',
    'device_id',
    'app_id',
    'app_version',
    'os_type',
    'os_version',
    'event_type',
    'event_time_ms',
    'server_recv_time_ms',
    'schema_version',
  ];

  const missing = requiredFields.filter((field) => !payload?.[field]);
  const timeSkew = Math.abs(Number(payload?.server_recv_time_ms || 0) - Number(payload?.event_time_ms || 0));
  const warnings = [];

  if (payload?.schema_version && !['v1', 'v2'].includes(payload.schema_version)) {
    warnings.push('schema_version 未在允许范围内');
  }
  if (payload?.event_type && !EVENT_TYPES.includes(payload.event_type)) {
    warnings.push('event_type 未在约定枚举内');
  }
  if (timeSkew > 5000) {
    warnings.push('端侧与服务端时间偏移过大');
  }

  return {
    pass: missing.length === 0 && warnings.length === 0,
    missing,
    warnings,
    timeSkew,
    normalized_event_type: payload?.event_type || 'unknown',
  };
};


export const generateUserProfile = (userId = 'u_10001') => ({
  user_id: userId,
  profile_version: 'profile_v1',
  tags: ['高频认证用户', '设备漂移敏感', '真人性稳定'],
  base_profile: {
    register_days: 320,
    kyc_level: 'L2',
    trusted_device_count: 2,
    historical_pass_rate: 0.93,
  },
  behavior_profile: {
    auth_count_1d: 4,
    auth_count_7d: 19,
    auth_count_30d: 66,
    device_switch_count_7d: 3,
    geo_change_count_7d: 2,
    active_hours: ['09', '10', '21'],
  },
  bio_profile: {
    liveness_mean_30d: 0.91,
    liveness_std_30d: 0.04,
    identity_mean_30d: 0.88,
    identity_std_30d: 0.06,
    probe_stability_score: 0.86,
  },
  risk_profile: {
    recent_risk_level: 'medium',
    risk_uptrend: true,
    top_reason_codes: ['DEVICE_DRIFT', 'BIO_PATTERN_SHIFT'],
  },
  updated_at: new Date().toISOString(),
});
