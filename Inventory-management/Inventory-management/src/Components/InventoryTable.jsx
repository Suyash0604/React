import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useInventory } from "../context/InventoryContext";
import axios from "axios";

const InventoryTable = () => {
  const { inventory } = useInventory();
  const [sales, setSales] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, discountsRes] = await Promise.all([
          axios.get("http://192.168.1.26:8000/api/sales/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://192.168.1.26:8000/api/discounts/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);
        setSales(salesRes.data);
        setDiscounts(discountsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token]);

  // ✅ Filter sales
const filteredSales = sales.filter((sale) => {
  const matchesProduct = sale.product?.toLowerCase().includes(productFilter.toLowerCase());
  const matchesOwner = ownerFilter === "" || (sale.user || "").toLowerCase().includes(ownerFilter.toLowerCase());
  const matchesDate =
    (!startDate || new Date(sale.timestamp) >= new Date(startDate)) &&
    (!endDate || new Date(sale.timestamp) <= new Date(endDate));
  return matchesProduct && matchesOwner && matchesDate;
});

// ✅ Sort by timestamp descending: recent sales first
filteredSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // ✅ Filter inventory by productFilter & ownerFilter
  const filteredInventory = inventory.filter((item) => {
    const matchesProduct = item.title.toLowerCase().includes(productFilter.toLowerCase());
    const matchesOwner = ownerFilter === "" || (item.owner_username || "").toLowerCase().includes(ownerFilter.toLowerCase());
    return matchesProduct && matchesOwner;
  });

  // Pagination
  const paginatedSales = filteredSales.slice(
    (currentSalesPage - 1) * itemsPerPage,
    currentSalesPage * itemsPerPage
  );
  const totalSalesPages = Math.ceil(filteredSales.length / itemsPerPage);

  // ✅ Build combined report using filteredInventory & filteredSales
  const combined = {};
  filteredInventory.forEach((item) => {
    const key = `${item.owner_username}-${item.title}`;
    combined[key] = {
      outlet: item.owner_username,
      product: item.title,
      stockQuantity: Number(item.Quantity),
      stockValue: Number(item.price) * Number(item.Quantity),
      totalQuantitySold: 0,
      totalSalesValue: 0,
      discountAmount: 0,
      discountType: "",
    };
  });

  filteredSales.forEach((sale) => {
    const key = `${sale.user}-${sale.product}`;
    if (!combined[key]) {
      combined[key] = {
        outlet: sale.user,
        product: sale.product,
        stockQuantity: 0,
        stockValue: 0,
        totalQuantitySold: 0,
        totalSalesValue: 0,
        discountAmount: 0,
        discountType: "",
      };
    }
    combined[key].totalQuantitySold += Number(sale.quantity);
    combined[key].totalSalesValue += Number(sale.total_price);
  });

  discounts.forEach((d) => {
    const key = `${d.outlet_username}-${d.product_title}`;
    if (combined[key]) {
      combined[key].discountAmount = d.amount;
      combined[key].discountType = d.discount_type;
    }
  });

  const combinedReport = Object.values(combined);

  // ✅ Add discount info into sales for CSV
  const salesWithDiscount = filteredSales.map((sale) => {
    const found = discounts.find(
      (d) => d.outlet_username === sale.user && d.product_title === sale.product
    );
    return {
      ...sale,
      discount: found
        ? found.discount_type === "percentage"
          ? `${found.amount}%`
          : `₹${found.amount}`
        : sale.discount
          ? `${sale.discount}%`
          : "0%",
    };
  });

  // CSV headers
  const combinedHeaders = [
    { label: "Outlet/User", key: "outlet" },
    { label: "Product", key: "product" },
    { label: "Stock Quantity", key: "stockQuantity" },
    { label: "Total Quantity Sold", key: "totalQuantitySold" },
    { label: "Total Stock Value", key: "stockValue" },
    { label: "Total Sales Value", key: "totalSalesValue" },
    { label: "Discount", key: "discountAmount" },
    { label: "Discount Type", key: "discountType" },
  ];

  const salesHeaders = [
    { label: "Outlet/User", key: "user" },
    { label: "Product", key: "product" },
    { label: "Quantity", key: "quantity" },
    { label: "Discount", key: "discount" },
    { label: "Total Price", key: "total_price" },
    { label: "Buyer Name", key: "buyer_name" },
    { label: "Contact Number", key: "contact_number" },
    { label: "Address", key: "address" },
    { label: "Date", key: "timestamp" },
  ];

  const clearFilters = () => {
    setOwnerFilter("");
    setProductFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="text-white px-4 sm:px-[5%] py-10 space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by product"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700"
        />
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700"
        >
          <option value="">All Outlets</option>
          {[...new Set([...inventory.map(i => i.owner_username), ...sales.map(s => s.user)])]
            .filter(Boolean)
            .map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700"
        />
        <CSVLink data={combinedReport} headers={combinedHeaders} filename="combined-report.csv">
          <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Download Combined CSV</button>
        </CSVLink>
        <CSVLink data={salesWithDiscount} headers={salesHeaders} filename="sales-transactions.csv">
          <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Download Sales CSV</button>
        </CSVLink>
        <button onClick={clearFilters} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Clear Filters</button>
      </div>

      {/* 📊 Combined Report Table */}
      <h2 className="text-xl font-bold mb-2">📊 Combined Outlet & Product Report</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border border-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th className="p-3">Outlet/User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Stock Qty</th>
              <th className="p-3">Qty Sold</th>
              <th className="p-3">Stock Value (₹)</th>
              <th className="p-3">Sales Value (₹)</th>
              <th className="p-3">Discount</th>
            </tr>
          </thead>
          <tbody>
            {combinedReport.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-zinc-800" : "bg-zinc-700"}>
                <td className="p-3">{item.outlet}</td>
                <td className="p-3">{item.product}</td>
                <td className="p-3">{item.stockQuantity}</td>
                <td className="p-3">{item.totalQuantitySold}</td>
                <td className="p-3">₹{item.stockValue.toFixed(2)}</td>
                <td className="p-3">₹{item.totalSalesValue.toFixed(2)}</td>
                <td className="p-3">
                  {item.discountType === "percentage" ? `${item.discountAmount}%` : `₹${item.discountAmount}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧾 Sales Transactions Table */}
      <h2 className="text-xl font-bold mb-2">🧾 Sales Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border border-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th className="p-3">Outlet/User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Total Price</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Address</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale, idx) => {
              const found = discounts.find(
                (d) => d.outlet_username === sale.user && d.product_title === sale.product
              );
              const discountValue = found
                ? found.discount_type === "percentage"
                  ? `${found.amount}%`
                  : `₹${found.amount}`
                : sale.discount
                  ? `${sale.discount}%`
                  : "0%";
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-zinc-800" : "bg-zinc-700"}>
                  <td className="p-3">{sale.user || "N/A"}</td>
                  <td className="p-3">{sale.product}</td>
                  <td className="p-3">{sale.quantity}</td>
                  <td className="p-3">{discountValue}</td>
                  <td className="p-3">₹{sale.total_price}</td>
                  <td className="p-3">{sale.buyer_name || "N/A"}</td>
                  <td className="p-3">{sale.contact_number || "N/A"}</td>
                  <td className="p-3">{sale.address || "N/A"}</td>
                  <td className="p-3">{new Date(sale.timestamp).toLocaleString()}</td>
                </tr>
              );
            })}
            {paginatedSales.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-400" colSpan="9">No sales found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalSalesPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSalesPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentSalesPage === i + 1 ? "bg-indigo-600 text-white" : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryTable;
