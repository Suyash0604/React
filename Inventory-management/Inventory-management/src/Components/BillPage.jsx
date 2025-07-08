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
      backgroundColor: "#fff",
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

  if (!bill) return <p style={{ color: "#fff", padding: "2rem" }}>Loading...</p>;

  const subtotal = bill.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const gstAmount = (subtotal * (bill.gst_percentage || 0)) / 100;
  const discountAmount = ((subtotal + gstAmount) * (bill.discount_percentage || 0)) / 100;
  const total = subtotal + gstAmount - discountAmount;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "2rem" }}>
      <div
        id="bill"
        style={{
          maxWidth: "800px",
          margin: "auto",
          background: "#fff",
          color: "#000",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "2px solid #ccc", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>
            INVENTORY SYSTEM
          </h1>
          <p style={{ margin: "4px 0", color: "#555", fontWeight: "500" }}>GST Invoice</p>
          <p style={{ margin: "4px 0" }}><strong>Bill #:</strong> {bill.id}</p>
          <p style={{ margin: "4px 0" }}><strong>Date:</strong> {new Date(bill.timestamp).toLocaleString()}</p>
        </div>

        {/* Billing Info */}
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "6px" }}>Billed To</h3>
            <p style={{ margin: "4px 0" }}><strong>Name:</strong> {bill.buyer_name}</p>
            <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {bill.contact_number}</p>
            <p style={{ margin: "4px 0" }}><strong>Address:</strong> {bill.address}</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.95rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #ccc" }}>
              <th style={tableTh}>#</th>
              <th style={tableTh}>Item</th>
              <th style={tableTh}>Qty</th>
              <th style={tableTh}>Price</th>
              <th style={tableTh}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableTd}>{idx + 1}</td>
                <td style={tableTd}>{item.title}</td>
                <td style={tableTd}>{item.quantity}</td>
                <td style={tableTd}>₹{item.price.toFixed(2)}</td>
                <td style={tableTd}>₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: "2rem", textAlign: "right", fontSize: "1rem" }}>
          <p><strong>Normal Total (Subtotal):</strong> ₹{subtotal.toFixed(2)}</p>
          <p><strong>+ GST ({bill.gst_percentage || 0}%):</strong> ₹{gstAmount.toFixed(2)}</p>
          <p><strong>- Discount ({bill.discount_percentage || 0}%):</strong> ₹{discountAmount.toFixed(2)}</p>
          <p style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "1rem", color: "#1d4ed8" }}>
            Final Payable: ₹{total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Download Button */}
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
            transition: "0.3s",
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

const tableTh = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  fontWeight: "600",
};

const tableTd = {
  padding: "10px",
  textAlign: "left",
  color: "#333",
};

export default BillPage;
