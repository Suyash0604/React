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
  const [organization, setOrganization] = useState("");
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

    if (organization) {
      filtered = filtered.filter((bill) =>
        bill.organization.toLowerCase().includes(organization.toLowerCase())
      );
    }

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
  }, [organization, minAmount, fromDate, toDate, bills]);

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">📜 My Bills</h2>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4 bg-zinc-900 p-4 rounded-xl mb-6">
        <input
          type="text"
          placeholder="Search by organization"
          className="p-2 rounded bg-zinc-800 text-white"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min amount (₹)"
          className="p-2 rounded bg-zinc-800 text-white"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded bg-zinc-800 text-white"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded bg-zinc-800 text-white"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
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
