import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewSuppliers = ({ user }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/products");
    } else {
      fetchSuppliers();
    }
  }, [user]);

 const fetchSuppliers = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token before request:", token); // Check token

    const res = await axios.get("http://localhost:8000/api/suppliers/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    console.log("Fetched suppliers:", res.data);
    setSuppliers(res.data);
  } catch (error) {
    console.error("Error fetching suppliers:", error.response || error);
  }
};



  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/suppliers/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setEditForm({ ...supplier });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/api/suppliers/${editingId}/`, editForm, {
        headers: { Authorization: `Token ${token}` },
      });
      setEditingId(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="min-h-screen text-white bg-black p-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">
        Supplier Details
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-zinc-700">
          <thead>
            <tr className="bg-zinc-700 text-white">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Contact</th>
              <th className="p-3 border">GST No.</th>
              <th className="p-3 border">Created</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="text-center">
                <td className="p-3 border">
                  {editingId === s.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="bg-zinc-900 p-1 rounded"
                    />
                  ) : (
                    s.name
                  )}
                </td>
                <td className="p-3 border">
                  {editingId === s.id ? (
                    <input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="bg-zinc-900 p-1 rounded"
                    />
                  ) : (
                    s.email
                  )}
                </td>
                <td className="p-3 border">{s.contact}</td>
                <td className="p-3 border">{s.gst_number}</td>
                <td className="p-3 border">
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td className="p-3 border">
                  {editingId === s.id ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 px-2 py-1 rounded text-white mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 px-2 py-1 rounded text-white"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-500 px-2 py-1 rounded text-white mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-600 px-2 py-1 rounded text-white"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewSuppliers;
