import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const token = localStorage.getItem("token");

  // ====== INVENTORY ======
  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/inventory/", {
        headers: { Authorization: `Token ${token}` },
      });
      setInventory(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/inventory/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.error("Deleted!");
      fetchInventory();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const editProduct = async (updatedItem) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/inventory/${updatedItem.id}/`, updatedItem, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Edited!");
      fetchInventory();
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

  const addProduct = async (newItem) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/inventory/", newItem, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Added!");
      fetchInventory();
    } catch (error) {
      console.error("Error adding:", error);
    }
  };

  // ====== SUPPLIERS ======
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/suppliers/", {
        headers: { Authorization: `Token ${token}` },
      });
      setSuppliers(res.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
  if (token) {
    fetchInventory();
    fetchSuppliers();
  }
}, [token]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        suppliers,
        fetchSuppliers,
        deleteProduct,
        editProduct,
        addProduct,
        setInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
