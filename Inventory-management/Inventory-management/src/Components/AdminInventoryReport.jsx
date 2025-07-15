import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

const AdminInventoryReport = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [inventory, setInventory] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch all users (outlets)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://192.168.1.26:8000/api/users/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch inventory filtered by selected user
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        let url = "http://192.168.1.26:8000/api/inventory/";
        if (selectedUser) {
          url += `?owner=${selectedUser}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Token ${token}` },
        });
        setInventory(res.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, [selectedUser, token]);

  const headers = [
    { label: "Product Name", key: "title" },
    { label: "SKU", key: "SKU" },
    { label: "Quantity", key: "Quantity" },
    { label: "Price", key: "price" },
    { label: "Supplier", key: "supplier" },
    { label: "Date", key: "Date" },
  ];

  return (
    <div className="text-white px-4 sm:px-[10%] py-10">
      <h2 className="text-2xl font-bold mb-6">Admin Inventory Report</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="p-2 bg-zinc-800 border border-zinc-700 text-white rounded"
        >
          <option value="">All Outlets</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <CSVLink
          data={inventory}
          headers={headers}
          filename={`inventory_${selectedUser || "all"}.csv`}
        >
          <button className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">
            Download CSV
          </button>
        </CSVLink>
      </div>

      <table className="w-full border-collapse border text-left">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-3">Title</th>
            <th className="p-3">SKU</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Price</th>
            <th className="p-3">Supplier</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="border-b border-zinc-700">
              <td className="p-3">{item.title}</td>
              <td className="p-3">{item.SKU}</td>
              <td className="p-3">{item.Quantity}</td>
              <td className="p-3">₹{item.price}</td>
              <td className="p-3">{item.supplier}</td>
              <td className="p-3">{item.Date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInventoryReport;
