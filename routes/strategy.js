const express = require('express');
const router = express.Router();
const {
  createStrategy,
  getAllStrategies
} = require('../controllers/strategyController');

// 创建新策略
router.post('/', createStrategy);

// 获取所有策略
router.get('/', getAllStrategies);

module.exports = router;