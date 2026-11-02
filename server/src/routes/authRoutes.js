import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

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
    console.error('Error during admin login in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin Me
router.get('/admin/me', authenticateToken, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json({ success: true, admin: admin || req.user });
  } catch (err) {
    res.json({ success: true, admin: req.user });
  }
});

// Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone number, and password are required.' });
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : null;

    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A customer account with this phone or email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newCustomer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
      }
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
    console.error('Error during customer register in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // Phone or Email
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number/email and password are required.' });
    }

    const cleanId = identifier.trim();
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanId },
          { email: cleanId.toLowerCase() }
        ]
      }
    });

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
    console.error('Error during customer login in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer Profile
router.get('/customer/profile', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.id }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const { passwordHash, ...safeCustomer } = customer;
    res.json({ success: true, customer: safeCustomer });
  } catch (err) {
    console.error('Error fetching customer profile from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Customer Update Profile / Wishlist
router.put('/customer/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, addresses, wishlist } = req.body;
    const data = {};
    if (name) data.name = name.trim();
    if (email) data.email = email.toLowerCase().trim();
    if (addresses) data.addresses = addresses;
    if (wishlist) data.wishlist = wishlist;

    const updated = await prisma.customer.update({
      where: { id: req.user.id },
      data
    });

    const { passwordHash, ...safeCustomer } = updated;
    res.json({ success: true, customer: safeCustomer });
  } catch (err) {
    console.error('Error updating customer profile in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
