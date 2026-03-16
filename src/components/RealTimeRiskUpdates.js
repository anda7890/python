import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Progress,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { fetchRealtimeDashboard } from '../api/api';

const scorePercent = (value) => `${Math.round((value || 0) * 100)}%`;
const riskLevelColor = { LOW: 'green', MEDIUM: 'orange', HIGH: 'red' };
const outcomeColor = { PASS: 'success', CHALLENGE: 'warning', REJECT: 'error' };

const outcomeIcon = {
  PASS: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  CHALLENGE: <WarningOutlined style={{ color: '#faad14' }} />,
  REJECT: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const RealTimeRiskUpdates = () => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({ assessments: [], metrics: {}, refreshedAt: null });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRealtimeDashboard();
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadData]);

  const metrics = dashboard.metrics || {};

  const topRiskRecord = useMemo(
    () => [...(dashboard.assessments || [])].sort((a, b) => b.risk_result.aggregate_score - a.risk_result.aggregate_score)[0],
    [dashboard.assessments],
  );

  const columns = [
    {
      title: '评估编号',
      dataIndex: 'assessment_id',
      key: 'assessment_id',
      width: 170,
    },
    {
      title: '场景',
      dataIndex: 'scene_id',
      key: 'scene_id',
      width: 110,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: '用户 / 设备',
      key: 'identity',
      render: (_, record) => (
        <div>
          <div>{record.user_id}</div>
          <Typography.Text type="secondary">{record.device_id}</Typography.Text>
        </div>
      ),
    },
    {
      title: '决策结果',
      key: 'outcome',
      width: 130,
      render: (_, record) => (
        <Space>
          {outcomeIcon[record.risk_result.outcome]}
          <Tag color={outcomeColor[record.risk_result.outcome]}>{record.risk_result.outcome}</Tag>
        </Space>
      ),
    },
    {
      title: '风险等级',
      key: 'risk_level',
      width: 120,
      render: (_, record) => (
        <Tag color={riskLevelColor[record.risk_result.risk_level]}>{record.risk_result.risk_level}</Tag>
      ),
    },
    {
      title: '真人性',
      key: 'live',
      render: (_, record) => scorePercent(record.risk_result.scores.score_live_human),
    },
    {
      title: '本人性',
      key: 'identity_bio',
      render: (_, record) => scorePercent(record.risk_result.scores.score_identity_bio),
    },
    {
      title: '习惯偏离',
      key: 'habit',
      render: (_, record) => scorePercent(record.risk_result.scores.score_habit_deviation),
    },
    {
      title: '综合风险',
      key: 'aggregate_score',
      width: 180,
      render: (_, record) => (
        <Progress
          percent={Math.round(record.risk_result.aggregate_score * 100)}
          size="small"
          status={record.risk_result.outcome === 'REJECT' ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedRecord(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Alert
        type="info"
        showIcon
        message="双任务判定链路"
        description="页面按文档中的“真人性 + 本人性”双任务思路展示实时评分、可解释原因、策略版本和 schema 健康度。"
      />

      <Row gutter={16}>
        <Col span={4}><Card><Statistic title="总评估数" value={metrics.total || 0} /></Card></Col>
        <Col span={4}><Card><Statistic title="PASS" value={metrics.PASS || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="CHALLENGE" value={metrics.CHALLENGE || 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="REJECT" value={metrics.REJECT || 0} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="P95 延迟" suffix="ms" value={metrics.decisionLatencyP95 || 0} /></Card></Col>
        <Col span={4}><Card><Statistic title="Schema 漂移" value={metrics.schemaDriftCount || 0} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card
            title="实时评估列表"
            extra={(
              <Space>
                <span>自动刷新</span>
                <Switch checked={autoRefresh} onChange={setAutoRefresh} />
                <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
              </Space>
            )}
          >
            <Table
              rowKey="assessment_id"
              columns={columns}
              dataSource={dashboard.assessments}
              loading={loading}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="运行健康概览">
            <Space direction="vertical" style={{ display: 'flex' }}>
              <Statistic title="平均综合风险" value={Math.round((metrics.avgRiskScore || 0) * 100)} suffix="%" />
              <Statistic title="模拟器迹象会话" value={metrics.emulatorCount || 0} />
              <Typography.Text type="secondary">
                最近刷新：{dashboard.refreshedAt ? new Date(dashboard.refreshedAt).toLocaleString() : '—'}
              </Typography.Text>
              {topRiskRecord ? (
                <Card size="small" type="inner" title="当前最高风险会话">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Trace ID">{topRiskRecord.trace_id}</Descriptions.Item>
                    <Descriptions.Item label="策略版本">{topRiskRecord.strategy_version}</Descriptions.Item>
                    <Descriptions.Item label="结果">
                      <Tag color={outcomeColor[topRiskRecord.risk_result.outcome]}>{topRiskRecord.risk_result.outcome}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="解释原因">
                      <Space wrap>
                        {topRiskRecord.risk_result.decision_reasons.map((reason) => <Tag key={reason}>{reason}</Tag>)}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ) : null}
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer
        width={720}
        title={selectedRecord ? `评估详情 - ${selectedRecord.assessment_id}` : '评估详情'}
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord ? (
          <Space direction="vertical" size={16} style={{ display: 'flex' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Trace ID">{selectedRecord.trace_id}</Descriptions.Item>
              <Descriptions.Item label="事件类型">{selectedRecord.event_type}</Descriptions.Item>
              <Descriptions.Item label="Scene">{selectedRecord.scene_id}</Descriptions.Item>
              <Descriptions.Item label="Schema 版本">{selectedRecord.schema_version}</Descriptions.Item>
              <Descriptions.Item label="策略版本">{selectedRecord.strategy_version}</Descriptions.Item>
              <Descriptions.Item label="画像版本">{selectedRecord.profile_version}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="核心分数">
              <Row gutter={12}>
                {Object.entries(selectedRecord.risk_result.scores).map(([key, value]) => (
                  <Col span={12} key={key} style={{ marginBottom: 12 }}>
                    <Typography.Text>{key}</Typography.Text>
                    <Progress percent={Math.round(value * 100)} size="small" />
                  </Col>
                ))}
              </Row>
            </Card>
            <Card size="small" title="设备与决策解释">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="设备型号">{selectedRecord.device_info.model}</Descriptions.Item>
                <Descriptions.Item label="风险信号">
                  <Space wrap>
                    {selectedRecord.device_info.emulator_signal && <Tag color="red">模拟器迹象</Tag>}
                    {selectedRecord.device_info.root_jailbreak_signal && <Tag color="volcano">Root/Jailbreak</Tag>}
                    {selectedRecord.device_info.debug_signal && <Tag color="gold">Debug 信号</Tag>}
                    {!selectedRecord.device_info.emulator_signal && !selectedRecord.device_info.root_jailbreak_signal && !selectedRecord.device_info.debug_signal && <Tag color="green">未见异常设备信号</Tag>}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="解释原因">
                  <Space wrap>
                    {selectedRecord.risk_result.decision_reasons.map((reason) => <Tag key={reason}>{reason}</Tag>)}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
};

export default RealTimeRiskUpdates;
