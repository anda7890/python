import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { fetchUserProfile } from '../api/api';

const { Text } = Typography;

const UserProfileCenter = () => {
  const [userId, setUserId] = useState('u_10001');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    if (!userId.trim()) {
      message.error('请输入 user_id');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUserProfile(userId.trim());
      setProfile(data);
      message.success('画像加载完成');
    } catch (error) {
      setProfile(null);
      message.error(error?.response?.data?.detail || '画像查询失败');
    } finally {
      setLoading(false);
    }
  };

  const profileTags = useMemo(() => profile?.tags || [], [profile]);

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Alert
        type="info"
        showIcon
        message="用户画像中心"
        description="这是兼容式新增模块，不影响原有实时研判、历史审计、策略管理和事件回流功能。默认支持前端 mock，也兼容后端 /risk/profile/{user_id} 接口。"
      />

      <Card title="画像查询">
        <Space wrap>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="输入 user_id，例如 u_10001"
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={loadProfile} loading={loading}>查询画像</Button>
        </Space>
      </Card>

      {!profile ? (
        <Alert type="info" showIcon message="输入 u_10001 后点击查询，可查看内置测试画像。" />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="画像总览">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="用户ID">{profile.user_id}</Descriptions.Item>
                <Descriptions.Item label="画像版本">{profile.profile_version}</Descriptions.Item>
                <Descriptions.Item label="最近更新时间">{profile.updated_at}</Descriptions.Item>
                <Descriptions.Item label="标签">
                  <Space wrap>
                    {profileTags.map((item) => <Tag color="purple" key={item}>{item}</Tag>)}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="静态画像">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="注册天数">{profile.base_profile?.register_days}</Descriptions.Item>
                <Descriptions.Item label="KYC等级">{profile.base_profile?.kyc_level}</Descriptions.Item>
                <Descriptions.Item label="可信设备数">{profile.base_profile?.trusted_device_count}</Descriptions.Item>
                <Descriptions.Item label="历史通过率">{profile.base_profile?.historical_pass_rate}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="行为画像">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="1天认证次数">{profile.behavior_profile?.auth_count_1d}</Descriptions.Item>
                <Descriptions.Item label="7天认证次数">{profile.behavior_profile?.auth_count_7d}</Descriptions.Item>
                <Descriptions.Item label="30天认证次数">{profile.behavior_profile?.auth_count_30d}</Descriptions.Item>
                <Descriptions.Item label="7天设备切换">{profile.behavior_profile?.device_switch_count_7d}</Descriptions.Item>
                <Descriptions.Item label="7天地域切换">{profile.behavior_profile?.geo_change_count_7d}</Descriptions.Item>
                <Descriptions.Item label="活跃时段">{(profile.behavior_profile?.active_hours || []).join(', ') || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="生物 + 风险画像">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="真人性均值30d">{profile.bio_profile?.liveness_mean_30d}</Descriptions.Item>
                <Descriptions.Item label="真人性波动30d">{profile.bio_profile?.liveness_std_30d}</Descriptions.Item>
                <Descriptions.Item label="本人性均值30d">{profile.bio_profile?.identity_mean_30d}</Descriptions.Item>
                <Descriptions.Item label="本人性波动30d">{profile.bio_profile?.identity_std_30d}</Descriptions.Item>
                <Descriptions.Item label="探针稳定度">{profile.bio_profile?.probe_stability_score}</Descriptions.Item>
                <Descriptions.Item label="近期风险等级">{profile.risk_profile?.recent_risk_level}</Descriptions.Item>
                <Descriptions.Item label="风险上升">{profile.risk_profile?.risk_uptrend ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="Top Reasons">
                  <Space wrap>
                    {(profile.risk_profile?.top_reason_codes || []).map((item) => <Tag color="red" key={item}>{item}</Tag>)}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      )}

      <Text type="secondary">兼容测试画像 user_id：u_10001</Text>
    </Space>
  );
};

export default UserProfileCenter;
