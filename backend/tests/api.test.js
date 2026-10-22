const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/foodie_test_db';
process.env.JWT_SECRET = 'test_secret_key_12345';

const app = require('../server');
const User = require('../models/User');
const Order = require('../models/Order');

let server;
let baseUrl;

before(async () => {
  // Wait for mongoose connection if not already ready
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // Clear test collections
  await User.deleteMany({ email: /@test\.com$/ });
  await Order.deleteMany({});

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await User.deleteMany({ email: /@test\.com$/ });
  await Order.deleteMany({});
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

describe('Foodie App API & Security Tests', () => {
  let regularToken;
  let adminToken;
  let regularUserId;

  test('1. POST /api/auth/signup - Successfully registers normal user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'regular@test.com',
        phone: '9876543210',
        password: 'password123'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.ok(data.token, 'Should return a JWT token');
    assert.strictEqual(data.email, 'regular@test.com');
    assert.strictEqual(data.isAdmin, false, 'Standard registration must default isAdmin to false');
    regularToken = data.token;
    regularUserId = data._id;
  });

  test('2. POST /api/auth/signup - Prevents privilege escalation when client passes isAdmin: true', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Hacker User',
        email: 'hacker@test.com',
        phone: '1112223334',
        password: 'password123',
        isAdmin: true
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.isAdmin, false, 'Server must reject client attempt to register as admin');

    const dbUser = await User.findOne({ email: 'hacker@test.com' });
    assert.strictEqual(dbUser.isAdmin, false);
  });

  test('3. POST /api/auth/signup - Rejects duplicate email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate',
        email: 'regular@test.com',
        phone: '9876543210',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /already exists/i);
  });

  test('4. POST /api/auth/signup - Rejects short passwords', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Short Pass',
        email: 'short@test.com',
        phone: '9876543210',
        password: '123'
      })
    });

    assert.strictEqual(res.status, 400);
  });

  test('5. POST /api/auth/login - Successfully authenticates user and returns token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'regular@test.com',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.email, 'regular@test.com');
  });

  test('6. POST /api/auth/login - Rejects invalid password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'regular@test.com',
        password: 'wrongpassword'
      })
    });

    assert.strictEqual(res.status, 401);
  });

  test('7. GET /api/auth/me - Protected route returns authenticated user data', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${regularToken}` }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.email, 'regular@test.com');
    assert.strictEqual(data.password, undefined, 'Password must not be returned');
  });

  test('8. GET /api/auth/me - Rejects requests with missing or invalid token', async () => {
    const resNoToken = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(resNoToken.status, 401);

    const resBadToken = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid_token_xyz' }
    });
    assert.strictEqual(resBadToken.status, 401);
  });

  test('9. GET /api/auth/users - Denies regular user access to admin user list (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/users`, {
      headers: { Authorization: `Bearer ${regularToken}` }
    });

    assert.strictEqual(res.status, 403, 'Normal user should receive 403 Forbidden');
  });

  test('10. GET /api/auth/users - Allows admin user to fetch user list', async () => {
    // Create an admin user directly in DB
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      phone: '9998887776',
      password: 'adminpassword123',
      isAdmin: true
    });

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'adminpassword123'
      })
    });
    const loginData = await loginRes.json();
    adminToken = loginData.token;

    const res = await fetch(`${baseUrl}/api/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 2);
  });

  test('11. POST /api/orders - Successfully places an order with server-calculated price', async () => {
    // Gujarati Thali is 150, Qty 2 = 300. 5% tax of 300 = 15. Total = 315.
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularToken}`
      },
      body: JSON.stringify({
        deliveryInfo: {
          fullName: 'Test User',
          phone: '9876543210',
          address: '123 Test Street',
          city: 'Surat',
          pinCode: '395007'
        },
        orderItems: [
          { name: 'Gujarati Thali', quantity: 2, price: 150 }
        ],
        totalAmount: 315
      })
    });

    assert.strictEqual(res.status, 201);
    const order = await res.json();
    assert.strictEqual(order.totalAmount, 315);
    assert.strictEqual(order.orderItems[0].price, 150);
    assert.strictEqual(order.orderItems[0].quantity, 2);
  });

  test('12. POST /api/orders - Rejects tampered totalAmount (price manipulation attempt)', async () => {
    // Attempting to buy 2 Gujarati Thali (worth 315) for 1 rupee
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularToken}`
      },
      body: JSON.stringify({
        deliveryInfo: {
          fullName: 'Hacker',
          phone: '9876543210',
          address: '123 Fake Street',
          city: 'Surat',
          pinCode: '395007'
        },
        orderItems: [
          { name: 'Gujarati Thali', quantity: 2, price: 1 }
        ],
        totalAmount: 1
      })
    });

    assert.strictEqual(res.status, 400, 'Server must reject manipulated total amount');
    const data = await res.json();
    assert.match(data.message, /price mismatch/i);
  });

  test('13. GET /api/orders/myorders - Retrieves orders isolated to the authenticated user', async () => {
    const res = await fetch(`${baseUrl}/api/orders/myorders`, {
      headers: { Authorization: `Bearer ${regularToken}` }
    });

    assert.strictEqual(res.status, 200);
    const orders = await res.json();
    assert.ok(Array.isArray(orders));
    assert.strictEqual(orders.length, 1);
    assert.strictEqual(orders[0].totalAmount, 315);

    // Verify admin calling myorders gets only admin's orders (currently 0)
    const adminOrdersRes = await fetch(`${baseUrl}/api/orders/myorders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminOrders = await adminOrdersRes.json();
    assert.strictEqual(adminOrders.length, 0);
  });
});
