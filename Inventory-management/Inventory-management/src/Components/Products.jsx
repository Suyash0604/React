import React, { useState } from "react";
import { RiAddFill } from "@remixicon/react";
import Add from "./Add";
import { useInventory } from "../context/InventoryContext";


const Products = ({ user }) => {
  const { inventory, deleteProduct } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);

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
                <p><span className="text-white font-medium">SKU:</span> {product.SKU}</p>
                <p><span className="text-white font-medium">Quantity:</span> {product.Quantity}</p>
                <p><span className="text-white font-medium">Price:</span> ₹{product.Price}</p>
                <p><span className="text-white font-medium">Supplier:</span> {product.supplier}</p>
                <p><span className="text-white font-medium">Date:</span> {product.Date}</p>
              </div>
              <div className="flex gap-3 mt-4">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
