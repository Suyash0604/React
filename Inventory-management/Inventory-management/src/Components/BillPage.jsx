import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BillPage = () => {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:8000/api/bill/${billId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setBill(res.data);
    };
    fetchBill();
  }, [billId]);

  const downloadPDF = () => {
    const input = document.getElementById("bill");

    html2canvas(input, {
      useCORS: true,
      backgroundColor: "#1f2937", // fallback for bg-zinc-800
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10);
      pdf.save(`bill-${billId}.pdf`);
    });
  };

  if (!bill) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div style={{ padding: "1.5rem", color: "#ffffff" }}>
      <div
        id="bill"
        style={{
          backgroundColor: "#1f2937", // bg-zinc-800 fallback
          padding: "1.5rem",
          borderRadius: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Bill #{bill.id}</h2>
        <p>Organization: {bill.organization}</p>
        <p>Address: {bill.address}</p>
        <p>Date: {new Date(bill.timestamp).toLocaleString()}</p>

        <div style={{ marginTop: "1rem" }}>
          {bill.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #444",
                padding: "0.5rem 0",
              }}
            >
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>₹{item.total.toFixed(2)}</span>
            </div>
          ))}
          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
            Total Amount: ₹{bill.total_amount.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        style={{
          marginTop: "1rem",
          backgroundColor: "#2563EB", // bg-blue-600
          padding: "0.5rem 1rem",
          borderRadius: "0.375rem",
          color: "#fff",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#1D4ED8")} // hover:bg-blue-700
        onMouseOut={(e) => (e.target.style.backgroundColor = "#2563EB")}
      >
        Download PDF
      </button>
    </div>
  );
};

export default BillPage;
