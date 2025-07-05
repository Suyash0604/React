import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { InventoryProvider } from "./context/InventoryContext";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <InventoryProvider>
      <CartProvider>
        <App />
      </CartProvider>
      <ToastContainer
        position="top-center"
        autoClose={1100}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </InventoryProvider>
  </BrowserRouter>
);
