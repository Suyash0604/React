// routes/Mainroutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../Components/Home";
import Products from "../Components/Products";
import Alerts from "../Components/Alerts";
import InventoryTable from "../Components/InventoryTable";

const Mainroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/reports" element={<InventoryTable />} />
    </Routes>
  );
};

export default Mainroutes;
