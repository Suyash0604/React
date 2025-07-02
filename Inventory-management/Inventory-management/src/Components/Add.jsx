import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useInventory } from "../context/InventoryContext";
import formImage from "../assets/image2-removebg-preview.png";
import { nanoid } from "nanoid";

const Add = ({ onClose, editableProduct }) => {
  const { addProduct, editProduct } = useInventory();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

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
          {...register("Price", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
        <input
          placeholder="Supplier"
          {...register("supplier", { required: true })}
          className="w-full p-3 bg-zinc-800 text-white  rounded"
        />
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
