import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import formImage from "../assets/imageee.png";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/login/", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/products");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="w-screen h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-[90%] max-w-6xl h-[80%] bg-zinc-800 rounded-4xl shadow-xl flex items-center justify-around p-8">
        <img
          src={formImage}
          className="h-[40rem] cover hidden md:block"
          alt="Login visual"
        />

        <form
          onSubmit={handleLogin}
          className="bg-zinc-900 text-white p-10 rounded-4xl shadow-lg w-full max-w-sm flex flex-col gap-6"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-400">
            Login
          </h2>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-3 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 cursor:pointer rounded text-white font-semibold"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
