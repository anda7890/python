import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import { addPolicy, deletePolicy, fetchPolicies, updatePolicy } from '../api/api';

const RiskPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data.policies || []);
    } catch (error) {
      message.error('获取策略失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const openCreate = () => {
    setEditingPolicy(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, risk_level: 'MEDIUM', decision: 'CHALLENGE', threshold: 0.65, scene_id: 'login' });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditingPolicy(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editingPolicy) {
        await updatePolicy(editingPolicy.policy_id, values);
        message.success('策略更新成功');
      } else {
        await addPolicy(values);
        message.success('策略新增成功');
      }
      setOpen(false);
      setEditingPolicy(null);
      form.resetFields();
      await loadPolicies();
    } catch (error) {
      message.error('保存策略失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId) => {
    setLoading(true);
    try {
      await deletePolicy(policyId);
      message.success('策略删除成功');
      await loadPolicies();
    } catch (error) {
      message.error('删除策略失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '策略 ID', dataIndex: 'policy_id', key: 'policy_id', width: 120 },
    { title: '策略名称', dataIndex: 'policy_name', key: 'policy_name', width: 220 },
    { title: '场景', dataIndex: 'scene_id', key: 'scene_id', render: (value) => <Tag>{value}</Tag> },
    { title: '风险等级', dataIndex: 'risk_level', key: 'risk_level', render: (value) => <Tag color={value === 'HIGH' ? 'red' : value === 'MEDIUM' ? 'orange' : 'green'}>{value}</Tag> },
    { title: '处置动作', dataIndex: 'decision', key: 'decision' },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold' },
    { title: '版本', dataIndex: 'strategy_version', key: 'strategy_version' },
    { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该策略？" onConfirm={() => handleDelete(record.policy_id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>新增策略</Button>
        <Button onClick={loadPolicies}>刷新</Button>
      </Space>
      <Table rowKey="policy_id" columns={columns} dataSource={policies} loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: 1100 }} />

      <Modal
        title={editingPolicy ? '编辑策略' : '新增策略'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="policy_name" label="策略名称" rules={[{ required: true, message: '请输入策略名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="策略说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="scene_id" label="适用场景" rules={[{ required: true }]}>
            <Select options={[{ label: 'login', value: 'login' }, { label: 'payment', value: 'payment' }, { label: 'bind_card', value: 'bind_card' }]} />
          </Form.Item>
          <Form.Item name="risk_level" label="风险等级" rules={[{ required: true }]}>
            <Select options={[{ label: 'LOW', value: 'LOW' }, { label: 'MEDIUM', value: 'MEDIUM' }, { label: 'HIGH', value: 'HIGH' }]} />
          </Form.Item>
          <Form.Item name="decision" label="处置动作" rules={[{ required: true }]}>
            <Select options={[{ label: 'PASS', value: 'PASS' }, { label: 'CHALLENGE', value: 'CHALLENGE' }, { label: 'REJECT', value: 'REJECT' }]} />
          </Form.Item>
          <Form.Item name="threshold" label="触发阈值" rules={[{ required: true }]}>
            <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="strategy_version" label="策略版本" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="如 s1.2.0" />
          </Form.Item>
          <Form.Item name="enabled" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RiskPolicyManagement;
