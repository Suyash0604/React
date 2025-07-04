import { Routes, Route } from "react-router";
import Home from '../Components/Home.jsx';
import Products from '../Components/Products.jsx';

import Alerts from "../Components/Alerts.jsx";
import InventoryTable from "../Components/InventoryTable.jsx";
import Register from "../Components/Register.jsx";
import AddSupplier from "../Components/AddSupplier.jsx";
import ViewSuppliers from "../Components/ViewSuppliers.jsx";
const Mainroutes = ({ user }) => {
  return (
    <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/products' element={<Products user={user} />}></Route>
        <Route path='/alerts' element={<Alerts/>}></Route>
        <Route path="/reports" element={<InventoryTable/>}></Route>
        <Route path="/register" element={<Register/>} />
        <Route path="/add-supplier" element={<AddSupplier user={user} />} />
        <Route path="/view-suppliers" element={<ViewSuppliers user={user} />} />
      </Routes>
  )
}

export default Mainroutes   