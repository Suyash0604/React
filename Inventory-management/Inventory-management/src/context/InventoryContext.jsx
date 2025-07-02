import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const InventoryContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/inventory/");
      setInventory(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/inventory/${id}/`);
      fetchInventory();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const editProduct = async (updatedItem) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/inventory/${updatedItem.id}/`, updatedItem);
      fetchInventory();
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

  const addProduct = async (newItem) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/inventory/", newItem);
      fetchInventory();
    } catch (error) {
      console.error("Error adding:", error);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        deleteProduct,
        editProduct,
        addProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
