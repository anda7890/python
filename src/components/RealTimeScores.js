import React, { useEffect, useState } from 'react';
import { fetchRealTimeScore } from '../api/api';
import { Card, Spin } from 'antd';

const RealTimeScores = ({ traceId, userId, sessionId }) => {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    const getRealTimeScores = async () => {
      setLoading(true);
      try {
        const params = { trace_id: traceId, user_id: userId, session_id: sessionId };
        const data = await fetchRealTimeScore(params);
        setScoreData(data?.risk_result || null); // Ensure risk_result exists
      } catch (error) {
        console.error('Failed to fetch real-time scores:', error);
      } finally {
        setLoading(false);
      }
    };
    getRealTimeScores();
  }, [traceId, userId, sessionId]);

  if (loading) return <Spin size="large" />;

  // Safely render the component only when scoreData exists
  if (!scoreData) {
    return <Card title="Real-Time Risk Score">No data available.</Card>;
  }

  return (
    <Card title="Real-Time Risk Score" style={{ width: 300 }}>
      <p>Outcome: {scoreData.outcome}</p>
      <p>Risk Level: {scoreData.risk_level}</p>
      <p>Score for Live Human: {scoreData.scores?.score_live_human || 'N/A'}</p>
      <p>Score for Identity Bio: {scoreData.scores?.score_identity_bio || 'N/A'}</p>
    </Card>
  );
};

export default RealTimeScores;
