import React, { useState } from "react";
import Nav from "./Components/Nav";
import Mainroutes from "./routes/Mainroutes";
import Login from "./Components/Login";


const App = () => {
  const [user, setUser] = useState(null);

  if (!user) return <Login setUser={setUser} />;

  return (
    <div className="bg-black min-h-screen">
     
      <Nav user={user} />
      <Mainroutes user={user} />
    </div>
  );
};

export default App;
