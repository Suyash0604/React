import { Routes, Route, Navigate } from "react-router";
import Home from '../Components/Home.jsx';
import Products from '../Components/Products.jsx';
import Alerts from "../Components/Alerts.jsx";
import InventoryTable from "../Components/InventoryTable.jsx";
import Register from "../Components/Register.jsx";
import AddSupplier from "../Components/AddSupplier.jsx";
import ViewSuppliers from "../Components/ViewSuppliers.jsx";
import CartPage from "../Components/CartPage";
import BillPage from "../Components/BillPage";
import MyBills from "../Components/MyBills.jsx";

const Mainroutes = ({ user }) => {
  return (
    <Routes>
      <Route path="/cart" element={<CartPage />} />
      <Route path="/bill/:billId" element={<BillPage />} />
      <Route path='/' element={<Home user={user} />} />
      <Route path='/products' element={<Products user={user} />} />
      <Route path='/alerts' element={<Alerts />} />

      {/* ✅ Admin-only route for reports */}
      <Route
        path="/reports"
        element={
          user?.role === "admin" ? (
            <InventoryTable />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route path="/register" element={<Register />} />
      <Route path="/add-supplier" element={<AddSupplier user={user} />} />
      <Route path="/view-suppliers" element={<ViewSuppliers user={user} />} />
      <Route path="/my-bills" element={<MyBills />} />
    </Routes>
  );
};

export default Mainroutes;
