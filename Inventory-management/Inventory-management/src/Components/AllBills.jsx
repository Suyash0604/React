import React, { useEffect, useState } from "react";
import axios from "axios";

const AllBills = ({ user }) => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get("http://192.168.1.26:8000/api/all-bills/", {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        setBills(res.data);
      } catch (err) {
        console.error("Error fetching all bills", err);
      }
    };

    if (user?.role === "admin") fetchBills();
  }, [user]);

  return (
    <div className="text-white p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📜 All Bills</h2>
      {bills.length === 0 ? (
        <p className="text-gray-400">No bills found.</p>
      ) : (
        <div className="space-y-6">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-zinc-800 p-6 rounded-xl border border-zinc-700"
            >
              <div className="mb-3">
                <h3 className="text-xl font-semibold">Bill #{bill.id}</h3>
                <p>User: {bill.user}</p>
                <p>Organization: {bill.organization}</p>
                <p>Date: {new Date(bill.timestamp).toLocaleString()}</p>
                <p>Total: ₹{bill.total_amount.toFixed(2)}</p>
              </div>

              <div className="border-t border-zinc-600 pt-3 mt-3">
                <p className="font-semibold mb-2">Items:</p>
                {bill.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-300 mb-1">
                    {item.title} - {item.quantity} x ₹{item.price.toFixed(2)} = ₹
                    {item.total.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBills;
