import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useInventory } from "../context/InventoryContext";
import formImage from "../assets/image2-removebg-preview.png";
import { nanoid } from "nanoid";
import axios from "axios";
import { useState } from "react";
const Add = ({ onClose, editableProduct }) => {
  const { addProduct, editProduct } = useInventory();
  const [suppliers, setSuppliers] = useState([]);
  const token = localStorage.getItem("token");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // fetch suppliers from backend
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/suppliers/", {
          headers: { Authorization: `Token ${token}` },
        });
        setSuppliers(res.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);
  useEffect(() => {
    if (editableProduct) {
      Object.entries(editableProduct).forEach(([key, value]) => {
        setValue(key, value);
      });
    } else {
      reset();
    }
  }, [editableProduct, setValue]);

  const formHandler = (data) => {
    if (editableProduct) {
      editProduct(data);
      onClose();
    } else {
      data.id = nanoid();
      addProduct(data);
      onClose();
      reset();
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl  w-full flex items-center justify-around">
      <img
        src={formImage}
        alt="form"
        className="w-[400px] h-[550px] cover rounded-2xl"
      />
      <form
        onSubmit={handleSubmit(formHandler)}
        className="flex flex-wrap gap-5 w-[40%]"
      >
        <input
          placeholder="Product Name"
          {...register("title", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
        <input
          placeholder="SKU"
          {...register("SKU", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          {...register("Quantity", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
        <input
          type="number"
          placeholder="Price"
          {...register("price", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
        <select
          {...register("supplier", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white rounded"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.name}>
              {supplier.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          {...register("Date", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {editableProduct ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default Add;
