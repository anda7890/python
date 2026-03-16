import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { fetchHistoryEvents } from '../api/api';

const { RangePicker } = DatePicker;
const riskColor = { LOW: 'red', MEDIUM: 'orange', HIGH: 'red' };

const HistoryEventQuery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    riskLevel: undefined,
    outcome: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const data = await fetchHistoryEvents(nextFilters);
      setEvents(data.events || []);
    } catch (error) {
      message.error('历史事件查询失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => ({
    total: events.length,
    highRisk: events.filter((item) => item.risk_result?.risk_level === 'HIGH').length,
    needReplay: events.filter((item) => item.feedback_status === '待复核').length,
    driftWarning: events.filter((item) => item.schema_version !== 'v1' || item.data_quality?.time_skew_ms > 300).length,
  }), [events]);

  const columns = [
    { title: '事件 ID', dataIndex: 'event_id', key: 'event_id', width: 180 },
    { title: '用户 ID', dataIndex: 'user_id', key: 'user_id', width: 120 },
    { title: '场景', dataIndex: 'scene_id', key: 'scene_id', render: (value) => <Tag>{value}</Tag> },
    { title: '事件类型', dataIndex: 'event_type', key: 'event_type', width: 130 },
    {
      title: '结果',
      key: 'outcome',
      render: (_, record) => <Tag color={record.risk_result?.outcome === 'PASS' ? 'green' : record.risk_result?.outcome === 'CHALLENGE' ? 'orange' : 'red'}>{record.risk_result?.outcome}</Tag>,
    },
    {
      title: '风险等级',
      key: 'risk_level',
      render: (_, record) => <Tag color={riskColor[record.risk_result?.risk_level] || 'default'}>{record.risk_result?.risk_level}</Tag>,
    },
    {
      title: '反馈状态',
      dataIndex: 'feedback_status',
      key: 'feedback_status',
      render: (value) => <Tag color={value === '已回流' ? 'green' : value === '待复核' ? 'orange' : 'blue'}>{value}</Tag>,
    },
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp', render: (value) => new Date(value).toLocaleString() },
    { title: '操作', key: 'action', render: (_, record) => <Button type="link" onClick={() => setSelectedEvent(record)}>查看详情</Button> },
  ];

  const onSearch = () => loadEvents(filters);

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="命中事件" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="高风险事件" value={stats.highRisk} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待复核" value={stats.needReplay} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="质量告警" value={stats.driftWarning} /></Card></Col>
      </Row>

      <Card title="查询条件" extra={<Button icon={<ReloadOutlined />} onClick={() => loadEvents()} loading={loading}>刷新</Button>}>
        <Space wrap>
          <Input
            style={{ width: 240 }}
            placeholder="搜索 event_id / trace_id / user_id"
            value={filters.keyword}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
          />
          <Select
            allowClear
            placeholder="风险等级"
            style={{ width: 140 }}
            value={filters.riskLevel}
            onChange={(value) => setFilters((prev) => ({ ...prev, riskLevel: value }))}
            options={[
              { label: 'LOW', value: 'LOW' },
              { label: 'MEDIUM', value: 'MEDIUM' },
              { label: 'HIGH', value: 'HIGH' },
            ]}
          />
          <Select
            allowClear
            placeholder="决策结果"
            style={{ width: 160 }}
            value={filters.outcome}
            onChange={(value) => setFilters((prev) => ({ ...prev, outcome: value }))}
            options={[
              { label: 'PASS', value: 'PASS' },
              { label: 'CHALLENGE', value: 'CHALLENGE' },
              { label: 'REJECT', value: 'REJECT' },
            ]}
          />
          <RangePicker
            onChange={(dates) => setFilters((prev) => ({
              ...prev,
              startDate: dates?.[0]?.format('YYYY-MM-DD'),
              endDate: dates?.[1]?.format('YYYY-MM-DD'),
            }))}
          />
          <Button type="primary" onClick={onSearch}>查询</Button>
        </Space>
      </Card>

      <Card title="历史事件列表">
        <Table
          rowKey="event_id"
          columns={columns}
          dataSource={events}
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title={selectedEvent ? `事件详情 - ${selectedEvent.event_id}` : '事件详情'}
        width={860}
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent ? (
          <Space direction="vertical" size={16} style={{ display: 'flex' }}>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="事件ID">{selectedEvent.event_id}</Descriptions.Item>
              <Descriptions.Item label="Trace ID">{selectedEvent.trace_id}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{selectedEvent.user_id}</Descriptions.Item>
              <Descriptions.Item label="会话ID">{selectedEvent.session_id}</Descriptions.Item>
              <Descriptions.Item label="设备ID">{selectedEvent.device_id}</Descriptions.Item>
              <Descriptions.Item label="Schema">{selectedEvent.schema_version}</Descriptions.Item>
              <Descriptions.Item label="策略版本">{selectedEvent.strategy_version}</Descriptions.Item>
              <Descriptions.Item label="画像版本">{selectedEvent.profile_version}</Descriptions.Item>
              <Descriptions.Item label="最终标签">{selectedEvent.final_label}</Descriptions.Item>
              <Descriptions.Item label="反馈状态">{selectedEvent.feedback_status}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="决策与解释">
              <Space direction="vertical" style={{ display: 'flex' }}>
                <Space wrap>
                  <Tag color={selectedEvent.risk_result.outcome === 'PASS' ? 'green' : selectedEvent.risk_result.outcome === 'CHALLENGE' ? 'orange' : 'red'}>{selectedEvent.risk_result.outcome}</Tag>
                  <Tag color={selectedEvent.risk_result.risk_level === 'HIGH' ? 'red' : selectedEvent.risk_result.risk_level === 'MEDIUM' ? 'orange' : 'green'}>{selectedEvent.risk_result.risk_level}</Tag>
                </Space>
                <Typography.Text>原因：</Typography.Text>
                <Space wrap>
                  {selectedEvent.risk_result.decision_reasons.map((reason) => <Tag key={reason}>{reason}</Tag>)}
                </Space>
              </Space>
            </Card>

            <Descriptions title="数据质量门禁" bordered column={2} size="small">
              <Descriptions.Item label="缺失率">{(selectedEvent.data_quality.required_missing_rate * 100).toFixed(2)}%</Descriptions.Item>
              <Descriptions.Item label="时间偏移">{selectedEvent.data_quality.time_skew_ms} ms</Descriptions.Item>
              <Descriptions.Item label="非法枚举率">{(selectedEvent.data_quality.enum_invalid_rate * 100).toFixed(2)}%</Descriptions.Item>
              <Descriptions.Item label="建议">
                {selectedEvent.data_quality.time_skew_ms > 300 ? '建议做时钟偏移排查' : '质量正常'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="行为与设备信息" bordered column={1} size="small">
              <Descriptions.Item label="设备画像">{`${selectedEvent.device_info.manufacturer} ${selectedEvent.device_info.model} / ${selectedEvent.device_info.abi}`}</Descriptions.Item>
              <Descriptions.Item label="行为数据">{selectedEvent.behavior_data.behavior_pattern}</Descriptions.Item>
              <Descriptions.Item label="动作路径">{selectedEvent.behavior_data.action_route}</Descriptions.Item>
              <Descriptions.Item label="压力信息">{selectedEvent.behavior_data.pressure_data}</Descriptions.Item>
              <Descriptions.Item label="滑动路径">{selectedEvent.behavior_data.swipe_path}</Descriptions.Item>
            </Descriptions>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
};

export default HistoryEventQuery;
