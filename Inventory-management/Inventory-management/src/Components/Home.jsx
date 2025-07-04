import React, { useEffect, useState } from "react";
import axios from "axios";
import { useInventory } from "../context/InventoryContext";

const Home = ({ user }) => {
  const { inventory } = useInventory();

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item) => Number(item.Quantity) <= 5
  ).length;
  const totalStockValue = inventory.reduce(
    (acc, item) => acc + Number(item.Quantity) * Number(item.price),
    0
  );

  const [salesStats, setSalesStats] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (user?.role === "admin") {
        try {
          const res = await axios.get(
            "http://localhost:8000/api/dashboard-stats/",
            {
              headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
              },
            }
          );
          setSalesStats(res.data);
        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
        }
      }
    };
    fetchDashboardStats();
  }, [user]);

  return (
    <div className="flex flex-col gap-10 mt-10 px-4 sm:px-[10%] py-10 text-white">
      {/* Inventory Stats */}
      <div className="flex flex-wrap justify-center gap-6">
        <Card
          title="Total Items"
          value={totalItems}
          colorClass="text-indigo-400"
        />
        <Card
          title="Low Stock Items"
          value={lowStockItems}
          colorClass="text-yellow-400"
        />
        <Card
          title="Total Stock Value"
          value={`₹${totalStockValue.toLocaleString()}`}
          colorClass="text-green-400"
        />

        {user?.role === "admin" && salesStats && (
          <>
            <Card
              title="Total Items Sold"
              value={salesStats.total_sold}
              colorClass="text-green-400"
            />
            <Card
              title="Top Product"
              value={salesStats.most_sold_product || "N/A"}
              colorClass="text-blue-400"
            />
          </>
        )}
      </div>
      {user?.role === "admin" && salesStats?.recent_purchases?.length > 0 && (
  <div className="text-center mt-4">
    <button
      onClick={async () => {
        if (window.confirm("Are you sure you want to clear all sales data?")) {
          try {
            await axios.delete("http://localhost:8000/api/clear-sales/", {
              headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
              },
            });
            setSalesStats((prev) => ({
              ...prev,
              recent_purchases: [],
              sales_breakdown: [],
              total_sold: 0,
              most_sold_product: null,
            }));
          } catch (err) {
            console.error("Error clearing sales data:", err);
          }
        }
      }}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
    >
      Clear All Sales Data
    </button>
  </div>
)}

      {/* Recent Purchases */}
      {user?.role === "admin" && salesStats && (
        <>
          {/* ✅ Recent Purchases Section */}
          <div className="bg-zinc-900 w-[45rem] text-center m-auto rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-zinc-700 pb-2">
              Recent Purchases
            </h2>

            {salesStats.recent_purchases.length === 0 ? (
              <p className="text-gray-400">No recent sales.</p>
            ) : (
              <div className="space-y-4">
                {salesStats.recent_purchases.map((sale, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-800 rounded-xl shadow-sm border border-zinc-700"
                  >
                    <div className="flex gap-4 mb-2">
                      <span className="text-sm text-gray-400">Product:</span>
                      <span className="font-semibold text-white">
                        {sale.product__title}
                      </span>
                    </div>

                    <div className="flex gap-4 mb-2">
                      <span className="text-sm text-gray-400">Quantity:</span>
                      <span className="text-yellow-300 font-medium">
                        {sale.quantity}
                      </span>
                    </div>

                    <div className="flex gap-4 mb-2">
                      <span className="text-sm text-gray-400">
                        Organization:
                      </span>
                      <span className="text-white">{sale.organization}</span>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-sm text-gray-400">Date:</span>
                      <span className="text-gray-300">
                        {new Date(sale.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sales Breakdown */}
          <div className="bg-zinc-900 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Sales Breakdown</h2>
            {salesStats.sales_breakdown.length === 0 ? (
              <p className="text-gray-400">No sales data available.</p>
            ) : (
              <div className="space-y-2">
                {salesStats.sales_breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 border-b border-zinc-700 pb-2"
                  >
                    <span>{item.product__title}</span>
                    <span className="text-green-400 font-bold">
                      {item.total_sold}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ✅ Card Component with working Tailwind color
const Card = ({ title, value, colorClass }) => (
  <div className="bg-zinc-800 text-white rounded-2xl shadow-lg p-8 w-full sm:w-[300px] flex flex-col items-center justify-center transition-transform transform hover:scale-105 duration-200 ease-in-out">
    <h2 className="text-lg font-medium text-gray-300 mb-2 text-center">
      {title}
    </h2>
    <p className={`text-4xl font-bold ${colorClass} text-center`}>{value}</p>
  </div>
);

export default Home;
