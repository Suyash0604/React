// src/pages/MyBills.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states

  const [minAmount, setMinAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/my-bills/", {
          headers: { Authorization: `Token ${token}` },
        });
        setBills(res.data);
        setFilteredBills(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch bills");
        console.log(err);
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  useEffect(() => {
    let filtered = [...bills];

    

    if (minAmount) {
      filtered = filtered.filter(
        (bill) => parseFloat(bill.total_amount) >= parseFloat(minAmount)
      );
    }

    if (fromDate) {
      filtered = filtered.filter(
        (bill) => new Date(bill.timestamp) >= new Date(fromDate)
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (bill) => new Date(bill.timestamp) <= new Date(toDate)
      );
    }

    setFilteredBills(filtered);
  }, [minAmount, fromDate, toDate, bills]);

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">📜 My Bills</h2>

      {/* Filters */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-indigo-400">
            🔍 Filter Bills
          </h3>
          <button
            onClick={() => {
              setMinAmount("");
              setFromDate("");
              setToDate("");
            }}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Min Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g., 500"
              className="p-2 rounded bg-zinc-800 text-white"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              className="p-2 rounded bg-zinc-800 text-white"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              className="p-2 rounded bg-zinc-800 text-white"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error and Loading */}
      {loading && <p className="text-gray-400">Loading bills...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && filteredBills.length === 0 ? (
        <p className="text-gray-400">No bills match your filters.</p>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              className="bg-zinc-800 p-4 rounded-xl border border-zinc-600"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    Bill #{bill.id} - {bill.organization}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(bill.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">Address: {bill.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-300">
                    ₹{bill.total_amount.toFixed(2)}
                  </p>
                  <Link
                    to={`/bill/${bill.id}`}
                    className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm rounded text-white font-semibold"
                  >
                    View Bill
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBills;
