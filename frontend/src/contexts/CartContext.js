import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
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
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCartItems = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      if (response.data.success) {
        setCartItems(response.data.cartItems);
        setCartCount(response.data.itemCount);
      }
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/api/cart/add', {
        productId,
        quantity
      });

      if (response.data.success) {
        await fetchCartItems();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '장바구니 추가 중 오류가 발생했습니다.' 
      };
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/api/cart/${cartItemId}`, {
        quantity
      });

      if (response.data.success) {
        await fetchCartItems();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '장바구니 업데이트 중 오류가 발생했습니다.' 
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await api.delete(`/api/cart/${cartItemId}`);

      if (response.data.success) {
        await fetchCartItems();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '장바구니 삭제 중 오류가 발생했습니다.' 
      };
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/api/cart/clear');

      if (response.data.success) {
        setCartItems([]);
        setCartCount(0);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '장바구니 비우기 중 오류가 발생했습니다.' 
      };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCartItems,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};