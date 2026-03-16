import axios from 'axios';
import {
  generateHistoryEvents,
  generatePolicies,
  generateRealTimeScores,
  generateRealtimeMetrics,
  generateUserProfile,
  validateEventEnvelope,
} from '../utils/mockDataGenerator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const REAL_DEMO_API_BASE_URL = process.env.REACT_APP_REAL_DEMO_API_URL || 'http://localhost:8000';
const useMock = process.env.NODE_ENV === 'development';

let mockPoliciesStore = null;
let mockHistoryStore = null;

const initMockPolicies = () => {
  if (!mockPoliciesStore) {
    mockPoliciesStore = generatePolicies(6);
  }
  return mockPoliciesStore;
};

const initMockHistory = () => {
  if (!mockHistoryStore) {
    mockHistoryStore = generateHistoryEvents(40);
  }
  return mockHistoryStore;
};

const realDemoApi = axios.create({
  baseURL: REAL_DEMO_API_BASE_URL,
  timeout: 15000,
});

export const fetchRealtimeDashboard = async () => {
  if (useMock) {
    const assessments = generateRealTimeScores(18);
    return {
      assessments,
      metrics: generateRealtimeMetrics(assessments),
      refreshedAt: new Date().toISOString(),
    };
  }

  const response = await axios.get(`${API_BASE_URL}/risk/dashboard/realtime`);
  return response.data;
};

export const fetchHistoryEvents = async (filters = {}) => {
  if (useMock) {
    let events = [...initMockHistory()];

    if (filters.riskLevel) {
      events = events.filter((e) => e.risk_result.risk_level === filters.riskLevel || e.risk_level === filters.riskLevel);
    }

    if (filters.outcome) {
      events = events.filter((e) => e.risk_result.outcome === filters.outcome);
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      events = events.filter((e) =>
        [e.event_id, e.user_id, e.trace_id, e.session_id, e.device_id, e.scene_id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword)),
      );
    }

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate).getTime();
      const endDate = new Date(filters.endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      events = events.filter((e) => {
        const eventTime = new Date(e.timestamp).getTime();
        return eventTime >= startDate && eventTime <= endDate;
      });
    }

    return { events };
  }

  const response = await axios.post(`${API_BASE_URL}/history/events`, filters);
  return response.data;
};

export const validateIngestEvent = async (payload) => {
  if (useMock) {
    const result = validateEventEnvelope(payload);
    return {
      code: result.pass ? 0 : 1001,
      message: result.pass ? 'ok' : 'validation_failed',
      validation: result,
    };
  }

  const response = await axios.post(`${API_BASE_URL}/risk/events/ingest`, payload);
  return response.data;
};

export const sendEventFeedback = async (params) => {
  if (useMock) {
    return {
      code: 0,
      message: 'ok',
      feedback: {
        ...params,
        submitted_at: new Date().toISOString(),
      },
    };
  }

  const response = await axios.post(`${API_BASE_URL}/risk/feedback`, params);
  return response.data;
};

export const fetchPolicies = async () => {
  if (useMock) {
    return { policies: initMockPolicies() };
  }

  const response = await axios.get(`${API_BASE_URL}/risk/policies`);
  return response.data;
};

export const addPolicy = async (policyData) => {
  if (useMock) {
    const policies = initMockPolicies();
    const newPolicy = {
      ...policyData,
      policy_id: `policy_${Date.now()}`,
      enabled: true,
      strategy_version: policyData.strategy_version || 's1.new.0',
    };
    policies.unshift(newPolicy);
    return { policy: newPolicy };
  }

  const response = await axios.post(`${API_BASE_URL}/risk/policies`, policyData);
  return response.data;
};

export const updatePolicy = async (policyId, policyData) => {
  if (useMock) {
    const policies = initMockPolicies();
    const index = policies.findIndex((p) => p.policy_id === policyId);
    if (index < 0) {
      throw new Error('Policy not found');
    }
    policies[index] = { ...policies[index], ...policyData };
    return { policy: policies[index] };
  }

  const response = await axios.put(`${API_BASE_URL}/risk/policies/${policyId}`, policyData);
  return response.data;
};

export const deletePolicy = async (policyId) => {
  if (useMock) {
    const policies = initMockPolicies();
    mockPoliciesStore = policies.filter((p) => p.policy_id !== policyId);
    return { success: true };
  }

  const response = await axios.delete(`${API_BASE_URL}/risk/policies/${policyId}`);
  return response.data;
};

export const fetchUserProfile = async (userId) => {
  if (useMock) {
    return generateUserProfile(userId);
  }

  const { data } = await realDemoApi.get(`/risk/profile/${userId}`);
  return data;
};

export const fetchProfile = fetchUserProfile;
