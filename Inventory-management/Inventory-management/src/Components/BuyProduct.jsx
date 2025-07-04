import React, { useState, useEffect } from "react";
import axios from "axios";

const BuyProduct = ({ product, onClose, refreshInventory }) => {
  const [organization, setOrganization] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPrice = (quantity && product?.price) ? (quantity * product.price).toFixed(2) : "0.00";

  const handleBuy = async () => {
    setError("");
    setSuccess("");

    if (!organization || !address || !quantity || quantity < 1) {
      setError("Please fill all fields with valid values.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/api/buy/",
        {
          product: product.id,
          quantity,
          organization,
          address,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setSuccess("Purchase successful!");
      refreshInventory(); // Refetch inventory to update quantity
      onClose(); // Close form
    } catch (err) {
      setError(err.response?.data?.error || "Purchase failed.");
    }
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-xl mb-6 w-fit">
      <h2 className="text-xl font-semibold mb-4">Buy {product.title}</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Organization Name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="bg-zinc-900 text-white p-2 rounded"
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-zinc-900 text-white p-2 rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="bg-zinc-900 text-white p-2 rounded"
          min={1}
          max={product.Quantity}
        />
        <p className="text-white">
          <span className="font-semibold">Total Price: </span> ₹{totalPrice}
        </p>

        {error && <p className="text-red-400">{error}</p>}
        {success && <p className="text-green-400">{success}</p>}

        <div className="flex gap-4">
          <button
            onClick={handleBuy}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Confirm Purchase
          </button>
          <button
            onClick={onClose}
            className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyProduct;
