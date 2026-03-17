import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Space, Table, Tag, message } from 'antd';
import { fetchHistory } from '../api/api';

export default function HistoryPanel() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setRows(data.items || []);
    } catch (error) {
      message.error(error?.response?.data?.detail || '历史读取失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card title="历史审计" extra={<Button onClick={loadData} loading={loading}>刷新</Button>}>
      {rows.length === 0 ? (
        <Alert type="info" showIcon message="还没有历史记录，先去“实时评分”页打一笔测试。" />
      ) : (
        <Table
          rowKey="trace_id"
          size="small"
          dataSource={rows}
          columns={[
            { title: 'Trace ID', dataIndex: 'trace_id' },
            { title: 'User ID', dataIndex: 'user_id' },
            { title: '风险分', dataIndex: 'risk_score' },
            { title: '等级', dataIndex: 'risk_level', render: (value) => <Tag color={value === 'high' ? 'red' : value === 'medium' ? 'orange' : 'green'}>{value}</Tag> },
            { title: '决策', dataIndex: 'decision', render: (value) => <Tag color="blue">{value}</Tag> },
            { title: '原因', dataIndex: 'reason_codes', render: (value = []) => <Space wrap>{value.map((item) => <Tag key={item}>{item}</Tag>)}</Space> },
          ]}
        />
      )}
    </Card>
  );
}
