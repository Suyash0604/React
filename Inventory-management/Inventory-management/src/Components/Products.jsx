import React, { useState, useEffect } from "react";
import { RiAddFill } from "@remixicon/react";
import Add from "./Add";
import { useInventory } from "../context/InventoryContext";
import axios from "axios";
import BuyProduct from "./BuyProduct";
import { QRCodeCanvas } from "qrcode.react";

const Products = ({ user }) => {
  const { inventory, deleteProduct, setInventory } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    scheme: "",
    supplier: "",
    min_price: "",
    max_price: "",
    start_date: "",
    end_date: "",
  });

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
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
    fetchSuppliers();
  }, []);

  const applyFilters = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const params = new URLSearchParams(cleanFilters).toString();
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `http://localhost:8000/api/inventory/?${params}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setInventory(res.data);
    } catch (err) {
      console.error("Error applying filters:", err.response?.data || err.message);
    }
  };

  const handleEdit = (product) => {
    setEditableProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditableProduct(null);
  };

  return (
    <div className="text-white px-4 sm:px-[10%] py-10 flex flex-col items-center">
      <div className="flex justify-between w-full max-w-6xl items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {user.role === "admin" && (
            <button
              onClick={() => {
                setEditableProduct(null);
                setShowForm(!showForm);
              }}
              className="p-3 rounded bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-2"
            >
              <RiAddFill /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-zinc-800 p-4 rounded-xl mb-10 flex flex-wrap gap-4 w-full max-w-6xl">
          <input
            placeholder="Scheme (SKU or Title)"
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[150px]"
            onChange={(e) => setFilters({ ...filters, scheme: e.target.value })}
          />
          <select
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[150px]"
            onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[100px]"
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[100px]"
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          />
          <input
            type="date"
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[150px]"
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
          <input
            type="date"
            className="bg-zinc-900 text-white p-2 rounded flex-1 min-w-[150px]"
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
          <button
            onClick={applyFilters}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="mb-10 w-full max-w-4xl">
          <Add editableProduct={editableProduct} onClose={handleCloseForm} />
        </div>
      )}

      {/* Products List */}
      {inventory.length === 0 ? (
        <p className="text-gray-400">No products added yet.</p>
      ) : (
        <div className="grid gap-6 w-full max-w-6xl grid-cols-1 md:grid-cols-2">
          {inventory.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 shadow-md flex flex-col gap-3 hover:border-indigo-500 transition"
            >
              <h2 className="text-xl font-semibold text-indigo-400">{product.title}</h2>
              <div className="flex flex-wrap gap-3 text-gray-300 text-sm">
                <p><span className="text-white font-medium">Price:</span> ₹{product.price}</p>
                <p><span className="text-white font-medium">Supplier:</span> {product.supplier_name || "N/A"}</p>
                <p><span className="text-white font-medium">Quantity:</span> {product.Quantity}</p>
                <p><span className="text-white font-medium">SKU:</span> {product.SKU}</p>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <p>Created: {new Date(product.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(product.updated_at).toLocaleString()}</p>
              </div>

              {/* ✅ Scannable QR Code */}
              <div className="mt-3 flex items-center gap-2">
                <p className="text-xs text-gray-400">Scan for product:</p>
                <QRCodeCanvas
                  value={JSON.stringify({
                    id: product.id,
                    title: product.title,
                    SKU: product.SKU,
                    price: product.price,
                    quantity: product.Quantity,
                    supplier: product.supplier_name
                  })}
                  size={80}
                  bgColor="#000"
                  fgColor="#fff"
                  className="rounded"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                {user.role === "user" && (
                  <button
                    className="flex-1 text-xs px-3 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={() => setBuyProduct({ ...product })}
                  >
                    Buy
                  </button>
                )}
                {user.role === "admin" && (
                  <>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 text-xs px-3 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 text-xs px-3 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
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

      {/* Buy Product Modal */}
      {buyProduct && (
        <div className="mb-10 w-full max-w-2xl">
          <BuyProduct
            product={buyProduct}
            onClose={() => setBuyProduct(null)}
            refreshInventory={applyFilters}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
