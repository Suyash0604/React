// InventoryTable.jsx
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import { useInventory } from "../context/InventoryContext";

const InventoryTable = () => {
  const { inventory } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredInventory = inventory.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const headers = [
    { label: "Product Name", key: "title" },
    { label: "SKU", key: "SKU" },
    { label: "Quantity", key: "Quantity" },
    { label: "Price", key: "Price" },
    { label: "Supplier", key: "supplier" },
    { label: "Date", key: "Date" },
  ];

  return (  
    <div className="text-white px-4 sm:px-[10%] py-10"> 
      <div className="flex justify-between items-center mb-4 flex -wrap gap-3">
        <input
          type="text"
          placeholder="Search by product title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <CSVLink
          data={inventory}
          headers={headers}
          filename="inventory-report.csv"
        >
          <button className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">
            Download CSV
          </button>
        </CSVLink>
      </div>

      <table className="w-full border-1  text-left border-collapse">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-3">Title</th>
            <th className="p-3">SKU</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Price</th>
            <th className="p-3">Supplier</th>
            <th className="p-3">Date</th>
            <th className="p-3">Alert</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInventory.map((item) => (
            <tr key={item.id} className="border-b border-zinc-700">
              <td className="p-3">{item.title}</td>
              <td className="p-3">{item.SKU}</td>
              <td className="p-3">{item.Quantity}</td>
              <td className="p-3">₹{item.Price}</td>
              <td className="p-3">{item.supplier}</td>
              <td className="p-3">{item.Date}</td>
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

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
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
    </div>
  );
};

export default InventoryTable;
