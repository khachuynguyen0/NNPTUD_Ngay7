let orderModel = require('../schemas/orders');
let inventoryModel = require('../schemas/inventories');
let productModel = require('../schemas/products');

// GET all orders
let getAll = async (req, res) => {
    try {
        let query = { isDeleted: false };
        // Filter by user if query param provided
        if (req.query.user) {
            query.user = req.query.user;
        }
        // Filter by status if query param provided
        if (req.query.status) {
            query.status = req.query.status;
        }
        let result = await orderModel.find(query)
            .populate({ path: 'user', select: 'username email fullName' })
            .populate({ path: 'items.product', select: 'title slug price images' });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// GET order by ID
let getById = async (req, res) => {
    try {
        let id = req.params.id;
        let result = await orderModel.findOne({ _id: id, isDeleted: false })
            .populate({ path: 'user', select: 'username email fullName' })
            .populate({ path: 'items.product', select: 'title slug price images' });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: 'Order không tìm thấy' });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// POST / - tạo order mới (tự động đặt reservation inventory)
let createOrder = async (req, res) => {
    try {
        let { user, items, shippingAddress, note } = req.body;
        if (!user || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).send({ message: 'user và items (mảng không rỗng) là bắt buộc' });
        }

        let orderItems = [];
        let totalPrice = 0;

        // Validate items và tính tổng giá
        for (let item of items) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                return res.status(400).send({ message: 'Mỗi item phải có product và quantity > 0' });
            }
            let product = await productModel.findOne({ _id: item.product, isDeleted: false });
            if (!product) {
                return res.status(404).send({ message: `Không tìm thấy product: ${item.product}` });
            }

            // Kiểm tra inventory
            let inventory = await inventoryModel.findOne({ product: item.product });
            if (!inventory) {
                return res.status(404).send({ message: `Không tìm thấy inventory cho product: ${item.product}` });
            }
            if (inventory.stock < item.quantity) {
                return res.status(400).send({ message: `Không đủ hàng cho product: ${product.title}. Stock hiện tại: ${inventory.stock}` });
            }

            orderItems.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price
            });
            totalPrice += product.price * item.quantity;
        }

        // Tạo order
        let newOrder = new orderModel({
            user,
            items: orderItems,
            totalPrice,
            shippingAddress: shippingAddress || "",
            note: note || ""
        });
        await newOrder.save();

        // Đặt reservation cho từng item
        for (let item of orderItems) {
            let inventory = await inventoryModel.findOne({ product: item.product });
            inventory.stock -= item.quantity;
            inventory.reserved += item.quantity;
            await inventory.save();
        }

        res.send(newOrder);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// PUT /:id/status - cập nhật trạng thái order
let updateStatus = async (req, res) => {
    try {
        let id = req.params.id;
        let { status } = req.body;
        let validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).send({ message: `status phải là một trong: ${validStatuses.join(', ')}` });
        }

        let order = await orderModel.findOne({ _id: id, isDeleted: false });
        if (!order) {
            return res.status(404).send({ message: 'Order không tìm thấy' });
        }

        let previousStatus = order.status;
        order.status = status;
        await order.save();

        // Nếu chuyển sang delivered -> giảm reserved, tăng soldCount
        if (status === 'delivered' && previousStatus !== 'delivered') {
            for (let item of order.items) {
                let inventory = await inventoryModel.findOne({ product: item.product });
                if (inventory && inventory.reserved >= item.quantity) {
                    inventory.reserved -= item.quantity;
                    inventory.soldCount += item.quantity;
                    await inventory.save();
                }
            }
        }

        // Nếu huỷ order -> hoàn lại stock từ reserved
        if (status === 'cancelled' && previousStatus !== 'cancelled' && previousStatus !== 'delivered') {
            for (let item of order.items) {
                let inventory = await inventoryModel.findOne({ product: item.product });
                if (inventory && inventory.reserved >= item.quantity) {
                    inventory.reserved -= item.quantity;
                    inventory.stock += item.quantity;
                    await inventory.save();
                }
            }
        }

        res.send(order);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// DELETE /:id - soft delete order
let deleteOrder = async (req, res) => {
    try {
        let id = req.params.id;
        let order = await orderModel.findOne({ _id: id, isDeleted: false });
        if (!order) {
            return res.status(404).send({ message: 'Order không tìm thấy' });
        }
        // Chỉ cho phép xoá order ở trạng thái pending hoặc cancelled
        if (order.status !== 'pending' && order.status !== 'cancelled') {
            return res.status(400).send({ message: 'Chỉ có thể xoá order ở trạng thái pending hoặc cancelled' });
        }
        let updated = await orderModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        res.send(updated);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { getAll, getById, createOrder, updateStatus, deleteOrder };
