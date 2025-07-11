import React from 'react'
import { NavLink } from 'react-router-dom'

const Nav = () => {
  return (
    <div className='w-[60%] m-auto h-[5rem] bg-[var(--color-light)] rounded-xl flex items-center justify-center gap-10 text-2xl text-[var(--color-darkest)] font-semibold'>
        <NavLink className={(e) => (e.isActive ? "text-red-800" : "")} to="/">Home</NavLink>        
        <NavLink className={(e) => (e.isActive ? "text-red-800" : "")} to="/Products">Products</NavLink>        
        <NavLink className={(e) => (e.isActive ? "text-red-800" : "")} to="/About">About</NavLink>        
        <NavLink className={(e) => (e.isActive ? "text-red-800" : "")} to="/Service">Service</NavLink>        
    </div>
  )
}

export default Nav