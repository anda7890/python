
const getRiskLevelText = (level) => {
  switch (level) {
    case 1:
      return 'Low';
    case 2:
      return 'Medium';
    case 3:
      return 'High';
    case 4:
      return 'Very High';
    case 5:
      return 'Critical';
    default:
      return 'Unknown';
  }
};

const getRiskLevelIcon = (level) => {
  switch (level) {
    case 1:
    case 2:
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 3:
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 4:
    case 5:
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return null;
  }
};


return (
  <div className="risk-monitor">
    <h1>实时风险监控</h1>
    <div className="user-list-container">
      {users.length === 0 ? (
        <div className="no-data">暂无风险用户数据</div>
      ) : (
        <Row gutter={16}>
          {users.map(user => (
            <Col span={8} key={user.id} style={{ marginBottom: '16px' }}>
              <Card 
                title={
                  <span>
                    {getRiskLevelIcon(user.riskLevel)}
                    <span style={{ marginLeft: '8px' }}>{user.name}</span>
                  </span>
                }
                extra={
                  <Tag color={getRiskLevelColor(user.riskLevel)}>
                    {getRiskLevelText(user.riskLevel)}
                  </Tag>
                }
                size="small"
              >
                <p><strong>用户 ID:</strong> {user.userId}</p>
                <p><strong>活体检测:</strong> {user.livenessDetection}%</p>
                <p><strong>生物特征:</strong> {user.biometricFeatures}%</p>
                <p><strong>设备指纹:</strong> {user.deviceFingerprint}%</p>
                <p><strong>行为模式:</strong> {user.behaviorPattern}%</p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  时间：{user.timestamp}
                </p>
                <Button type="primary" block>
                  查看详情
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  </div>
);