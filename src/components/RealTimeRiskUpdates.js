import React, { useState, useEffect } from 'react';
import { Table, Spin, Tag, Row, Col, Statistic, Button, Space, Card } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { generateRealTimeScores } from '../utils/mockDataGenerator';

const RealTimeRiskUpdates = () => {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateRealTimeScores(12);
      setRiskData(data);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case 'PASS':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'CHALLENGE':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'REJECT':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'PASS':
        return 'success';
      case 'CHALLENGE':
        return 'warning';
      case 'REJECT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Low':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'High':
        return 'red';
      default:
        return 'default';
    }
  };

  const stats = {
    total: riskData.length,
    pass: riskData.filter(d => d.risk_result?.outcome === 'PASS').length,
    challenge: riskData.filter(d => d.risk_result?.outcome === 'CHALLENGE').length,
    reject: riskData.filter(d => d.risk_result?.outcome === 'REJECT').length,
  };

  // 定义表格列
  const columns = [
    {
      title: '评估编号',
      key: 'index',
      render: (text, record, index) => `评估 #${index + 1}`,
    },
    {
      title: '用户 ID',
      dataIndex: ['user_id'],
      key: 'user_id',
    },
    {
      title: '结果',
      key: 'outcome',
      render: (text, record) => (
        <Space>
          {getOutcomeIcon(record.risk_result?.outcome)}
          <Tag color={getOutcomeColor(record.risk_result?.outcome)}>
            {record.risk_result?.outcome}
          </Tag>
        </Space>
      ),
    },
    {
      title: '风险等级',
      key: 'risk_level',
      render: (text, record) => (
        <Tag color={getRiskLevelColor(record.risk_result?.risk_level)}>
          {record.risk_result?.risk_level}
        </Tag>
      ),
    },
    {
      title: '活体检测',
      key: 'liveness',
      render: (text, record) => `${(record.risk_result?.scores?.score_live_human * 100).toFixed(0)}%`,
    },
    {
      title: '生物特征',
      key: 'biometric',
      render: (text, record) => `${(record.risk_result?.scores?.score_identity_bio * 100).toFixed(0)}%`,
    },
    {
      title: '设备指纹',
      key: 'device',
      render: (text, record) => `${(record.risk_result?.scores?.score_device_fingerprint * 100).toFixed(0)}%`,
    },
    {
      title: '行为模式',
      key: 'behavior',
      render: (text, record) => `${(record.risk_result?.scores?.score_behavior_pattern * 100).toFixed(0)}%`,
    },
    {
      title: '时间',
      key: 'timestamp',
      render: (text, record) => new Date(record.risk_result?.timestamp).toLocaleString(),
    },
  ];

  if (loading && riskData.length === 0) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总评估数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="通过" value={stats.pass} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="挑战" value={stats.challenge} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="拒绝" value={stats.reject} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <span style={{ marginRight: '16px' }}>
          自动刷新：
          <Tag 
            color={autoRefresh ? 'green' : 'default'} 
            style={{ marginLeft: '8px', cursor: 'pointer' }}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '开启' : '关闭'}
          </Tag>
        </span>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={loadData} 
          loading={loading}
        >
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={riskData}
        loading={loading}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default RealTimeRiskUpdates;