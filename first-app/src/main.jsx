import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";  
import App from "./App.jsx";
import "./index.css";
import Wrapper from "./Wrapper.jsx";
createRoot(document.getElementById("root")).render(
  <Wrapper>
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
  </Wrapper>
);
