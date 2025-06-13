import { createRoot } from "react-dom/client";
import { ToastContainer, toast } from "react-toastify";
import App from "./App.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <>
    <App />
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
  </>
);
