import React from 'react';
import { Card } from 'antd';

const UserProfile = ({ userProfileData }) => {
  return (
    <Card title="User Profile" style={{ width: 300 }}>
      <p>User ID: {userProfileData.userId}</p>
      <p>Device: {userProfileData.device}</p>
      <p>Risk Level: {userProfileData.riskLevel}</p>
      <p>Last Update: {userProfileData.lastUpdate}</p>
    </Card>
  );
};

export default UserProfile;