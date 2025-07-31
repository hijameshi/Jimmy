import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCartItems = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      const response = await cartAPI.getItems();
      setCartItems(response.data);
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      return { success: false };
    }

    try {
      await cartAPI.addItem({ productId, quantity });
      await fetchCartItems();
      return { success: true, message: '장바구니에 추가되었습니다.' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '장바구니 추가에 실패했습니다.' 
      };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await cartAPI.updateItem({ productId, quantity });
      await fetchCartItems();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '수량 변경에 실패했습니다.' 
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      await fetchCartItems();
      return { success: true, message: '상품이 제거되었습니다.' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '상품 제거에 실패했습니다.' 
      };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.productPrice * item.quantity);
    }, 0);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated()]);

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    fetchCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};