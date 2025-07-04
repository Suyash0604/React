import React from "react";
import { useInventory } from "../context/InventoryContext";

const Home = () => {
  const { inventory } = useInventory();

  const totalItems = inventory.length;

  const lowStockItems = inventory.filter((item) => Number(item.Quantity) <= 5).length;

  const totalStockValue = inventory.reduce(
    (acc, item) => acc + Number(item.Quantity) * Number(item.price),
    0
  );

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-10 px-4 sm:px-[10%] py-10">
      
      <div className="bg-zinc-900 text-white rounded-xl shadow-md p-6 w-full max-w-sm hover:scale-[1.02] transition">
        <h1 className="text-2xl font-semibold mb-2">Total Items</h1>
        <p className="text-4xl font-bold text-indigo-400">{totalItems}</p>
      </div>

      
      <div className="bg-zinc-900 text-white rounded-xl shadow-md p-6 w-full max-w-sm hover:scale-[1.02] transition">
        <h1 className="text-2xl font-semibold mb-2">Low Stock Items</h1>
        <p className="text-4xl font-bold text-yellow-400">{lowStockItems}</p>
      </div>

      
      <div className="bg-zinc-900 text-white rounded-xl shadow-md p-6 w-full max-w-sm hover:scale-[1.02] transition">
        <h1 className="text-2xl font-semibold mb-2">Total Stock Value</h1>
        <p className="text-4xl font-bold text-green-400">₹{totalStockValue}</p>
      </div>
    </div>
  );
};

export default Home;
