import React from 'react';
import { Row, Col } from 'antd';
import RealTimeScores from './RealTimeScores';
import UserProfile from './UserProfile';

const RiskDashboard = ({ traceId, userId, sessionId, userProfileData }) => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <RealTimeScores traceId={traceId} userId={userId} sessionId={sessionId} />
      </Col>
      <Col span={8}>
        <UserProfile userProfileData={userProfileData} />
      </Col>
    </Row>
  );
};

export default RiskDashboard;