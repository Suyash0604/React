import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/imageee.png";      
import registerImage from "../assets/imaeee22.png";   

const AuthPage = ({ setUser }) => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
    confirm_password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://192.168.1.26:8000/api/login/", loginData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/products");
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    const specialCharMatch = registerData.password.match(/[!@#$%^&*(),.?":{}|<>]/g);
    if (registerData.password.length < 8 || !specialCharMatch || specialCharMatch.length < 2) {
      alert("Password must be at least 8 characters and contain at least 2 special characters.");
      return;
    }

    try {
      await axios.post("http://192.168.1.26:8000/api/register/", registerData);
      alert("Registered successfully! Please login.");
      setIsActive(false);
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-zinc-900 via-gray-800 to-black flex flex-col items-center justify-center">

      {/* Title & subtitle */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-indigo-400 flex items-center justify-center gap-3 drop-shadow-md">
          🛒📦 Inventory Management System
        </h1>
        <p className="text-gray-300 mt-2 text-base max-w-md mx-auto">
          Effortlessly track, manage, and optimize your stock in real-time.
        </p>
      </div>

      <div className="relative w-[95%] max-w-5xl h-[80%] bg-zinc-800 rounded-3xl shadow-xl overflow-hidden flex">

        {/* Toggle panel */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center transition-transform duration-700 ${isActive ? "-translate-x-full rounded-r-[15rem]" : "rounded-l-[15rem]"}`}>
          <img
            src={isActive ? loginImage : registerImage}
            alt="Auth visual"
            className="h-[17rem] object-cover rounded-xl shadow-md"
          />
          <h2 className="text-2xl font-semibold text-white mt-4">
            {isActive ? "Welcome Back!" : "Join Us Today!"}
          </h2>
          <p className="text-sm text-gray-200 mt-2 px-6 leading-relaxed">
            {isActive
              ? "Log in to manage your products, view reports and keep everything organized."
              : "Create an account and take control of your inventory with powerful features."}
          </p>
          <button
            onClick={() => setIsActive(!isActive)}
            className="mt-6 bg-transparent border border-white px-6 py-2 rounded-full font-semibold text-white hover:bg-white hover:text-indigo-600 transition duration-300"
          >
            {isActive ? "Login" : "Register"}
          </button>
        </div>

        {/* Login form */}
        <div className={`w-1/2 h-full flex flex-col items-center justify-center p-10 bg-zinc-800 text-white transition-all duration-700 ${isActive ? "-translate-x-full opacity-0" : "opacity-100"}`}>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm bg-zinc-900 px-8 py-12 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-indigo-400 text-center mb-2">Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-lg text-white font-semibold">
              Log In
            </button>
          </form>
        </div>

        {/* Register form */}
        <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-10 bg-zinc-800 text-white transition-all duration-700 ${isActive ? "opacity-100 z-10" : "translate-x-full opacity-0 z-0"}`}>
          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-sm bg-zinc-900 px-8 py-10 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-indigo-400 text-center mb-2">Register</h2>
            <input
              name="username"
              placeholder="Name"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="contact"
              type="number"
              placeholder="Contact"
              value={registerData.contact}
              onChange={(e) => setRegisterData({ ...registerData, contact: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={registerData.confirm_password}
              onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-lg text-white font-semibold">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
