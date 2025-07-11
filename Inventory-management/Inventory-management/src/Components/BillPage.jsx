import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BillPage = () => {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch bill data on mount
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

  // Download PDF locally
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

  if (!bill) return <p style={{ color: "#fff", padding: "2rem" }}>Loading...</p>;

  const subtotal = bill.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const gstAmount = (subtotal * (bill.gst_percentage || 0)) / 100;
  const discountAmount = ((subtotal + gstAmount) * (bill.discount_percentage || 0)) / 100;
  const total = subtotal + gstAmount - discountAmount;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "2rem" }}>
      {/* Bill content */}
      <div id="bill" style={{ background: "#fff", color: "#000", padding: "2rem", borderRadius: "12px", maxWidth: "800px", margin: "auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Inventory System - Bill #{bill.id}</h1>
        <p>Date: {new Date(bill.timestamp).toLocaleString()}</p>
        <p>Buyer: {bill.buyer_name} | Contact: {bill.contact_number}</p>
        <p>Address: {bill.address}</p>

        <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc" }}>
              <th align="left">#</th>
              <th align="left">Item</th>
              <th align="left">Qty</th>
              <th align="left">Price</th>
              <th align="left">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td>{idx + 1}</td>
                <td>{item.title}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST ({bill.gst_percentage || 0}%): ₹{gstAmount.toFixed(2)}</p>
          <p>Discount ({bill.discount_percentage || 0}%): -₹{discountAmount.toFixed(2)}</p>
          <h3 style={{ marginTop: "0.5rem" }}>Total Payable: ₹{total.toFixed(2)}</h3>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={downloadPDF}
          style={{ backgroundColor: "#2563eb", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "8px", marginRight: "0.5rem" }}
        >
          Download PDF
        </button>
        <input
          type="email"
          placeholder="Enter email to send PDF"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px", marginRight: "0.5rem", width: "250px",color:"white", border:"1px solid white" }}
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
          }}
        >
          {sending ? "Sending..." : "Send PDF by Email"}
        </button>
        {message && <p style={{ color: message.startsWith("✅") ? "#16a34a" : "red", marginTop: "0.5rem" }}>{message}</p>}
      </div>
    </div>
  );
};

export default BillPage;
