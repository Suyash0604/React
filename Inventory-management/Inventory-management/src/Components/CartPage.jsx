import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const buyerName = cart[0]?.buyerName || "";
  const contactNumber = cart[0]?.contactNumber || "";

  const total = cart
    .reduce((sum, item) => {
      const price = parseFloat(item?.product?.price || item?.price || 0);
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);

  const handleConfirm = async () => {
  setError("");

  if (cart.length === 0) {
    setError("Your cart is empty.");
    return;
  }

  const buyerName = cart[0]?.buyerName;
  const contactNumber = cart[0]?.contactNumber;

  if (!buyerName || !contactNumber || !address.trim()) {
    setError("Incomplete data");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:8000/api/confirm_purchase/",
      {
        buyer_name: buyerName,
        contact_number: contactNumber,
        address,
        items: cart.map((item) => ({
          product: item.product?.id || item.id,
          quantity: item.quantity,
        })),
      },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    clearCart();
    navigate(`/bill/${res.data.bill_id}`);
  } catch (err) {
    console.error("❌ Error confirming purchase:", err.response?.data || err.message);
    setError(err.response?.data?.error || "Purchase failed");
  }
};

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-400">Your cart is empty.</p>
      ) : (
        <>
          {/* Buyer Info */}
          <div className="mb-6 text-sm text-gray-300">
            <p>
              👤 <strong>Buyer Name:</strong> {buyerName}
            </p>
            <p>
              📞 <strong>Contact Number:</strong> {contactNumber}
            </p>
          </div>

          {/* Cart Table */}
          <div className="grid grid-cols-4 gap-4 font-semibold border-b border-gray-500 pb-2 mb-2">
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit Price</span>
            <span>Total</span>
          </div>

          {cart.map((item, index) => {
            const title = item?.product?.title || item?.title;
            const quantity = item.quantity;
            const unitPrice = parseFloat(
              item?.product?.price || item?.price || 0
            );
            const lineTotal = (quantity * unitPrice).toFixed(2);

            return (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-zinc-700"
              >
                <span>{title}</span>
                <span>{quantity}</span>
                <span>₹{unitPrice.toFixed(2)}</span>
                <span className="font-semibold text-green-300">
                  ₹{lineTotal}
                </span>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex justify-end mt-4 text-lg font-bold">
            <span className="text-white">Total: ₹{total}</span>
          </div>

          {/* Address Only */}
          <div className="mt-6 space-y-3">
            <textarea
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-zinc-900 p-3 rounded w-full outline-none"
              rows={3}
            />
          </div>

          {error && <p className="text-red-400 mt-3">{error}</p>}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 py-3 rounded text-white font-semibold text-lg transition"
          >
            ✅ Confirm Purchase & Generate Bill
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
