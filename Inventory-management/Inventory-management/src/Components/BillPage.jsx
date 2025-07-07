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
      backgroundColor: "black", // match bg-zinc-800
      scale: 2,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${billId}.pdf`);
    });
  };

  if (!bill) return <p style={{ color: "#fff" }}>Loading...</p>;

  const subtotal =
    bill.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const discountAmount = (subtotal * (bill.discount_percentage || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = (afterDiscount * (bill.gst_percentage || 0)) / 100;
  const total = afterDiscount + gstAmount;

  return (
    <div style={{ padding: "2rem", background: "black", minHeight: "100vh" }}>
      <div
        id="bill"
        style={{
          maxWidth: "750px",
          margin: "auto",
          background: "#1f2937",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          fontFamily: "Arial, sans-serif",
          color: "#f9fafb",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem", borderBottom: "1px solid #334155", paddingBottom: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#e2e8f0" }}>INVENTORY SYSTEM</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>GST Invoice</p>
          <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1" }}>
            <strong>Billed To:</strong> {bill.user_name}
          </p>
          <p style={{ margin: 0, color: "#cbd5e1" }}>
            <strong>Bill #:</strong> {bill.id}
          </p>
          <p style={{ margin: 0, color: "#cbd5e1" }}>
            <strong>Date:</strong> {new Date(bill.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Organization & Address */}
        <div style={{ marginBottom: "1rem", color: "#f1f5f9" }}>
          <p><strong>Organization:</strong> {bill.organization}</p>
          <p><strong>Address:</strong> {bill.address}</p>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#334155", color: "#e2e8f0" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #475569" }}>#</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #475569" }}>Item</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #475569" }}>Qty</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #475569" }}>Price</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #475569" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "10px", borderBottom: "1px solid #334155" }}>{idx + 1}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #334155" }}>{item.title}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #334155" }}>{item.quantity}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #334155" }}>₹{item.price.toFixed(2)}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #334155" }}>₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ marginTop: "2rem", textAlign: "right", color: "#e2e8f0" }}>
          <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
          <p><strong>Discount ({bill.discount_percentage || 0}%):</strong> -₹{discountAmount.toFixed(2)}</p>
          <p><strong>GST ({bill.gst_percentage || 0}%):</strong> ₹{gstAmount.toFixed(2)}</p>
          <p style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "1rem" }}>
            Final Payable: ₹{total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Button */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={downloadPDF}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            borderRadius: "8px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default BillPage;
