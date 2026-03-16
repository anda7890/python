// 模拟数据生成器 - 用于开发环境测试

export const generateRealTimeScores = (count = 12) => {
  const outcomes = ['PASS', 'CHALLENGE', 'REJECT'];
  const riskLevels = ['Low', 'Medium', 'High'];
  
  return Array.from({ length: count }, (_, index) => ({
    user_id: `user_${Math.floor(Math.random() * 10000)}`,
    risk_result: {
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      timestamp: new Date().toISOString(),
      scores: {
        score_live_human: Math.random(),
        score_identity_bio: Math.random(),
        score_device_fingerprint: Math.random(),
        score_behavior_pattern: Math.random(),
      },
    },
  }));
};

export const generateHistoryEvents = (count = 20) => {
  const eventTypes = ['LOGIN', 'TRANSACTION', 'PROFILE_UPDATE', 'PASSWORD_CHANGE'];
  const riskLevels = ['Low', 'Medium', 'High'];
  
  return Array.from({ length: count }, (_, index) => ({
    event_id: `evt_${Date.now()}_${index}`,
    user_id: `user_${Math.floor(Math.random() * 10000)}`,
    event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    // 添加生物探针相关的详细数据
    session_id: `sess_${Math.floor(Math.random() * 10000)}`,
    device_id: `dev_${Math.floor(Math.random() * 10000)}`,
    app_version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    os_type: ['android', 'ios'][Math.floor(Math.random() * 2)],
    os_version: `${Math.floor(Math.random() * 10) + 10}`,
    trace_id: `trace_${Date.now()}_${index}`,
    schema_version: 'v1',
    device_info: {
      model: ['iPhone 13', 'Samsung Galaxy S21', 'Google Pixel 6', 'OnePlus 9', 'Huawei P40'][Math.floor(Math.random() * 5)],
      manufacturer: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Huawei'][Math.floor(Math.random() * 5)],
      abi: ['arm64-v8a', 'armeabi-v7a', 'x86_64'][Math.floor(Math.random() * 3)],
      emulator_signal: Math.random() > 0.8,
      root_jailbreak_signal: Math.random() > 0.9,
      debug_signal: Math.random() > 0.85,
      sensor_count: Math.floor(Math.random() * 10) + 5,
      tz: ['Asia/Shanghai', 'America/New_York', 'Europe/London', 'Asia/Tokyo'][Math.floor(Math.random() * 4)],
      locale: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'][Math.floor(Math.random() * 4)]
    },
    behavior_data: {
      pressure_data: `压力值: ${Math.random().toFixed(2)}, 接触面积: ${Math.random().toFixed(2)}`,
      swipe_path: `起点(${Math.floor(Math.random() * 400)}, ${Math.floor(Math.random() * 800)}) -> 终点(${Math.floor(Math.random() * 400)}, ${Math.floor(Math.random() * 800)})`,
      action_route: `页面路径: 登录 -> 首页 -> 个人中心 -> 设置`,
      behavior_pattern: `操作节奏: ${['快', '中', '慢'][Math.floor(Math.random() * 3)]}, 停留时间: ${Math.floor(Math.random() * 60)}秒`
    },
    risk_scores: {
      score_live_human: Math.random(),
      score_identity_bio: Math.random(),
      score_device_fingerprint: Math.random(),
      score_behavior_pattern: Math.random()
    }
  }));
};

export const generatePolicies = (count = 5) => {
  const policyNames = [
    '登录异常检测策略',
    '交易风险拦截策略',
    '设备指纹验证策略',
    '生物特征识别策略',
    '行为模式分析策略',
    '高频操作限制策略',
    '异地登录预警策略'
  ];
  
  return Array.from({ length: count }, (_, index) => ({
    policy_id: `policy_${index + 1}`,
    policy_name: policyNames[index % policyNames.length],
    risk_level: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
    threshold: (Math.random() * 0.5 + 0.3).toFixed(2),
  }));
};