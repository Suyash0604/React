import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useInventory } from "../context/InventoryContext";
import formImage from "../assets/image2-removebg-preview.png";
import { nanoid } from "nanoid";
import axios from "axios";

const Add = ({ onClose, editableProduct }) => {
  const { addProduct, editProduct } = useInventory();
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Fetch suppliers
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://192.168.1.26:8000/api/suppliers/", {
          headers: { Authorization: `Token ${token}` },
        });
        setSuppliers(res.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    // Fetch users for owner dropdown
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://192.168.1.26:8000/api/users/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchSuppliers();
    fetchUsers();
  }, [token]);

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
      console.log("🔍 Submitted data:", data);
      addProduct(data); // Ensure backend accepts `owner` field
      onClose();
      reset();
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl w-full flex flex-col md:flex-row items-center justify-center gap-6 p-4">
  {/* Image */}
  <img
    src={formImage}
    alt="form"
    className="w-[250px] md:w-[300px] lg:w-[400px] h-auto object-cover rounded-2xl"
  />

  {/* Form */}
  <form
    onSubmit={handleSubmit(formHandler)}
    className="flex flex-col gap-4 w-full md:w-[60%] lg:w-[40%]"
  >
    <input
      placeholder="Product Name"
      {...register("title", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    />
    <input
      placeholder="SKU"
      {...register("SKU", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    />
    <input
      type="number"
      placeholder="Quantity"
      {...register("Quantity", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    />
    <input
      type="number"
      placeholder="Price"
      {...register("price", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    />
    <select
      {...register("supplier", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    >
      <option value="">Select Supplier</option>
      {suppliers.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
          {supplier.name}
        </option>
      ))}
    </select>
    <input
      type="date"
      {...register("Date", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    />

    <select
      {...register("owner", { required: true })}
      className="p-3 bg-zinc-800 text-white rounded"
    >
      <option value="">Select User</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.username}
        </option>
      ))}
    </select>

    <button
      type="submit"
      className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold"
    >
      {editableProduct ? "Update Product" : "Create Product"}
    </button>
  </form>
</div>
  );
};

export default Add;
