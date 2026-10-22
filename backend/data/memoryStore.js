const bcrypt = require('bcryptjs');

// In-memory resilient store for demo/serverless environments without active MongoDB
const memoryUsers = [
  {
    _id: 'admin_demo_id_001',
    fullName: 'Admin Demo',
    email: 'admin@demo.com',
    phone: '9876543210',
    passwordHash: bcrypt.hashSync('admin123', 10),
    isAdmin: true,
    createdAt: new Date().toISOString(),
  }
];

const memoryOrders = [];

module.exports = {
  memoryUsers,
  memoryOrders,
  
  async findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    return memoryUsers.find(u => u.email === normalized) || null;
  },

  async findUserById(id) {
    return memoryUsers.find(u => String(u._id) === String(id)) || null;
  },

  async createUser({ fullName, email, phone, password }) {
    const normalized = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: fullName.trim(),
      email: normalized,
      phone: phone.trim(),
      passwordHash,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    memoryUsers.unshift(newUser);
    return newUser;
  },

  async matchPassword(enteredPassword, passwordHash) {
    return await bcrypt.compare(enteredPassword, passwordHash);
  },

  async createOrder({ userId, deliveryInfo, orderItems, totalAmount }) {
    const newOrder = {
      _id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user: userId,
      deliveryInfo,
      orderItems,
      totalAmount,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    memoryOrders.unshift(newOrder);
    return newOrder;
  },

  async getOrdersByUser(userId) {
    return memoryOrders.filter(o => String(o.user) === String(userId));
  },

  async getAllUsers() {
    return memoryUsers.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt
    }));
  }
};
