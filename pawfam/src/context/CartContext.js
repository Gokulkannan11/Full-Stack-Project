import React, { createContext, useContext, useState, useRef } from 'react';

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
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimerRef = useRef(null);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });

    // Show toast/pop message when product is added
    try {
      // clear any existing timer
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ visible: true, message: `${product.name} added to cart` });
      // auto-hide after 3 seconds
      toastTimerRef.current = setTimeout(() => {
        setToast({ visible: false, message: '' });
        toastTimerRef.current = null;
      }, 3000);
    } catch (e) {
      // swallow errors related to toast
      console.error('Toast error', e);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* Simple toast for cart additions */}
      {toast.visible && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="cart-toast-message">{toast.message}</span>
          <button
            className="toast-close"
            aria-label="Close"
            onClick={() => {
              if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
              }
              setToast({ visible: false, message: '' });
            }}
          >
            ×
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
};