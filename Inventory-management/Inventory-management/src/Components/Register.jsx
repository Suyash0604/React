import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import formImage from "../assets/imaeee22.png";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    // Password validation: minimum 8 characters, 2 special characters
    const specialCharMatch = formData.password.match(/[!@#$%^&*(),.?":{}|<>]/g);
    if (
      formData.password.length < 8 ||
      !specialCharMatch ||
      specialCharMatch.length < 2
    ) {
      alert("Password must be at least 8 characters and contain at least 2 special characters.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/register/", formData);
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="w-screen h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-[90%] max-w-6xl h-[90%] bg-zinc-800 rounded-4xl shadow-xl flex items-center justify-around p-8">
        <img
          src={formImage}
          className="h-[40rem] cover hidden md:block"
          alt="Register visual"
        />

        <form
          onSubmit={handleRegister}
          className="bg-zinc-900 text-white p-10 rounded-4xl shadow-lg w-full max-w-sm flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-400">
            Register
          </h2>

          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Name"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="contact"
            type="number"
            maxLength={10}
            value={formData.contact}
            onChange={handleChange}
            placeholder="Contact"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 cursor:pointer rounded text-white font-semibold"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
