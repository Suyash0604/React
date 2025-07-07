import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiEarthFill, RiMenu3Fill, RiCloseFill } from "@remixicon/react";

const Nav = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="w-screen flex justify-center px-2 overflow-x-hidden">
      <div className="w-full max-w-[1000px] mt-5 bg-zinc-800 rounded-2xl text-white text-xl px-3 py-5 transition-all duration-200 ease-in font-bold">
        {/* Top bar */}
        <div className="flex justify-between md:justify-center gap-6 items-center">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-50">
              <RiEarthFill size={36} className="text-black" />
            </div>
            <div className="hidden md:flex gap-4 items-center">
              {user?.role === "admin" && (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? " text-red-400" : ""
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/add-supplier"
                    className={({ isActive }) =>
                      isActive ? " text-red-400" : ""
                    }
                  >
                    Add Supplier
                  </NavLink>
                  <NavLink
                    to="/view-suppliers"
                    className={({ isActive }) =>
                      isActive ? " text-red-400" : ""
                    }
                  >
                    View Suppliers
                  </NavLink>
                  <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                      isActive ? " text-red-400" : ""
                    }
                  >
                    Reports
                  </NavLink>
                </>
              )}
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive ? " text-red-400" : ""
                }
              >
                Products
              </NavLink>

              {user?.role === "user" && (
                <>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      isActive ? " text-red-400" : ""
                    }
                  >
                    🛒 Cart
                  </NavLink>
                  <NavLink to="/my-bills">My Bills</NavLink>
                </>
              )}
              {user?.role === "admin" && (
                <NavLink to="/alerts">
                  <button className="text-sm bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white">
                    Low Stock Alerts
                  </button>
                </NavLink>
              )}
            </div>
          </div>

          {/* Right - Logout / Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="hidden md:block text-sm bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600 text-white"
            >
              Logout
            </button>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <RiCloseFill size={30} />
              ) : (
                <RiMenu3Fill size={30} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="flex flex-col mt-4 gap-3 md:hidden text-lg">
            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? " text-red-400" : ""
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/add-supplier"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? " text-red-400" : ""
                  }
                >
                  Add Supplier
                </NavLink>
                <NavLink
                  to="/view-suppliers"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? " text-red-400" : ""
                  }
                >
                  View Suppliers
                </NavLink>
              </>
            )}
            <NavLink
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? " text-red-400" : ""
              }
            >
              Inventory
            </NavLink>
            <NavLink
              to="/reports"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? " text-red-400" : ""
              }
            >
              Reports
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/alerts" onClick={() => setIsMenuOpen(false)}>
                <button className="text-sm bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white">
                  Low Stock Alerts
                </button>
              </NavLink>
            )}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="text-sm bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600 text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
