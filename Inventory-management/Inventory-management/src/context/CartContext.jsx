// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(
      (i) => i.product.id === item.product.id
    );

    if (existingItemIndex !== -1) {
      // If already in cart, update quantity and totalPrice
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity;
      updatedCart[existingItemIndex].totalPrice =
        updatedCart[existingItemIndex].quantity * item.product.price;

      setCart(updatedCart);
    } else {
      // Else, add new item
      setCart((prevCart) => [...prevCart, item]);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
