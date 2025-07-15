import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import formImage from "../assets/Suplier.png"; // same image as Register form

const AddSupplier = ({ user }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    gst_number: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/products");
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    if (!gstRegex.test(form.gst_number)) {
      alert("Invalid GST Number format.");
      return;
    }
    try {
      await axios.post("http://192.168.1.26:8000/api/suppliers/", form, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      alert("Supplier added successfully!");
      setForm({ name: "", contact: "", email: "", gst_number: "" });
    } catch (err) {
      alert("Error adding supplier.");
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-[90%] max-w-6xl h-[90%] bg-[#20222B] rounded-4xl shadow-xl flex items-center justify-around p-8">
        <img
          src={formImage}
          className="h-[40rem] cover hidden md:block"
          alt="Add Supplier visual"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 text-white p-10 rounded-4xl shadow-lg w-full max-w-sm flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-400">
            Add Supplier
          </h2>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Contact"
            required
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="gst_number"
            value={form.gst_number}
            onChange={handleChange}
            placeholder="GST Number (e.g. 27ABCDE1234F1Z5)"
            required
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 cursor:pointer rounded text-white font-semibold"
          >
            Add Supplier
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;
