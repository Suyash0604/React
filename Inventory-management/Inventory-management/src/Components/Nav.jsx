import React from "react";
import { Link, NavLink } from "react-router-dom";
import { RiEarthFill } from "@remixicon/react";
const Nav = ({ user }) => {
  return (
    <div className="w-screen flex justify-center">
      <div className="w-[42%] mt-5 bg-zinc-800 h-17 rounded-2xl text-white text-xl flex items-center justify-center gap-8 px-5  transition-all duration-200 ease-in font-bold">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-50">
          <RiEarthFill size={36} className="text-black " />
        </div>
        {user.role === 'admin' && (
          <NavLink
          className={(e) => (e.isActive ? "underline text-red-400" : "")}
          to="/"
        >
          Dashboard
        </NavLink>
        )}
        <NavLink
          className={(e) => (e.isActive ? "underline text-red-400" : "")}
          to="/products"
        >
          Inventory
        </NavLink>
        <NavLink
          className={(e) => (e.isActive ? "underline text-red-400" : "")}
          to="/reports"
        >
          Reports
        </NavLink>
        {user.role === 'admin' && (
          <NavLink to="/alerts">
          <button className="text-sm bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white">
            Low Stock Alerts
          </button>
        </NavLink>
        )}
      </div>
    </div>
  );
};

export default Nav;
