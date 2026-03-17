import React from 'react';
import { Layout, Menu, Tabs } from 'antd';

const { Header, Content } = Layout;

const App = () => {
  const currentUser = "张三";  // Placeholder for the current user

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const items = [
    { key: '1', label: 'Tab 1', children: 'Content of Tab 1' },
    { key: '2', label: 'Tab 2', children: 'Content of Tab 2' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ padding: '0 20px', backgroundColor: '#001529' }}>
        <div className="logo" style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
          🛡️ 风控系统
        </div>
        <div
          className="user-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            position: 'absolute',
            right: '20px',
            top: '10%',
            transform: 'translateY(-50%)',
          }}
        >
          <span style={{ color: '#FF00FF', fontSize: '10px' }}>欢迎, {currentUser}</span>
          <Menu theme="light" mode="horizontal" style={{ marginLeft: 'auto' ,backgroundColor: '#3434F6'}}>
            <Menu.Item key="logout" onClick={handleLogout}>
              退出
            </Menu.Item>
          </Menu>
        </div>
      </Header>
      <Content className="site-layout-content" style={{ padding: '20px' }}>
        <Tabs defaultActiveKey="1" items={items} />
      </Content>
    </Layout>
  );
};

export default App;