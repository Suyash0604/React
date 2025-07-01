import { Routes, Route } from "react-router";
import Home from '../Components/Home.jsx';
import Products from '../Components/Products.jsx';

import Alerts from "../Components/Alerts.jsx";
import InventoryTable from "../Components/InventoryTable.jsx";
const Mainroutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/products' element={<Products/>}></Route>
        <Route path='/alerts' element={<Alerts/>}></Route>
        <Route path="/reports" element={<InventoryTable/>}></Route>
      </Routes>
  )
}

export default Mainroutes   