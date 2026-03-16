import axios from 'axios';
import { generateHistoryEvents, generatePolicies } from '../utils/mockDataGenerator';

// 开发环境使用模拟数据，生产环境替换为实际后端 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchRealTimeScore = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/risk/score/realtime`, params);
    return response.data;
  } catch (error) {
    console.error("Error fetching real-time score:", error);
    throw error;
  }
};

export const sendEventFeedback = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/risk/feedback`, params);
    return response.data;
  } catch (error) {
    console.error("Error sending event feedback:", error);
    throw error;
  }
};

export const fetchHistoryEvents = async (filters) => {
  try {
    // 开发环境使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      const mockEvents = generateHistoryEvents(20);
      // 应用过滤条件
      let filteredEvents = mockEvents;
      if (filters?.riskLevel) {
        filteredEvents = filteredEvents.filter(e => e.risk_level === filters.riskLevel);
      }
      if (filters?.startDate && filters?.endDate) {
        filteredEvents = filteredEvents.filter(e => {
          const eventDate = new Date(e.timestamp);
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          return eventDate >= startDate && eventDate <= endDate;
        });
      }
      return { events: filteredEvents };
    }
    // 生产环境调用实际 API
    const response = await axios.post(`${API_BASE_URL}/history/events`, filters);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// 开发环境模拟策略数据存储
let mockPoliciesStore = null;

// 初始化模拟策略数据
const initMockPolicies = () => {
  if (!mockPoliciesStore) {
    mockPoliciesStore = generatePolicies(5);
  }
  return mockPoliciesStore;
};

export const fetchPolicies = async () => {
  try {
    // 开发环境使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      initMockPolicies();
      return { policies: mockPoliciesStore };
    }
    // 生产环境调用实际 API
    const response = await axios.get(`${API_BASE_URL}/risk/policies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }
};

export const addPolicy = async (policyData) => {
  try {
    // 开发环境使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      initMockPolicies();
      const newPolicy = {
        ...policyData,
        policy_id: `policy_${Date.now()}`,
      };
      mockPoliciesStore.push(newPolicy);
      return { policy: newPolicy };
    }
    // 生产环境调用实际 API
    const response = await axios.post(`${API_BASE_URL}/risk/policies`, policyData);
    return response.data;
  } catch (error) {
    console.error('Error adding policy:', error);
    throw error;
  }
};

export const updatePolicy = async (policyId, policyData) => {
  try {
    // 开发环境使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      initMockPolicies();
      const index = mockPoliciesStore.findIndex(p => p.policy_id === policyId);
      if (index !== -1) {
        mockPoliciesStore[index] = { ...mockPoliciesStore[index], ...policyData };
        return { policy: mockPoliciesStore[index] };
      }
      throw new Error('Policy not found');
    }
    // 生产环境调用实际 API
    const response = await axios.put(`${API_BASE_URL}/risk/policies/${policyId}`, policyData);
    return response.data;
  } catch (error) {
    console.error('Error updating policy:', error);
    throw error;
  }
};

export const deletePolicy = async (policyId) => {
  try {
    // 开发环境使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      initMockPolicies();
      mockPoliciesStore = mockPoliciesStore.filter(p => p.policy_id !== policyId);
      return { success: true };
    }
    // 生产环境调用实际 API
    const response = await axios.delete(`${API_BASE_URL}/risk/policies/${policyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting policy:', error);
    throw error;
  }
};