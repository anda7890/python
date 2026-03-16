import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { fetchPolicies, addPolicy, updatePolicy, deletePolicy } from '../api/api';

const { Option } = Select;

const RiskPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [policyForm] = Form.useForm(); // 使用 useForm 创建表单实例
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchRiskPolicies = async () => {
      setLoading(true);
      try {
        const data = await fetchPolicies();
        setPolicies(data.policies);
      } catch (error) {
        message.error('Failed to fetch policies');
      } finally {
        setLoading(false);
      }
    };
    fetchRiskPolicies();
  }, []);

  // 监听 isModalVisible 状态变化
  useEffect(() => {
    console.log('【DEBUG】isModalVisible changed:', isModalVisible);
  }, [isModalVisible]);

  const handleAddPolicy = () => {
    console.log('【DEBUG】handleAddPolicy called');
    policyForm.resetFields();
    console.log('1111');
    setSelectedPolicy(null);
    console.log('2222');
    setIsModalVisible(true);  // 打开弹窗
    console.log('3333');
  };

  const handleEditPolicy = (policy) => {
    console.log('【DEBUG】handleEditPolicy called with:', policy);
    if (!policy) {
      console.error('【ERROR】No policy data provided for editing');
      message.error('无法编辑：未提供策略数据');
      return;
    }
    
    if (!policy.policy_id) {
      console.error('【ERROR】Policy data missing policy_id:', policy);
      message.error('策略数据不完整，无法编辑');
      return;
    }
    
    policyForm.setFieldsValue(policy);
    setSelectedPolicy(policy);
    setIsModalVisible(true);  // 打开弹窗
  };

  const handleDeletePolicy = async (policyId) => {
    setLoading(true);
    try {
      await deletePolicy(policyId);
      message.success('策略删除成功');
      if (selectedPolicy && selectedPolicy.policy_id === policyId) {
        setSelectedPolicy(null);
        policyForm.resetFields();
      }
      const data = await fetchPolicies();
      setPolicies(data.policies);
    } catch (error) {
      message.error('删除策略失败');
      console.error('Delete policy error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    console.log('【DEBUG】Modal cancelled');
    setIsModalVisible(false);
    setSelectedPolicy(null); // 确保selectedPolicy重置
  };

  const handleModalOk = async () => {
    try {
      console.log('【DEBUG】handleModalOk called');
      const values = await policyForm.validateFields();
      console.log('【DEBUG】Form values:', values);
      
      if (selectedPolicy && !selectedPolicy.policy_id) {
        console.error('【ERROR】Selected policy is missing policy_id:', selectedPolicy);
        message.error('选中的策略ID无效，无法更新');
        return;
      }
      
      setLoading(true);
      if (selectedPolicy) {
        console.log('【DEBUG】Updating policy:', selectedPolicy.policy_id);
        await updatePolicy(selectedPolicy.policy_id, values);
        message.success('策略更新成功');
      } else {
        console.log('【DEBUG】Adding new policy');
        await addPolicy(values);
        message.success('策略添加成功');
      }
      
      setIsModalVisible(false);
      setSelectedPolicy(null);
      const data = await fetchPolicies();
      setPolicies(data.policies);
      policyForm.resetFields();
    } catch (error) {
      console.error('【ERROR】Save policy error:', error);
      message.error(`保存策略失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '策略 ID',
      dataIndex: 'policy_id',
      key: 'policy_id',
    },
    {
      title: '策略名称',
      dataIndex: 'policy_name',
      key: 'policy_name',
    },
    {
      title: '风险等级',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level) => {
        const levelMap = { LOW: '低', MEDIUM: '中', HIGH: '高' };
        return levelMap[level] || level;
      }
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEditPolicy(record)} type="link">编辑</Button>
          <Button onClick={() => handleDeletePolicy(record.policy_id)} type="link" danger>
            删除
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button 
        onClick={handleAddPolicy} 
        type="primary" 
        style={{ marginBottom: '16px' }}
      >
        添加策略
      </Button>
      <Table
        columns={columns}
        dataSource={policies}
        loading={loading}
        rowKey="policy_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedPolicy ? '编辑策略' : '添加策略'}
        open={isModalVisible}  // 修改：visible -> open (适配 Ant Design v4.24.0+)
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        style={{ zIndex: 1000 }}
        key={selectedPolicy ? `edit-${selectedPolicy.policy_id}` : 'add-new'}
      >
        <Form 
          form={policyForm} 
          layout="vertical"
        >
          <Form.Item name="policy_name" label="策略名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="risk_level" label="风险等级" rules={[{ required: true }]}>
            <Select>
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="阈值" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RiskPolicyManagement;