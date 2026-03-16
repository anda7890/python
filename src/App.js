import React, { useState } from 'react';
import { Avatar, Button, Card, Form, Input, Layout, Modal, Space, Tabs, Typography, message } from 'antd';
import { RadarChartOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import RealTimeRiskUpdates from './components/RealTimeRiskUpdates';
import HistoryEventQuery from './components/HistoryEventQuery';
import RiskPolicyManagement from './components/RiskPolicyManagement';
import EventMonitor from './components/EventMonitor';
import UserProfileCenter from './components/UserProfileCenter';
import './App.css';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const App = () => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleLogin = async ({ username }) => {
    setLoggedIn(true);
    setCurrentUser(username);
    setLoginVisible(false);
    message.success('登录成功');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser('');
    message.info('已退出登录');
  };

  if (!loggedIn) {
    return (
      <div className="login-shell">
        <Card className="login-card" bordered={false}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Avatar size={64} icon={<SafetyCertificateOutlined />} className="brand-avatar" />
            <Title level={2} style={{ marginBottom: 0 }}>生物探针风控台</Title>
            <Paragraph type="secondary">
              覆盖 真人性判定、本人性判定、策略版本化、事件回流、历史审计与用户画像查询。
            </Paragraph>
            <Button type="primary" size="large" onClick={() => setLoginVisible(true)}>
              进入系统
            </Button>
          </Space>
        </Card>

        <Modal title="用户登录" open={loginVisible} footer={null} onCancel={() => setLoginVisible(false)} centered>
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Button htmlType="submit" type="primary" block>登录</Button>
          </Form>
        </Modal>
      </div>
    );
  }

  const items = [
    { key: 'realtime', label: '实时研判', children: <RealTimeRiskUpdates /> },
    { key: 'history', label: '历史审计', children: <HistoryEventQuery /> },
    { key: 'policy', label: '策略管理', children: <RiskPolicyManagement /> },
    { key: 'feedback', label: '事件校验与回流', children: <EventMonitor /> },
    { key: 'profile', label: '用户画像', children: <UserProfileCenter /> },
  ];

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div>
          <Space>
            <RadarChartOutlined className="header-icon" />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>生物探针风控台</Title>
              <Text style={{ color: 'rgba(255,255,255,0.72)' }}>双任务判定 · 决策可解释 · 审计可回放 · 用户画像</Text>
            </div>
          </Space>
        </div>
        <Space>
          <Text style={{ color: '#fff' }}>欢迎，{currentUser}</Text>
          <Button onClick={handleLogout}>退出</Button>
        </Space>
      </Header>
      <Content className="app-content">
        <Card bordered={false} className="app-card">
          <Tabs defaultActiveKey="realtime" items={items} />
        </Card>
      </Content>
    </Layout>
  );
};

export default App;
