// App.jsx
import React from "react";
import Nav from "./Components/Nav";
import Mainroutes from "./routes/Mainroutes";

const App = () => {
  return (
    <div className="bg-black min-h-screen">
      <Nav />
      <Mainroutes />
    </div>
  );
};

export default App;
