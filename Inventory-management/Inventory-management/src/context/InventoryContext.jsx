import React, { createContext, useContext, useState } from "react";

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  const deleteProduct = (id) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const editProduct = (updatedItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  return (
    <InventoryContext.Provider
      value={{ inventory, setInventory, deleteProduct, editProduct }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
