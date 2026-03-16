import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Space,
  Tag,
  message,
} from 'antd';
import { sendEventFeedback, validateIngestEvent } from '../api/api';

const defaultPayload = `{
  "event_id": "evt_demo_001",
  "user_id": "hash_user_001",
  "session_id": "sess_001",
  "device_id": "dev_001",
  "app_id": "com.demo.risk",
  "app_version": "8.2.1",
  "os_type": "android",
  "os_version": "14",
  "event_type": "sensor_accel",
  "event_time_ms": 1730000000123,
  "server_recv_time_ms": 1730000000456,
  "schema_version": "v1"
}`;

const EventMonitor = () => {
  const [payloadText, setPayloadText] = useState(defaultPayload);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [feedbackResult, setFeedbackResult] = useState(null);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const payload = JSON.parse(payloadText);
      const result = await validateIngestEvent(payload);
      setValidationResult(result.validation);
      message.success(result.code === 0 ? '事件校验通过' : '事件校验发现问题');
    } catch (error) {
      message.error('请输入合法 JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      message.error('请输入反馈内容');
      return;
    }
    setLoading(true);
    try {
      const result = await sendEventFeedback({
        trace_id: 'trace_demo_001',
        final_label: 'fraud_or_legit',
        label_source: 'manual_or_challenge',
        comment: feedbackText,
        event_time_ms: Date.now(),
      });
      setFeedbackResult(result.feedback);
      message.success('回流提交成功');
      setFeedbackText('');
    } catch (error) {
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Alert
        type="info"
        showIcon
        message="采集校验与结果回流"
        description="这里补齐了文档中的 /risk/events/ingest 和 /risk/feedback 两段能力：先校验统一包络，再做人审/挑战结果回流。"
      />

      <Row gutter={16}>
        <Col span={14}>
          <Card title="统一事件包络校验">
            <Form layout="vertical">
              <Form.Item label="事件 JSON">
                <Input.TextArea rows={16} value={payloadText} onChange={(e) => setPayloadText(e.target.value)} />
              </Form.Item>
              <Button type="primary" loading={loading} onClick={handleValidate}>校验事件</Button>
            </Form>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="校验结果">
            {validationResult ? (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="校验状态">
                  <Tag color={validationResult.pass ? 'green' : 'red'}>{validationResult.pass ? 'PASS' : 'FAIL'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="缺失字段">{validationResult.missing.length ? validationResult.missing.join(', ') : '无'}</Descriptions.Item>
                <Descriptions.Item label="告警">{validationResult.warnings.length ? validationResult.warnings.join('；') : '无'}</Descriptions.Item>
                <Descriptions.Item label="时间偏移">{validationResult.timeSkew} ms</Descriptions.Item>
              </Descriptions>
            ) : '尚未执行校验'}
          </Card>
        </Col>
      </Row>

      <Card title="案件回流">
        <Form layout="vertical">
          <Form.Item label="反馈说明">
            <Input.TextArea rows={4} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="输入人审结论、挑战验证结果或案件复盘意见" />
          </Form.Item>
          <Button type="primary" loading={loading} onClick={handleFeedbackSubmit}>提交回流</Button>
        </Form>
        {feedbackResult ? (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="trace_id">{feedbackResult.trace_id}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{new Date(feedbackResult.submitted_at).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="备注">{feedbackResult.comment}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Card>
    </Space>
  );
};

export default EventMonitor;
