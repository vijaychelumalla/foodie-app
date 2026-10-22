const mongoose = require('mongoose');
const Order = require('../models/Order');
const menuCatalog = require('../data/menuCatalog');
const memoryStore = require('../data/memoryStore');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { deliveryInfo, orderItems, totalAmount } = req.body;

    // Validate delivery info
    if (!deliveryInfo || !deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.pinCode) {
      return res.status(400).json({ message: 'Please provide all delivery information fields' });
    }

    // Validate order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Server-side recalculation and validation of prices
    let calculatedSubtotal = 0;
    const validatedOrderItems = [];

    for (const item of orderItems) {
      if (!item.name || typeof item.name !== 'string') {
        return res.status(400).json({ message: 'Invalid item format' });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0 || qty > 100) {
        return res.status(400).json({ message: `Invalid quantity for item ${item.name}` });
      }

      // Check server catalog price
      let unitPrice = menuCatalog[item.name];
      if (unitPrice === undefined) {
        const passedPrice = parseFloat(item.price);
        if (isNaN(passedPrice) || passedPrice <= 0) {
          return res.status(400).json({ message: `Invalid price for item ${item.name}` });
        }
        unitPrice = passedPrice;
      }

      calculatedSubtotal += unitPrice * qty;
      validatedOrderItems.push({
        name: item.name,
        quantity: qty,
        price: unitPrice,
        img: item.img || ''
      });
    }

    // Compute tax (5%) matching frontend calculation
    const calculatedTax = Math.floor(calculatedSubtotal * 0.05);
    const expectedTotal = calculatedSubtotal + calculatedTax;

    // Reject orders where client altered the price
    if (totalAmount !== undefined && totalAmount !== null) {
      const clientTotal = Number(totalAmount);
      if (Math.abs(clientTotal - expectedTotal) > 1) {
        return res.status(400).json({
          message: `Price mismatch: submitted total ₹${clientTotal} does not match computed total ₹${expectedTotal}`
        });
      }
    }

    if (mongoose.connection.readyState === 1) {
      const order = new Order({
        user: req.user._id,
        deliveryInfo: {
          fullName: deliveryInfo.fullName.trim(),
          phone: deliveryInfo.phone.trim(),
          address: deliveryInfo.address.trim(),
          city: deliveryInfo.city.trim(),
          pinCode: deliveryInfo.pinCode.trim()
        },
        orderItems: validatedOrderItems,
        totalAmount: expectedTotal
      });

      const createdOrder = await order.save();
      return res.status(201).json(createdOrder);
    } else {
      const createdOrder = await memoryStore.createOrder({
        userId: req.user._id,
        deliveryInfo: {
          fullName: deliveryInfo.fullName.trim(),
          phone: deliveryInfo.phone.trim(),
          address: deliveryInfo.address.trim(),
          city: deliveryInfo.city.trim(),
          pinCode: deliveryInfo.pinCode.trim()
        },
        orderItems: validatedOrderItems,
        totalAmount: expectedTotal
      });
      return res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to place order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const orders = await memoryStore.getOrdersByUser(req.user._id);
      return res.json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({}).populate('user', 'fullName email phone').sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json(memoryStore.memoryOrders);
    }
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ message: 'Failed to fetch all orders' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders
};
