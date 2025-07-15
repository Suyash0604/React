import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Components/Nav";
import Mainroutes from "./routes/Mainroutes";
import { Routes, Route, useLocation } from "react-router-dom";
import AuthPage from "./Components/AuthPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://192.168.1.26:8000/api/current-user/", {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading)
    return <div className="text-white text-center pt-10">Loading...</div>;

  // Only show Nav when user is logged in
  return (
    <div className="bg-black min-h-screen min-w-screen">
      {user && <Nav user={user} setUser={setUser} />}
      <Routes>
        {!user ? (
          <>
            <Route path="/*" element={<AuthPage setUser={setUser} />} />
          </>
        ) : (
          <Route path="/*" element={<Mainroutes user={user} />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
