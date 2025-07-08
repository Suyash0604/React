import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const BuyProduct = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  console.log("🛒 Rendering BuyProduct for:", product?.title);

  const totalPrice =
    quantity && product?.price
      ? (quantity * parseFloat(product.price)).toFixed(2)
      : "0.00";

  const handleAddToCart = () => {
    setError("");

    if (!buyerName.trim() || !contactNumber.trim()) {
      setError("Please enter buyer name and contact number.");
      return;
    }

    if (quantity < 1) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (quantity > product.Quantity) {
      setError("Quantity exceeds available stock.");
      return;
    }

    addToCart({
      product: { ...product, price: parseFloat(product.price) },
      quantity,
      totalPrice: parseFloat(product.price) * quantity,
      buyerName,
      contactNumber,
    });

    onClose();
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-xl mb-6 w-fit">
      <h2 className="text-xl font-semibold mb-4">Buy {product?.title}</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Buyer Name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="bg-zinc-900 text-white p-2 rounded"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="bg-zinc-900 text-white p-2 rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="bg-zinc-900 text-white p-2 rounded"
          min={1}
          max={product?.Quantity}
        />
        <p className="text-white">
          <span className="font-semibold">Total Price: </span> ₹{totalPrice}
        </p>

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add to Cart
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
