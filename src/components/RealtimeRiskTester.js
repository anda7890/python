import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Space, Table, Tag, Typography, message } from 'antd';
import { ingestEvent, scoreRealtime } from '../api/api';

const { Text } = Typography;

const defaultValues = {
  trace_id: `t_${Date.now()}`,
  scene: 'bio_probe_login',
  user_id: 'u_10001',
  device_id: 'd_ios_01',
  ip: '127.0.0.1',
  eye_blink_score: 0.62,
  mouth_motion_score: 0.7,
  texture_consistency: 0.74,
  face_match_score: 0.79,
  id_match_score: 0.76,
  embedding_similarity: 0.81,
};

const scoreColor = (level) => {
  if (level === 'high') return 'red';
  if (level === 'medium') return 'orange';
  return 'green';
};

export default function RealtimeRiskTester() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const featureRows = useMemo(() => {
    if (!result?.feature_snapshot) return [];
    return Object.entries(result.feature_snapshot).map(([key, value]) => ({ key, value }));
  }, [result]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const event = {
        trace_id: values.trace_id,
        schema_version: '1.0.0',
        scene: values.scene,
        user_id: values.user_id,
        device_id: values.device_id,
        ip: values.ip,
        event_time: new Date().toISOString(),
        payload: {
          eye_blink_score: values.eye_blink_score,
          mouth_motion_score: values.mouth_motion_score,
          texture_consistency: values.texture_consistency,
          face_match_score: values.face_match_score,
          id_match_score: values.id_match_score,
          embedding_similarity: values.embedding_similarity,
        },
      };

      await ingestEvent(event);
      const data = await scoreRealtime({ event });
      setResult(data);
      message.success('实时评分完成');
    } catch (error) {
      message.error(error?.response?.data?.detail || '请求失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={10}>
        <Card title="实时评分测试">
          <Form form={form} layout="vertical" initialValues={defaultValues} onFinish={handleSubmit}>
            <Form.Item name="trace_id" label="Trace ID" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="scene" label="Scene" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="device_id" label="Device ID">
              <Input />
            </Form.Item>
            <Form.Item name="ip" label="IP">
              <Input />
            </Form.Item>
            <Row gutter={12}>
              {[
                ['eye_blink_score', '眨眼分'],
                ['mouth_motion_score', '嘴部动作分'],
                ['texture_consistency', '纹理一致性'],
                ['face_match_score', '人脸匹配'],
                ['id_match_score', '证件匹配'],
                ['embedding_similarity', 'Embedding相似度'],
              ].map(([name, label]) => (
                <Col span={12} key={name}>
                  <Form.Item name={name} label={label} rules={[{ required: true }]}>
                    <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>提交并评分</Button>
              <Button onClick={() => form.setFieldsValue({ ...defaultValues, trace_id: `t_${Date.now()}` })}>重置示例</Button>
            </Space>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={14}>
        <Card title="评分结果">
          {!result ? (
            <Alert type="info" showIcon message="还没有结果，先在左侧提交一次实时评分。" />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={scoreColor(result.risk_level)}>{result.risk_level.toUpperCase()}</Tag>
                <Tag color="blue">{result.decision.toUpperCase()}</Tag>
                <Tag>{result.policy_version}</Tag>
              </Space>
              <Text>风险分：{result.risk_score}</Text>
              <Text>真人性：{result.liveness_score}</Text>
              <Text>本人性：{result.identity_score}</Text>
              <div>
                <Text strong>命中原因：</Text>
                <div className="tag-wrap">
                  {result.reason_codes.map((item) => <Tag key={item}>{item}</Tag>)}
                </div>
              </div>
              <Card size="small" title="画像辅助判断">
                <Text>标签：</Text>
                <div className="tag-wrap">
                  {result.profile_snapshot.tags.map((item) => <Tag color="purple" key={item}>{item}</Tag>)}
                </div>
                <Text>历史真人性基线：{result.profile_snapshot.baseline_liveness}</Text><br />
                <Text>本次真人性：{result.profile_snapshot.current_liveness}</Text><br />
                <Text>历史本人性基线：{result.profile_snapshot.baseline_identity}</Text><br />
                <Text>本次本人性：{result.profile_snapshot.current_identity}</Text>
                <div className="tag-wrap">
                  {result.profile_snapshot.profile_risk_factors.map((item) => <Tag color="gold" key={item}>{item}</Tag>)}
                </div>
              </Card>
              <Table
                size="small"
                pagination={false}
                rowKey="key"
                dataSource={featureRows}
                columns={[
                  { title: '特征', dataIndex: 'key' },
                  { title: '值', dataIndex: 'value' },
                ]}
              />
            </Space>
          )}
        </Card>
      </Col>
    </Row>
  );
}
