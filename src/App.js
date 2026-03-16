
import React, { useState } from 'react';
import { Layout, Menu, Tabs, Modal, Form, Input, Button, message, Result } from 'antd';
import RealTimeRiskUpdates from './components/RealTimeRiskUpdates';
import HistoryEventQuery from './components/HistoryEventQuery';
import RiskPolicyManagement from './components/RiskPolicyManagement';
import EventMonitor from './components/EventMonitor';
import './App.css';

const { Header, Content } = Layout;

const App = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const showLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  const handleLoginCancel = () => {
    setIsLoginModalVisible(false);
  };

  const handleLogin = async (values) => {
    // 模拟登录逻辑，实际项目中这里应该调用真实的登录API
    try {
      console.log('Login attempt with:', values);
      // 这里应该调用实际的登录API
      // 假设API返回成功
      setIsLoggedIn(true);
      setCurrentUser(values.username);
      setIsLoginModalVisible(false);
      message.success('登录成功');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    message.info('已退出登录');
  };

  // 如果用户未登录，则只显示登录界面
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <Result
          status="info"
          title="风控系统"
          subTitle="请先登录以访问系统"
          extra={[
            <Button 
              type="primary" 
              key="login" 
              onClick={showLoginModal}
              style={{ width: '150px', marginTop: '16px' }}
            >
              登录
            </Button>
          ]}
        />
        <Modal
          title="用户登录"
          open={isLoginModalVisible}
          onCancel={handleLoginCancel}
          footer={null}
          centered
        >
          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // 已登录用户的主界面
  const items = [
    {
      key: '1',
      label: '实时风险监控',
      children: <RealTimeRiskUpdates />,
    },
    {
      key: '2',
      label: '历史事件查询',
      children: <HistoryEventQuery />,
    },
    {
      key: '3',
      label: '风控策略管理',
      children: <RiskPolicyManagement />,
    },
    {
      key: '4',
      label: '事件反馈',
      children: <EventMonitor />,
    },
  ];

  return (
    <Layout style={{ minHeight: '150vh' }}>
      <Header className="header">
        <div className="logo">🛡️风控系统</div>
        <div className="user-info">
          <span style={{ color: '#fff', marginRight: '20px' }}>欢迎, {currentUser}</span>
          <Menu theme="light" mode="horizontal" style={{ marginLeft: 'auto',backgroundColor: '#3434F6',color: '#ffffff',marginBottom: '-1px' }}>
            <Menu.Item key="logout" onClick={handleLogout} style={{ marginTop: '-40px',color: '#ffffff'}}>
              退出
            </Menu.Item>
          </Menu>
        </div>
      </Header>
      <Content className="site-layout-content">
        <Tabs defaultActiveKey="1" items={items} />
      </Content>
    </Layout>
  );
};

export default App;