import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/inventory/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading product...</p>;

  if (!product) return <p className="text-center text-red-500 mt-10">Product not found.</p>;

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-zinc-800 text-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">{product.title}</h2>
        <p className="mb-2"><span className="font-semibold">SKU:</span> {product.SKU}</p>
        <p className="mb-2"><span className="font-semibold">Price:</span> ₹{product.price}</p>
        <p className="mb-2"><span className="font-semibold">Quantity:</span> {product.Quantity}</p>
        <p className="mb-2"><span className="font-semibold">Supplier:</span> {product.supplier_name || "N/A"}</p>
        <p className="text-xs text-gray-500 mt-4">Created: {new Date(product.created_at).toLocaleString()}</p>
        <p className="text-xs text-gray-500">Updated: {new Date(product.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductDetail;
