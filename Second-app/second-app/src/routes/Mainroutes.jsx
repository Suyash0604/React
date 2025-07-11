import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../Components/Home'
import Products from '../Components/Products'
import About from '../Components/About'
import Service from '../Components/Service'
import ProductDetails from '../Components/ProductDetails'
const Mainroutes = () => {
  return (
    <Routes>
        <Route path={"/"} element={<Home/>}/>
        <Route path={"/Products"} element={<Products/>}/>
        <Route path={"/Products/ProductDetails/:name"} element={<ProductDetails/>}/>
        <Route path={"/About"} element={<About/>}/>
        <Route path={"/Service"} element={<Service/>}/>
    </Routes>
  )
}

export default Mainroutes