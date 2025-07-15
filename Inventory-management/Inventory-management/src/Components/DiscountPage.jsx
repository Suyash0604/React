import React, { useEffect, useState } from "react";
import axios from "axios";

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    product: "",
    outlet: "",
    discount_type: "percentage",
    amount: "",
    start_date: "",
    end_date: "",
  });

  const token = localStorage.getItem("token");

  const fetchInitialData = async () => {
    try {
      const [productsRes, usersRes, discountsRes] = await Promise.all([
        axios.get("http://192.168.1.26:8000/api/inventory/", {
          headers: { Authorization: `Token ${token}` },
        }),
        axios.get("http://192.168.1.26:8000/api/users/", {
          headers: { Authorization: `Token ${token}` },
        }),
        axios.get("http://192.168.1.26:8000/api/discounts/", {
          headers: { Authorization: `Token ${token}` },
        }),
      ]);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
      setDiscounts(discountsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.26:8000/api/discounts/", form, {
        headers: { Authorization: `Token ${token}` },
      });
      setForm({
        product: "",
        outlet: "",
        discount_type: "percentage",
        amount: "",
        start_date: "",
        end_date: "",
      });
      fetchInitialData();
    } catch (err) {
      console.error("Error creating discount:", err);
    }
  };

  return (
    <div className="text-white px-4 sm:px-[10%] py-10">
      <h2 className="text-2xl font-bold mb-6">Discount Management</h2>

      <form onSubmit={handleSubmit} className="bg-zinc-800 p-6 rounded-lg mb-10 flex flex-wrap gap-4">
        <select
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          required
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <select
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          value={form.outlet}
          onChange={(e) => setForm({ ...form, outlet: e.target.value })}
          required
        >
          <option value="">Select Outlet</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>

        <select
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          value={form.discount_type}
          onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
        >
          <option value="percentage">Percentage (%)</option>
          <option value="value">Flat Value (₹)</option>
        </select>

        <input
          type="number"
          placeholder="Discount Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          required
        />

        <input
          type="date"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          required
        />
        <input
          type="date"
          value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          className="bg-zinc-900 text-white p-3 rounded w-[250px]"
          required
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
        >
          Add Discount
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4">Existing Discounts</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-zinc-700 text-left">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Outlet</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-zinc-700">
                <td className="p-3">{d.product_title}</td>
                <td className="p-3">{d.outlet_username}</td>
                <td className="p-3">{d.discount_type}</td>
                <td className="p-3">
                  {d.discount_type === "percentage" ? `${d.amount}%` : `₹${d.amount}`}
                </td>
                <td className="p-3">{d.start_date}</td>
                <td className="p-3">{d.end_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscountPage;
