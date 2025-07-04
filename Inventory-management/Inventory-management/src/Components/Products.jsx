import React, { useState, useEffect } from "react";
import { RiAddFill } from "@remixicon/react";
import Add from "./Add";
import { useInventory } from "../context/InventoryContext";
import axios from "axios";

const Products = ({ user }) => {
  const { inventory, deleteProduct, setInventory } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);

  const [filters, setFilters] = useState({
    scheme: "",
    supplier: "",
    min_price: "",
    max_price: "",
    start_date: "",
    end_date: "",
  });

  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/suppliers/", {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(
        `http://localhost:8000/api/inventory/?${params}`,
        {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        }
      );
      setInventory(res.data);
    } catch (err) {
      console.error("Error applying filters", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEdit = (product) => {
    setEditableProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditableProduct(null);
  };

  return (
    <div className="text-white px-4 sm:px-[10%] py-10">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        {user.role === "admin" && (
          <button
            onClick={() => {
              setEditableProduct(null);
              setShowForm(!showForm);
            }}
            className="p-3 rounded bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-2 text-white"
          >
            <RiAddFill /> Add Product
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-800 p-4 rounded-xl mb-10 flex flex-wrap gap-4">
        <input
          placeholder="Scheme (SKU or Title)"
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) => setFilters({ ...filters, scheme: e.target.value })}
        />
        <select
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) =>
            setFilters({ ...filters, min_price: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Max Price"
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) =>
            setFilters({ ...filters, max_price: e.target.value })
          }
        />
        <input
          type="date"
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />
        <input
          type="date"
          className="bg-zinc-900 text-white p-2 rounded"
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
        />
        <button
          onClick={applyFilters}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Apply Filters
        </button>
      </div>

      {showForm && (
        <div className="mb-10">
          <Add editableProduct={editableProduct} onClose={handleCloseForm} />
        </div>
      )}

      {inventory.length === 0 ? (
        <p className="text-gray-400">No products added yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {inventory.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 shadow-md flex flex-col gap-2"
            >
              <h2 className="text-xl font-semibold">{product.title}</h2>
              <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
                <p>
                  <span className="text-white font-medium">SKU:</span>{" "}
                  {product.SKU}
                </p>
                <p>
                  <span className="text-white font-medium">Quantity:</span>{" "}
                  {product.Quantity}
                </p>
                <p>
                  <span className="text-white font-medium">Price:</span> ₹
                  {product.Price}
                </p>
                <p>
                  <span className="text-white font-medium">Supplier:</span>{" "}
                  {product.supplier}
                </p>
                <p>
                  <span className="text-white font-medium">Created:</span>{" "}
                  {new Date(product.created_at).toLocaleString()}
                </p>
                <p>
                  <span className="text-white font-medium">Updated:</span>{" "}
                  {new Date(product.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                {user.role === "admin" && (
                  <>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-sm px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-sm px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
