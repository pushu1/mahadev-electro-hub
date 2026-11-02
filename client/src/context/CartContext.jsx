import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('meh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('meh_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  useEffect(() => {
    localStorage.setItem('meh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('meh_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('meh_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, quantity = 1, openDrawer = true) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      const qtyToAdd = Math.max(1, quantity);

      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qtyToAdd;
        const maxStock = product.stockQuantity || 99;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            title_en: product.title_en,
            title_hi: product.title_hi,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            image: product.mainImage,
            stockQuantity: product.stockQuantity || 0,
            quantity: Math.min(qtyToAdd, product.stockQuantity || 1),
          }
        ];
      }
    });

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const clampedQty = Math.min(newQuantity, item.stockQuantity || 99);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrderValue || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  // Shipping Calculation: Free on ₹1,000+
  const freeShippingThreshold = 1000;
  const standardShippingFee = 99;
  const shippingFee = (subtotal - discount) >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  const applyCouponCode = async (code) => {
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponSuccess(`Coupon "${res.coupon.code}" applied! You saved ₹${res.coupon.calculatedDiscount}`);
        return true;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        freeShippingThreshold,
        appliedCoupon,
        couponError,
        couponSuccess,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
