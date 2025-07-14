import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

const BillPage = () => {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch bill data
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/bill/${billId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setBill(res.data);
      } catch (err) {
        console.error("Error fetching bill:", err);
        setMessage("❌ Failed to load bill.");
      }
    };
    fetchBill();
  }, [billId]);

  const subtotal = bill?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const gstAmount = (subtotal * (bill?.gst_percentage || 0)) / 100;
  const discountAmount = ((subtotal + gstAmount) * (bill?.discount_percentage || 0)) / 100;
  const total = subtotal + gstAmount - discountAmount;

  // Download PDF
  const downloadPDF = async () => {
    try {
      const input = document.getElementById("bill");
      const canvas = await html2canvas(input, { useCORS: true, backgroundColor: "#fff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${billId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setMessage("❌ Failed to generate PDF.");
    }
  };

  // Send PDF by email
  const sendEmail = async () => {
    if (!email.trim()) {
      setMessage("❌ Please enter an email address.");
      return;
    }
    setSending(true);
    setMessage("");
    try {
      const input = document.getElementById("bill");
      const canvas = await html2canvas(input, { useCORS: true, backgroundColor: "#fff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("email", email);
      formData.append("bill_id", billId);
      formData.append("pdf", pdfBlob, `Bill-${billId}.pdf`);

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/api/send_bill_email/", formData, {
        headers: { Authorization: `Token ${token}` },
      });

      setMessage("✅ Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
      setMessage("❌ Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  if (!bill) {
    return <p style={{ color: "#fff", padding: "2rem" }}>Loading...</p>;
  }

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh", padding: "2rem" }}>
      <div
        id="bill"
        style={{
          background: "#fff",
          color: "#1f2937",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "800px",
          margin: "auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0, color: "#2563eb" }}>Inventory System</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>www.Inventory.com</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Invoice</h2>
            <p style={{ margin: 0 }}>Bill #{bill.id}</p>
            <p style={{ margin: 0 }}>{new Date(bill.timestamp).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Buyer Info */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p><strong>Buyer:</strong> {bill.buyer_name}</p>
          <p><strong>Contact:</strong> {bill.contact_number}</p>
          <p><strong>Address:</strong> {bill.address}</p>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#2563eb", color: "#fff" }}>
              <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>#</th>
              <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Item</th>
              <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ddd" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ddd" }}>Price (₹)</th>
              <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ddd" }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{idx + 1}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.title}</td>
                <td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>{item.quantity}</td>
                <td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>{item.price.toFixed(2)}</td>
                <td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: "1.5rem", textAlign: "right", fontSize: "1rem" }}>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST ({bill.gst_percentage || 0}%): ₹{gstAmount.toFixed(2)}</p>
          <p>Discount ({bill.discount_percentage || 0}%): -₹{discountAmount.toFixed(2)}</p>
          <h3 style={{ marginTop: "0.5rem", color: "#2563eb" }}>Total Payable: ₹{total.toFixed(2)}</h3>
        </div>

        {/* QR code */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <QRCodeCanvas
            value={`Bill #${bill.id} | Total ₹${total.toFixed(2)} | Date: ${new Date(bill.timestamp).toLocaleDateString()}`}
            size={120}
            bgColor="#ffffff"
            fgColor="#2563eb"
            level="H"
          />
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
            Scan to view bill summary
          </p>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#6b7280", textAlign: "center" }}>
          <p>Thank you for your purchase!</p>
          <p>This is a system-generated invoice and does not require a signature.</p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={downloadPDF}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            marginRight: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Download PDF
        </button>
        <input
          type="email"
          placeholder="Enter email to send PDF"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            marginRight: "0.5rem",
            width: "250px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            color: "black",
          }}
        />
        <button
          onClick={sendEmail}
          disabled={sending}
          style={{
            backgroundColor: sending ? "#94a3b8" : "#16a34a",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: sending ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {sending ? "Sending..." : "Send PDF by Email"}
        </button>
        {message && (
          <p style={{ color: message.startsWith("✅") ? "#16a34a" : "red", marginTop: "0.5rem" }}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default BillPage;
