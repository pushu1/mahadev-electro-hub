import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { localStore } from '../database/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = localStore.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Me
router.get('/admin/me', authenticateToken, (req, res) => {
  res.json({ success: true, admin: req.user });
});

// Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone number, and password are required.' });
    }

    const existing = localStore.getCustomerByPhoneOrEmail(phone);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A customer account with this phone number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newCustomer = localStore.saveCustomer({
      name,
      phone,
      email: email || null,
      passwordHash,
      role: 'CUSTOMER'
    });

    const token = jwt.sign(
      { id: newCustomer.id, phone: newCustomer.phone, name: newCustomer.name, role: 'CUSTOMER' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      token,
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // Phone or Email
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number/email and password are required.' });
    }

    const customer = localStore.getCustomerByPhoneOrEmail(identifier);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Account not found. Please register.' });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: customer.id, phone: customer.phone, name: customer.name, role: 'CUSTOMER' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        wishlist: customer.wishlist || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer Profile
router.get('/customer/profile', authenticateToken, (req, res) => {
  try {
    const customer = localStore.getCustomerByPhoneOrEmail(req.user.phone || req.user.email);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    const { passwordHash, ...safeCustomer } = customer;
    res.json({ success: true, customer: safeCustomer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer Update Profile / Wishlist
router.put('/customer/profile', authenticateToken, (req, res) => {
  try {
    const updated = localStore.saveCustomer({
      id: req.user.id,
      ...req.body
    });
    const { passwordHash, ...safeCustomer } = updated;
    res.json({ success: true, customer: safeCustomer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
