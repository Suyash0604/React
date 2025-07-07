import React, { useEffect, useState } from "react";
import axios from "axios";
import { useInventory } from "../context/InventoryContext";
import inventoryImg from "../assets/Dashboard.png"; // ✅ Import image

const Home = ({ user }) => {
  const { inventory } = useInventory();

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((item) => Number(item.Quantity) <= 5).length;
  const totalStockValue = inventory.reduce(
    (acc, item) => acc + Number(item.Quantity) * Number(item.price),
    0
  );

  const [salesStats, setSalesStats] = useState(null);
  const [userPurchases, setUserPurchases] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (user?.role === "admin") {
          const res = await axios.get("http://localhost:8000/api/dashboard-stats/", {
            headers: { Authorization: `Token ${token}` },
          });
          setSalesStats(res.data);
        } else {
          const res = await axios.get("http://localhost:8000/api/my-bills/", {
            headers: { Authorization: `Token ${token}` },
          });
          setUserPurchases(res.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="flex flex-col gap-10 mt-10 px-4 sm:px-[10%] py-10 text-white">

      {/* ✅ First row with image and stats cards */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
        {/* 📦 Image on the left */}
        <div className="flex justify-center lg:justify-start">
          <img
            src={inventoryImg}
            alt="Inventory Management"
            className="w-full max-w-[400px] h-full cover object-contain rounded-2xl shadow-md"
          />
        </div>

        {/* 📊 Cards on the right */}
        <div className="flex flex-wrap justify-center gap-6">
          <Card title="Total Items" value={totalItems} colorClass="text-indigo-400" />
          <Card title="Low Stock Items" value={lowStockItems} colorClass="text-yellow-400" />
          <Card
            title="Total Stock Value"
            value={`₹${totalStockValue.toLocaleString()}`}
            colorClass="text-green-400"
          />
          {user?.role === "admin" && salesStats && (
            <>
              <Card title="Items Sold Today" value={salesStats.total_sold} colorClass="text-green-400" />
              <Card title="Top Product" value={salesStats.most_sold_product || "N/A"} colorClass="text-blue-400" />
            </>
          )}
          {user?.role === "user" && userPurchases && (
            <>
              <Card title="Bills Created" value={userPurchases.length} colorClass="text-green-400" />
              <Card
                title="Total Spent"
                value={`₹${userPurchases
                  .reduce((sum, b) => sum + b.total_amount, 0)
                  .toFixed(2)}`}
                colorClass="text-pink-400"
              />
            </>
          )}
        </div>
      </div>

      {/* ✅ Admin-only sections */}
      {user?.role === "admin" && salesStats && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <RecentPurchases salesStats={salesStats} setSalesStats={setSalesStats} />
          <div className="flex-1 w-full space-y-6">
            <SalesByDate stats={salesStats.sales_by_date} />
          </div>
          <SalesBreakdown stats={salesStats} />
        </div>
      )}

      {/* ✅ User-only bills */}
      {user?.role === "user" && userPurchases && (
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">📄 Recent Bills</h2>
          {userPurchases.length === 0 ? (
            <p className="text-gray-400">No purchases made yet.</p>
          ) : (
            <div className="space-y-4">
              {userPurchases.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 shadow"
                >
                  <p className="text-lg font-semibold">Bill #{bill.id}</p>
                  <p className="text-sm text-gray-300">Organization: {bill.organization}</p>
                  <p className="text-sm text-gray-300">Amount: ₹{bill.total_amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(bill.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Card Component
const Card = ({ title, value, colorClass }) => (
  <div className="bg-zinc-800 text-white rounded-2xl shadow-lg p-8 w-full sm:w-[300px] flex flex-col items-center justify-center transition-transform transform hover:scale-105 duration-200 ease-in-out">
    <h2 className="text-lg font-medium text-gray-300 mb-2 text-center">{title}</h2>
    <p className={`text-4xl font-bold ${colorClass} text-center`}>{value}</p>
  </div>
);

// ✅ Admin: Recent Purchases
const RecentPurchases = ({ salesStats, setSalesStats }) => (
  <div className="bg-zinc-900 w-full lg:w-[30%] rounded-2xl p-6 shadow-lg">
    <h2 className="text-2xl font-bold mb-6 text-white border-b border-zinc-700 pb-2">
      🧾 Recent Purchases
    </h2>
    {salesStats.recent_purchases.length === 0 ? (
      <p className="text-gray-400">No recent sales.</p>
    ) : (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {salesStats.recent_purchases.map((sale, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-800 rounded-xl shadow-sm border border-zinc-700"
          >
            <p className="font-semibold text-white">🛒 {sale.product__title}</p>
            <p className="text-sm text-yellow-300">Qty: {sale.quantity}</p>
            <p className="text-sm text-gray-300">🏢 {sale.organization}</p>
            <p className="text-sm text-gray-400">
              {new Date(sale.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
    <div className="text-center mt-6">
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
                sales_by_date: {},
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
  </div>
);

// ✅ Admin: Sales Breakdown
const SalesBreakdown = ({ stats }) => (
  <div className="bg-zinc-900 rounded-xl p-6 shadow-md w-fit">
    <h2 className="text-2xl font-semibold mb-4">📊 Sales Breakdown</h2>
    {stats.sales_breakdown.length === 0 ? (
      <p className="text-gray-400">No sales data available.</p>
    ) : (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {stats.sales_breakdown.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center gap-4 border-b border-zinc-700 pb-2"
          >
            <span className="truncate text-white max-w-[70%]">{item.product__title}</span>
            <span className="text-green-400 font-bold whitespace-nowrap">{item.total_sold}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ✅ Admin: Date-wise Sales Summary
const SalesByDate = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">📅 Date-wise Sales Details</h2>
        <p className="text-gray-400">No sales data available.</p>
      </div>
    );
  }

  const sortedDates = Object.keys(stats).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="bg-zinc-900  scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 rounded-xl p-6 shadow-md ">
      <h2 className="text-2xl font-semibold mb-4">📅 Date-wise Sales Details</h2>
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-lg font-bold text-yellow-300 mb-2">
              {new Date(date).toDateString()}
            </h3>
            {stats[date].map((entry, idx) => (
              <div
                key={idx}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-2 shadow-sm"
              >
                <p className="text-white font-semibold">🛒 {entry.product}</p>
                <p className="text-sm text-gray-300">👤 User: {entry.user}</p>
                <p className="text-sm text-gray-300">🏢 Org: {entry.organization}</p>
                <p className="text-sm text-gray-400">
                  🕒 {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-green-400">Qty: {entry.quantity}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
