import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Admin state
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('meh_admin_token'));
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = localStorage.getItem('meh_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Customer state
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('meh_customer_token'));
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const u = localStorage.getItem('meh_customer_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Wishlist in local state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const w = localStorage.getItem('meh_wishlist');
      return w ? JSON.parse(w) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('meh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Admin actions
  const loginAdmin = async (email, password) => {
    const res = await api.adminLogin(email, password);
    if (res.success && res.token) {
      setAdminToken(res.token);
      setAdminUser(res.admin);
      localStorage.setItem('meh_admin_token', res.token);
      localStorage.setItem('meh_admin_user', JSON.stringify(res.admin));
      return res.admin;
    }
    throw new Error(res.message || 'Admin login failed');
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('meh_admin_token');
    localStorage.removeItem('meh_admin_user');
  };

  // Customer actions
  const loginCustomer = async (identifier, password) => {
    const res = await api.customerLogin(identifier, password);
    if (res.success && res.token) {
      setCustomerToken(res.token);
      setCustomerUser(res.customer);
      localStorage.setItem('meh_customer_token', res.token);
      localStorage.setItem('meh_customer_user', JSON.stringify(res.customer));
      if (Array.isArray(res.customer.wishlist)) {
        setWishlist(res.customer.wishlist);
      }
      return res.customer;
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerCustomer = async (data) => {
    const res = await api.customerRegister(data);
    if (res.success && res.token) {
      setCustomerToken(res.token);
      setCustomerUser(res.customer);
      localStorage.setItem('meh_customer_token', res.token);
      localStorage.setItem('meh_customer_user', JSON.stringify(res.customer));
      return res.customer;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('meh_customer_token');
    localStorage.removeItem('meh_customer_user');
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAdminAuthenticated: Boolean(adminToken && adminUser),
        loginAdmin,
        logoutAdmin,
        customerToken,
        customerUser,
        isCustomerAuthenticated: Boolean(customerToken && customerUser),
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
