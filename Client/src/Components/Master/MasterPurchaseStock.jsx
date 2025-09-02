import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Master from "./MasterNavbar";
import "./MasterPurchaseStock.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { Edit, Delete, Search } from "@mui/icons-material";

const MasterPurchaseStock = () => {
  const [showModal, setShowModal] = useState(false);
  const [purchaseList, setPurchaseList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    supplierName: "",
    purchaseDate: "",
    item: "",
    goldWeight: "",
    goldTouch: "",
    goldPurity: "",
    goldRate: "",
    goldTotalValue: "",
    silverWeight: "",
    silverTouch: "",
    silverPurity: "",
    silverRate: "",
    silvertotalValue: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch all purchases from backend
  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/purchase`);
      setPurchaseList(response.data);
    } catch (error) {
      toast.error("Failed to fetch purchases");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const resetForm = () => {
    setFormData({
      supplierName: "",
      purchaseDate: "",
      item: "",
      goldWeight: "",
      goldTouch: "",
      goldPurity: "",
      goldRate: "",
      goldTotalValue: "",
      silverWeight: "",
      silverTouch: "",
      silverPurity: "",
      silverRate: "",
      silvertotalValue: "",
    });
    setEditingIndex(null);
  };

  // Submit form handler - add or update purchase
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.supplierName,
      createdAt: formData.purchaseDate,
      item: formData.item,
      goldWeight: formData.goldWeight ? parseFloat(formData.goldWeight) : null,
      goldTouch: formData.goldTouch ? parseFloat(formData.goldTouch) : null,
      goldPurity: formData.goldPurity ? parseFloat(formData.goldPurity) : null,
      goldRate: formData.goldRate ? parseFloat(formData.goldRate) : null,
      goldtotalValue: formData.goldTotalValue ? parseFloat(formData.goldTotalValue) : null,
      silverWeight: formData.silverWeight ? parseFloat(formData.silverWeight) : null,
      silverTouch: formData.silverTouch ? parseFloat(formData.silverTouch) : null,
      silverPurity: formData.silverPurity ? parseFloat(formData.silverPurity) : null,
      silverRate: formData.silverRate ? parseFloat(formData.silverRate) : null,
      silvertotalValue: formData.silvertotalValue ? parseFloat(formData.silvertotalValue) : null,
    };

    try {
      if (editingIndex !== null) {
        // Update existing purchase
        const id = purchaseList[editingIndex].id;
        const response = await axios.put(`${BACKEND_SERVER_URL}/api/purchase/${id}`, payload);
        const updatedList = [...purchaseList];
        updatedList[editingIndex] = response.data;
        setPurchaseList(updatedList);
        toast.success("Purchase updated successfully!");
      } else {
        // Create new purchase
    
        const response = await axios.post(`${BACKEND_SERVER_URL}/api/purchase`, payload);
console.log("Response data:", response.data);
setPurchaseList((prev) => [...prev, response.data]);
toast.success("Purchase submitted successfully!");

      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (index) => {
    const item = purchaseList[index];
    setFormData({
      supplierName: item.name,
      purchaseDate: item.createdAt,
      item: item.item,
      goldWeight: item.goldWeight || "",
      goldTouch: item.goldTouch || "",
      goldPurity: item.goldPurity || "",
      goldRate: item.goldRate || "",
      goldTotalValue: item.goldtotalValue || "",
      silverWeight: item.silverWeight || "",
      silverTouch: item.silverTouch || "",
      silverPurity: item.silverPurity || "",
      silverRate: item.silverRate || "",
      silvertotalValue: item.silvertotalValue || "",
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  // Delete purchase handler
  const handleDelete = async (index) => {
    const itemToDelete = purchaseList[index];
    const confirmed = window.confirm(`Are you sure you want to delete "${itemToDelete.name}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/purchase/${itemToDelete.id}`);
      const filteredList = purchaseList.filter((_, i) => i !== index);
      setPurchaseList(filteredList);
      toast.error("Purchase deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete purchase");
    }
  };

  return (
    <>
      <Master />
      <div className="stock-page">
        <ToastContainer />

        <button
          className="open-modal-btn"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
        >
          Add Stock Purchase
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editingIndex !== null ? "Edit Purchase" : "Add Stock Purchase"}</h3>
              <form onSubmit={handleSubmit} className="purchase-form">
                <div className="right-column">
                  <div className="form-group">
                    <label>Supplier Name:</label>
                    <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Purchase Date:</label>
                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Item:</label>
                    <select name="item" value={formData.item} onChange={handleChange} required>
                      <option value="">Select Item</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>
                </div>

                <div className="form-content">
                  <div className="left-column">
                    {formData.item === "Gold" && (
                      <>
                        <div className="form-group">
                          <label>Gold Weight:</label>
                          <input type="number" name="goldWeight" value={formData.goldWeight} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Touch:</label>
                          <input type="number" name="goldTouch" value={formData.goldTouch} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Purity:</label>
                          <input type="number" name="goldPurity" value={formData.goldPurity} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Gold Rate:</label>
                          <input type="number" name="goldRate" value={formData.goldRate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Total Value:</label>
                          <input type="number" name="goldTotalValue" value={formData.goldTotalValue} onChange={handleChange} />
                        </div>
                      </>
                    )}

                    {formData.item === "Silver" && (
                      <>
                        <div className="form-group">
                          <label>Silver Weight:</label>
                          <input type="number" name="silverWeight" value={formData.silverWeight} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Touch:</label>
                          <input type="number" name="silverTouch" value={formData.silverTouch} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Purity:</label>
                          <input type="number" name="silverPurity" value={formData.silverPurity} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Silver Rate:</label>
                          <input type="number" name="silverRate" value={formData.silverRate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Total Value:</label>
                          <input type="number" name="silvertotalValue" value={formData.silvertotalValue} onChange={handleChange} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit">
                    {editingIndex !== null ? "Update Purchase" : "Submit Purchase"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {purchaseList.length > 0 && (
          <div className="item-listt"> 
          <table >
            <thead>
              <tr>
                <th>S.No</th>
                <th>Supplier Name</th>
                <th>Purchase Date</th>
                <th>Item</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseList.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.createdAt}</td>
                  <td>{item.item}</td>
<td style={{width:"7rem"}}>
            <b onClick={() => handleEdit(index)} style={{ marginRight: "8px" }}>
           <Edit />
            </b>
            <b onClick={() => handleDelete(index)} style={{ color: "red", marginLeft:'0.5rem' }}>
                <Delete />
            </b>
</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
};

export default MasterPurchaseStock;
