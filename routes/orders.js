var express = require('express');
var router = express.Router();
let { getAll, getById, createOrder, updateStatus, deleteOrder } = require('../controllers/orders');
let { CheckLogin } = require('../utils/authHandler');
let { CreateOrderValidator, validatedResult } = require('../utils/validator');

// GET /api/v1/orders - lấy tất cả orders
router.get('/', CheckLogin, getAll);

// GET /api/v1/orders/:id - lấy order theo ID
router.get('/:id', CheckLogin, getById);

// POST /api/v1/orders - tạo order mới
router.post('/', CheckLogin, CreateOrderValidator, validatedResult, createOrder);

// PUT /api/v1/orders/:id/status - cập nhật trạng thái order
router.put('/:id/status', CheckLogin, updateStatus);

// DELETE /api/v1/orders/:id - xoá order (soft delete)
router.delete('/:id', CheckLogin, deleteOrder);

module.exports = router;
