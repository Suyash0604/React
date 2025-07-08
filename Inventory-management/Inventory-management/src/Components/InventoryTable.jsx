import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useInventory } from "../context/InventoryContext";
import axios from "axios";

const InventoryTable = () => {
  const { inventory } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [startDateInventory, setStartDateInventory] = useState("");
  const [endDateInventory, setEndDateInventory] = useState("");

  const [buyerFilter, setBuyerFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [startDateSales, setStartDateSales] = useState("");
  const [endDateSales, setEndDateSales] = useState("");

  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  // Inventory Filter Logic
  const filteredInventory = inventory.filter((item) => {
    const matchesTitle = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSupplier = item.supplier
      ?.toLowerCase()
      .includes(supplierFilter.toLowerCase());
    const matchesOwner =
      ownerFilter === "" ||
      (item.owner_username || "")
        .toLowerCase()
        .includes(ownerFilter.toLowerCase());
    const matchesDate =
      (!startDateInventory ||
        new Date(item.Date) >= new Date(startDateInventory)) &&
      (!endDateInventory || new Date(item.Date) <= new Date(endDateInventory));
    return matchesTitle && matchesSupplier && matchesOwner && matchesDate;
  });

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalInventoryPages = Math.ceil(
    filteredInventory.length / itemsPerPage
  );

  // ✅ Sales Filter Logic (updated to include ownerFilter)
  const filteredSales = sales.filter((sale) => {
    const matchesBuyer = sale.buyer_name
      ?.toLowerCase()
      .includes(buyerFilter.toLowerCase());
    const matchesProduct = sale.product
      ?.toLowerCase()
      .includes(productFilter.toLowerCase());
    const matchesDate =
      (!startDateSales || new Date(sale.timestamp) >= new Date(startDateSales)) &&
      (!endDateSales || new Date(sale.timestamp) <= new Date(endDateSales));
    const matchesOwner =
      ownerFilter === "" ||
      (sale.user || "").toLowerCase().includes(ownerFilter.toLowerCase()); // ✅ check sale.user (username)
    return matchesBuyer && matchesProduct && matchesDate && matchesOwner;
  });

  const paginatedSales = filteredSales.slice(
    (currentSalesPage - 1) * itemsPerPage,
    currentSalesPage * itemsPerPage
  );

  const totalSalesPages = Math.ceil(filteredSales.length / itemsPerPage);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/sales/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setSales(res.data))
      .catch((err) => console.error("Error fetching sales:", err));
  }, [token]);

  const inventoryHeaders = [
    { label: "Product Name", key: "title" },
    { label: "SKU", key: "SKU" },
    { label: "Quantity", key: "Quantity" },
    { label: "Price", key: "price" },
    { label: "Supplier", key: "supplier" },
    { label: "Date", key: "Date" },
    { label: "Outlet/User", key: "owner_username" },
  ];

  const salesHeaders = [
    { label: "Product", key: "product" },
    { label: "Quantity", key: "quantity" },
    { label: "Buyer Name", key: "buyer_name" },
    { label: "Contact Number", key: "contact_number" },
    { label: "Address", key: "address" },
    { label: "Date", key: "timestamp" },
    { label: "Total Price", key: "total_price" },
  ];

  const clearInventoryFilters = () => {
    setSearchTerm("");
    setSupplierFilter("");
    setOwnerFilter("");
    setStartDateInventory("");
    setEndDateInventory("");
  };

  return (
    <div className="text-white px-4 sm:px-[10%] py-10">
      {/* 🔍 Inventory Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by product title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          type="text"
          placeholder="Filter by supplier"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        >
          <option value="">All Outlets</option>
          {[...new Set(inventory.map((item) => item.owner_username))].filter(Boolean).map((owner) => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDateInventory}
          onChange={(e) => setStartDateInventory(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          type="date"
          value={endDateInventory}
          onChange={(e) => setEndDateInventory(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <CSVLink
          data={filteredInventory}
          headers={inventoryHeaders}
          filename="inventory-report.csv"
        >
          <button className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">
            Download Inventory CSV
          </button>
        </CSVLink>
        <button
          onClick={clearInventoryFilters}
          className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
        >
          Clear Filters
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-2">
        Showing results for outlet/user: <strong>{ownerFilter || "All Users"}</strong>
      </p>

      {/* 📦 Inventory Table */}
      <h2 className="text-xl font-bold mb-3">Inventory Report</h2>
      <table className="w-full border text-left border-collapse mb-6">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-3">Title</th>
            <th className="p-3">SKU</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Price</th>
            <th className="p-3">Supplier</th>
            <th className="p-3">Date</th>
            <th className="p-3">Outlet/User</th>
            <th className="p-3">Alert</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInventory.map((item) => (
            <tr key={item.id} className="border-b border-zinc-700">
              <td className="p-3">{item.title}</td>
              <td className="p-3">{item.SKU}</td>
              <td className="p-3">{item.Quantity}</td>
              <td className="p-3">₹{item.price}</td>
              <td className="p-3">{item.supplier_name}</td>
              <td className="p-3">{item.Date}</td>
              <td className="p-3">{item.owner_username || "N/A"}</td>
              <td className="p-3">
                {Number(item.Quantity) <= 5 ? (
                  <span className="text-red-400 font-semibold">Low Stock</span>
                ) : (
                  <span className="text-green-400">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⏪ Inventory Pagination */}
      <div className="flex justify-center gap-2 mb-10">
        {Array.from({ length: totalInventoryPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-indigo-600 text-white"
                : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* 🧾 Sales Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by product"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          type="text"
          placeholder="Filter by buyer name"
          value={buyerFilter}
          onChange={(e) => setBuyerFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          type="date"
          value={startDateSales}
          onChange={(e) => setStartDateSales(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          type="date"
          value={endDateSales}
          onChange={(e) => setEndDateSales(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <CSVLink
          data={filteredSales}
          headers={salesHeaders}
          filename="sales-report.csv"
        >
          <button className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">
            Download Sales CSV
          </button>
        </CSVLink>
      </div>

      <p className="text-sm text-gray-400 mb-2">
        Showing sales for outlet/user: <strong>{ownerFilter || "All Users"}</strong>
      </p>

      {/* 💰 Sales Table */}
      <table className="w-full border text-left border-collapse">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-3">Product</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Buyer</th>
            <th className="p-3">Contact</th>
            <th className="p-3">Address</th>
            <th className="p-3">Date</th>
            <th className="p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSales.map((sale, index) => (
            <tr key={index} className="border-b border-zinc-700">
              <td className="p-3">{sale.product}</td>
              <td className="p-3">{sale.quantity}</td>
              <td className="p-3">{sale.buyer_name || "N/A"}</td>
              <td className="p-3">{sale.contact_number || "N/A"}</td>
              <td className="p-3">{sale.address}</td>
              <td className="p-3">{new Date(sale.timestamp).toLocaleString()}</td>
              <td className="p-3">₹{sale.total_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⏪ Sales Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalSalesPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSalesPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentSalesPage === index + 1
                ? "bg-indigo-600 text-white"
                : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryTable;
