import React, { useState, useEffect } from 'react';
import { Table, Button, Input, DatePicker, message, Modal, Descriptions, Tag } from 'antd';
import { fetchHistoryEvents } from '../api/api';

const { RangePicker } = DatePicker;

const HistoryEventQuery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    riskLevel: '',
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoryEvents(filters);
        setEvents(data.events);
      } catch (error) {
        message.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  const handleDateChange = (dates) => {
    if (dates) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  const handleRiskLevelChange = (e) => {
    setFilters({
      ...filters,
      riskLevel: e.target.value,
    });
  };

  const handleEventClick = (record) => {
    setSelectedEvent(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Event ID',
      dataIndex: 'event_id',
      key: 'event_id',
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type',
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level) => (
        <Tag color={
          level === 'High' ? 'red' : 
          level === 'Medium' ? 'orange' : 
          'green'
        }>
          {level}
        </Tag>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="link" onClick={() => handleEventClick(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Filter by Risk Level"
        onChange={handleRiskLevelChange}
        style={{ marginBottom: '16px', width: '200px' }}
      />
      <RangePicker onChange={handleDateChange} style={{ marginBottom: '16px' }} />
      <Table
        columns={columns}
        dataSource={events}
        loading={loading}
        rowKey="event_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`事件详情 - ${selectedEvent?.event_id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedEvent && (
          <div>
            <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="事件ID">{selectedEvent.event_id}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{selectedEvent.user_id}</Descriptions.Item>
              <Descriptions.Item label="会话ID">{selectedEvent.session_id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="设备ID">{selectedEvent.device_id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="应用版本">{selectedEvent.app_version || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="操作系统类型">{selectedEvent.os_type || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="操作系统版本">{selectedEvent.os_version || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="事件类型">{selectedEvent.event_type}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={
                  selectedEvent.risk_level === 'High' ? 'red' : 
                  selectedEvent.risk_level === 'Medium' ? 'orange' : 
                  'green'
                }>
                  {selectedEvent.risk_level}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="时间戳">{new Date(selectedEvent.timestamp).toLocaleString()}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="设备信息" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="型号">{selectedEvent.device_info?.model || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="制造商">{selectedEvent.device_info?.manufacturer || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="CPU架构">{selectedEvent.device_info?.abi || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="模拟器迹象">{selectedEvent.device_info?.emulator_signal ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="越狱/ROOT迹象">{selectedEvent.device_info?.root_jailbreak_signal ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="调试迹象">{selectedEvent.device_info?.debug_signal ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="传感器数量">{selectedEvent.device_info?.sensor_count || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="时区">{selectedEvent.device_info?.tz || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="地区语言">{selectedEvent.device_info?.locale || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="行为数据" bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="压力数据">{selectedEvent.behavior_data?.pressure_data || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="滑动路径">{selectedEvent.behavior_data?.swipe_path || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="操作路径">{selectedEvent.behavior_data?.action_route || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="行为模式">{selectedEvent.behavior_data?.behavior_pattern || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="风险评分" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="真人检测评分">{selectedEvent.risk_scores?.score_live_human ? (selectedEvent.risk_scores.score_live_human * 100).toFixed(2) + '%' : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="身份生物评分">{selectedEvent.risk_scores?.score_identity_bio ? (selectedEvent.risk_scores.score_identity_bio * 100).toFixed(2) + '%' : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="设备指纹评分">{selectedEvent.risk_scores?.score_device_fingerprint ? (selectedEvent.risk_scores.score_device_fingerprint * 100).toFixed(2) + '%' : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="行为模式评分">{selectedEvent.risk_scores?.score_behavior_pattern ? (selectedEvent.risk_scores.score_behavior_pattern * 100).toFixed(2) + '%' : 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="附加信息" bordered column={1}>
              <Descriptions.Item label="追踪ID">{selectedEvent.trace_id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="数据结构版本">{selectedEvent.schema_version || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryEventQuery;