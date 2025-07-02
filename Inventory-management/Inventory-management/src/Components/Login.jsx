import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-10 text-white flex flex-col gap-4 max-w-sm mx-auto mt-20 bg-zinc-800 rounded">
      <h2 className="text-xl font-bold">Login</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="p-2 rounded bg-zinc-700" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-2 rounded bg-zinc-700" />
      <button type="submit" className="bg-indigo-600 p-2 rounded">Login</button>
    </form>
  );
};

export default Login;
