import React, { useState } from 'react';
import StrategyForm from './StrategyForm';
import './StrategyManagement.css';

const StrategyManagement = () => {
  // 添加状态管理，控制添加策略表单的显示
  const [showAddForm, setShowAddForm] = useState(false);
  // 添加加载状态，用于点击反馈
  const [isAdding, setIsAdding] = useState(false);
  
  // 重写添加策略点击处理函数
  const handleAddStrategyClick = () => {
    // 添加点击反馈效果
    setIsAdding(true);
    
    // 模拟短暂的加载过程，增强用户感知
    setTimeout(() => {
      setShowAddForm(true);
      setIsAdding(false);
    }, 300);
  };
  
  // 处理表单提交完成后的状态重置
  const handleFormSubmit = () => {
    setShowAddForm(false);
  };

  return (
    <div className="strategy-management">
      <div className="strategy-header">
        <h2>风险控制策略管理</h2>
        <button 
          className={`add-strategy-btn ${isAdding ? 'loading' : ''}`} 
          onClick={handleAddStrategyClick}
          disabled={isAdding}
        >
          {isAdding ? '正在处理...' : '添加新策略'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-strategy-form-container">
          <h3>添加新策略</h3>
          <StrategyForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}
      
      {/* 策略列表展示区域 */}
      <div className="strategy-list">
        {/* 策略列表内容 */}
      </div>
    </div>
  );
};

export default StrategyManagement;