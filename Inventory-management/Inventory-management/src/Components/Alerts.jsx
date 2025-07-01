import React from "react";
import { useInventory } from "../context/InventoryContext";

const Alerts = () => {
  const { inventory } = useInventory();

  const lowStockItems = inventory.filter(
    (item) => Number(item.Quantity) <= 5
  );

  return (
    <div className="text-white px-4 sm:px-[10%] py-10">
      <h1 className="text-3xl font-bold mb-6">Low Stock Alerts</h1>

      {lowStockItems.length === 0 ? (
        <p className="text-gray-400">No low stock items!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-800 border border-red-500 p-5 rounded-xl shadow-md"
            >
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <div className="text-gray-300 text-sm mt-2">
                <p><span className="text-white font-medium">SKU:</span> {item.SKU}</p>
                <p><span className="text-white font-medium">Quantity:</span> {item.Quantity}</p>
                <p><span className="text-white font-medium">Supplier:</span> {item.supplier}</p>
                <p><span className="text-white font-medium">Date:</span> {item.Date}</p>
              </div>
              <p className="text-red-400 font-bold mt-3">⚠️ Low Stock</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
