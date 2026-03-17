const Strategy = require('../models/Strategy');

// 创建新策略
exports.createStrategy = async (req, res) => {
  try {
    const { name, description, rules, status } = req.body;
    
    // 检查策略名称是否已存在
    const existingStrategy = await Strategy.findOne({ name });
    if (existingStrategy) {
      return res.status(400).json({ 
        success: false, 
        message: '策略名称已存在' 
      });
    }
    
    // 创建新策略
    const strategy = new Strategy({
      name,
      description,
      rules,
      status
    });
    
    await strategy.save();
    
    res.status(201).json({
      success: true,
      data: strategy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建策略失败',
      error: error.message
    });
  }
};

// 获取所有策略
exports.getAllStrategies = async (req, res) => {
  try {
    const strategies = await Strategy.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: strategies.length,
      data: strategies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取策略列表失败',
      error: error.message
    });
  }
};