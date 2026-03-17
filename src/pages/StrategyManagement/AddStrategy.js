import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, Space, InputNumber, Modal, Table } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddStrategy = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [strategies, setStrategies] = useState([]);
  // 新增：弹窗内规则列表状态
  const [ruleList, setRuleList] = useState([]);
  // 添加loading状态
  const [loading, setLoading] = useState(false);

  // 获取策略列表
  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies');
      const result = await response.json();
      
      if (result.success) {
        setStrategies(result.data);
      } else {
        message.error(result.message || '获取策略列表失败');
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      message.error('获取策略列表失败');
    }
  };

  // 打开弹窗
  const showAddModal = () => {
    console.log('【DEBUG】点击添加策略按钮，准备打开弹窗');
    // 重置表单和规则列表
    form.resetFields();
    setRuleList([]);
    setIsModalVisible(true);  // 确保设置为 true 以打开弹窗
  };

  // 关闭弹窗
  const handleCancel = () => {
    console.log('【DEBUG】关闭弹窗');
    setIsModalVisible(false);
    form.resetFields();
    setRuleList([]);
  };

  // 新增：添加规则到弹窗内表格
  const addRuleToTable = () => {
    const newRule = {
      key: Date.now(),
      condition: '',
      action: '',
      priority: 0
    };
    setRuleList(prev => [...prev, newRule]);
    console.log('【DEBUG】添加规则，当前规则列表:', ruleList);
  };

  // 新增：删除规则
  const removeRuleFromTable = (key) => {
    setRuleList(prev => prev.filter(rule => rule.key !== key));
  };

  // 新增：更新规则
  const updateRule = (key, field, value) => {
    setRuleList(prev => prev.map(rule => 
      rule.key === key ? { ...rule, [field]: value } : rule
    ));
  };

  // 处理表单提交（发送网络请求）
  const handleSubmit = async (values) => {
    console.log('【INFO】表单提交，values:', JSON.stringify(values, null, 2));
    console.log('【INFO】弹窗内规则列表:', ruleList);
    
    // 检查规则是否存在且有效
    if (ruleList.length === 0) {
      message.error('请至少添加一条规则');
      return;
    }

    const formattedRules = ruleList.map(rule => ({
      condition: rule.condition,
      action: rule.action,
      priority: rule.priority === '' || rule.priority == null ? 0 : Number(rule.priority)
    })).filter(rule => rule.condition && rule.action);

    if (formattedRules.length === 0) {
      message.error('请至少填写一条完整规则（条件和操作）');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          rules: formattedRules,
          status: values.status
        })
      });

      const result = await response.json();

      if (result.success) {
        message.success('策略添加成功！');
        setIsModalVisible(false);
        form.resetFields();
        setRuleList([]);
        // 重新获取策略列表
        fetchStrategies();
      } else {
        message.error(result.message || '添加策略失败');
      }
    } catch (error) {
      console.error('Error adding strategy:', error);
      message.error('添加策略失败');
    } finally {
      setLoading(false);
    }
  };

  // 捕获表单校验失败
  const handleFinishFailed = ({ errorFields }) => {
    console.log('【DEBUG】Form validation failed:', errorFields);
    const errorMessages = errorFields.map(field => field.errors.join(', ')).join('; ');
    message.error(`表单填写有误：${errorMessages}`);
  };

  // 弹窗内规则表格列定义
  const ruleColumns = [
    {
      title: '条件表达式',
      dataIndex: 'condition',
      key: 'condition',
      render: (text, record) => (
        <Input 
          value={text} 
          onChange={(e) => updateRule(record.key, 'condition', e.target.value)}
          placeholder="如：transactionAmount > 1000"
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Select 
          value={text} 
          onChange={(value) => updateRule(record.key, 'action', value)}
          style={{ width: '100%' }}
        >
          <Option value="block">拦截交易</Option>
          <Option value="review">人工审核</Option>
          <Option value="alert">发送警报</Option>
          <Option value="log">记录日志</Option>
        </Select>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (text, record) => (
        <InputNumber 
          value={text} 
          onChange={(value) => updateRule(record.key, 'priority', value)}
          min={0}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          onClick={() => removeRuleFromTable(record.key)}
          icon={<MinusCircleOutlined />}
        >
          删除
        </Button>
      )
    }
  ];

  // 策略列表表格列定义
  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '规则数量',
      dataIndex: 'rules',
      key: 'rules',
      render: (rules) => rules?.length || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 'active' ? '启用' : '禁用'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    }
  ];

  return (
    <Card title="策略管理" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 添加策略按钮 */}
      <Form.Item style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={showAddModal} 
          icon={<PlusOutlined />}
          data-testid="add-strategy-btn"
        >
          添加策略
        </Button>
      </Form.Item>

      {/* 策略列表表格 */}
      <Table 
        columns={columns} 
        dataSource={strategies} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: '暂无策略，请点击"添加策略"按钮添加' }}
      />

      {/* 添加策略弹窗 */}
      <Modal
        title="添加新策略"
        open={isModalVisible}  // 改为 open
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={handleFinishFailed}
        >
          <Form.Item
            label="策略名称"
            name="name"
            rules={[
              { required: true, message: '请输入策略名称' },
              { min: 2, message: '策略名称至少 2 个字符' },
              { max: 50, message: '策略名称最多 50 个字符' }
            ]}
          >
            <Input placeholder="请输入策略名称" />
          </Form.Item>

          <Form.Item
            label="策略描述"
            name="description"
            rules={[
              { max: 200, message: '策略描述最多 200 个字符' }
            ]}
          >
            <Input.TextArea rows={3} placeholder="请输入策略描述" />
          </Form.Item>

          <Form.Item label="规则配置">
            {/* 弹窗内规则表格 */}
            <Table 
              columns={ruleColumns}
              dataSource={ruleList}
              rowKey="key"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无规则，请点击下方"添加规则"按钮' }}
            />
            
            <Button 
              type="dashed" 
              onClick={addRuleToTable} 
              block 
              icon={<PlusOutlined />}
              style={{ marginTop: 16 }}
            >
              添加规则
            </Button>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AddStrategy;