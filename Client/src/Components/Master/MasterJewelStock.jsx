import React, { useState, useEffect } from "react";
import "./MasterJewelStock.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Master from "./MasterNavbar";
import { Button } from "@mui/material";

const MasterJewelStock = () => {
  const [formData, setFormData] = useState({
    jewelName: "",
    weight: "",
    stoneWeight: "",
    touch: "",
    finalWeight: "",
    purityValue: "",
  });

  const [entries, setEntries] = useState([]);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [totalPurity, setTotalPurity] = useState(0);

  useEffect(() => {
    const storedEntries = localStorage.getItem("jewelStockEntries");
    if (storedEntries) {
      const parsed = JSON.parse(storedEntries);
      setEntries(parsed);
      calculateTotalPurity(parsed);
    }
  }, []);

  const calculateTotalPurity = (entries) => {
    const total = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.purityValue || 0),
      0
    );
    setTotalPurity(total.toFixed(3));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    const weight = parseFloat(updatedData.weight) || 0;
    const stoneWeight = parseFloat(updatedData.stoneWeight) || 0;
    const finalWeight = weight - stoneWeight;
    updatedData.finalWeight = finalWeight.toFixed(3);

    const touch = parseFloat(updatedData.touch);
    updatedData.purityValue =
      finalWeight && touch ? ((finalWeight * touch) / 100).toFixed(3) : "";

    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      id: Date.now(), // unique id
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    localStorage.setItem("jewelStockEntries", JSON.stringify(updatedEntries));
    calculateTotalPurity(updatedEntries);
    resetForm();
    setShowFormPopup(false);
    toast.success("Stock added successfully!");
  };

  const resetForm = () => {
    setFormData({
      jewelName: "",
      weight: "",
      stoneWeight: "",
      touch: "",
      finalWeight: "",
      purityValue: "",
    });
  };

  return (
    <> 
    <Master/>
    <div className="master-jewel-stock">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Jewel Stock</h2>
    
      <Button
         
            sx={{
              m: 2,
              marginLeft: 0,
              backgroundColor: "#5f4917",
              color: "white",
              paddingLeft:2,
              paddingRight:2
            }}
            onClick={() => setShowFormPopup(true)}
          >
            Add Jewel Stock
          </Button>

      {showFormPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Enter Jewel Stock Details</h3>
            <button
              className="close-btn"
              onClick={() => setShowFormPopup(false)}
            >
              ×
            </button> 
            <hr/>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Jewel Name:</label>
         
                <input
                  type="text"
                  name="jewelName"
                  value={formData.jewelName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Weight (grams):</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stone Weight (grams):</label>
                <input
                  type="number"
                  name="stoneWeight"
                  value={formData.stoneWeight}
                  onChange={handleChange}
                  step="any"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Final Weight (grams):</label>
                <input
                  type="number"
                  name="finalWeight"
                  value={formData.finalWeight}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="form-group">
                <label>Touch (%):</label>
                <input
                  type="number"
                  name="touch"
                  value={formData.touch}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Purity Value (grams):</label>
                <input
                  type="number"
                  name="purityValue"
                  value={formData.purityValue}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="submit-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <div className="entries-section">
        <h3>Jewel Stock Entries</h3>
        {entries.length === 0 ? (
          <p>No entries yet. Please add some jewel stock entries.</p>
        ) : (
          <>
            <table className="entries-table">
              <thead>
                <tr>
                  <th>SI. No.</th>
                  <th>Jewel Name</th>
                  <th>Weight (g)</th>
                  <th>Stone Wt. (g)</th>
                  <th>Final Wt. (g)</th>
                  <th>Touch (%)</th>
                  <th>Purity (g)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{entry.jewelName}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.stoneWeight}</td>
                    <td>{entry.finalWeight}</td>
                    <td>{entry.touch}</td>
                    <td>{entry.purityValue}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total Purity:
                  </td>
                  <td style={{ fontWeight: "bold" }}>{totalPurity}</td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </div>

    </>
  );
};

export default MasterJewelStock;
