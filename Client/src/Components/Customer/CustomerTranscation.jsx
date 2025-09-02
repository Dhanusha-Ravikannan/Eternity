
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerTranscation.css";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";

const CustomerTranscation = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");
  const customerName = searchParams.get("name");
  console.log("customerId:", customerId, "customerName:", customerName);


  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    value: "",
    type: "Select",
    cashValue: "",
    goldValue: "",
    touch: "",
    purity: "",
    goldRate: ""
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (customerId) {
          const response = await axios.get(
            `${BACKEND_SERVER_URL}/api/transactions/${customerId}`
          );
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
      }
    };

    fetchTransactions();
  }, [customerId]);

const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedTransaction = { ...newTransaction, [name]: value };
  
    if (name === "cashValue" && updatedTransaction.type === "Cash") {
      updatedTransaction.value = value;
      const cashValue = parseFloat(value);
      const goldRate = parseFloat(updatedTransaction.goldRate);
      if (!isNaN(cashValue) && !isNaN(goldRate) && goldRate !== 0) {
        updatedTransaction.purity = (cashValue / goldRate).toFixed(3);
      } else {
        updatedTransaction.purity = "";
      }
    } else if (name === "goldRate" && updatedTransaction.type === "Cash") {
      const cashValue = parseFloat(updatedTransaction.cashValue);
      const goldRate = parseFloat(value);
      if (!isNaN(cashValue) && !isNaN(goldRate) && goldRate !== 0) {
        updatedTransaction.purity = (cashValue / goldRate).toFixed(3);
      } else {
        updatedTransaction.purity = "";
      }
    } else if (name === "goldValue" && updatedTransaction.type === "Gold") {
      updatedTransaction.value = value;
      const touch = parseFloat(updatedTransaction.touch);
      const gold = parseFloat(value);
      if (!isNaN(gold) && !isNaN(touch)) {
        updatedTransaction.purity = ((gold * touch) / 100).toFixed(3);
      } else {
        updatedTransaction.purity = "";
      }
    } else if (name === "touch" && updatedTransaction.type === "Gold") {
      const gold = parseFloat(updatedTransaction.goldValue);
      const touch = parseFloat(value);
      if (!isNaN(gold) && !isNaN(touch)) {
        updatedTransaction.purity = ((gold * touch) / 100).toFixed(3);
      } else {
        updatedTransaction.purity = "";
      }
    } else if (name === "type") {
      updatedTransaction.value = "";
      updatedTransaction.cashValue = "";
      updatedTransaction.goldValue = "";
      updatedTransaction.touch = "";
      updatedTransaction.purity = "";
      updatedTransaction.goldRate = "";
    }
  
    setNewTransaction(updatedTransaction);
  };

  
  const addTransaction = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!newTransaction.date || newTransaction.type === "Select") {
        throw new Error("Date and transaction type are required");
      }

      if (!customerId) {
        throw new Error("Customer ID is missing");
      }

      let transactionData = {
        date: newTransaction.date,
        type: newTransaction.type,
        customerId: parseInt(customerId),
      };

      if (newTransaction.type === "Cash") {
        if (!newTransaction.cashValue) {
          throw new Error("Cash value and Gold Rate are required");
        }
        transactionData.value = parseFloat(newTransaction.cashValue);
        transactionData.goldRate = parseFloat(newTransaction.goldRate);
        transactionData.purity = parseFloat(newTransaction.purity);
      } else if (newTransaction.type === "Gold") {
        if (!newTransaction.goldValue || !newTransaction.touch) {
          throw new Error("Gold value and touch are required");
        }
        transactionData.value = parseFloat(newTransaction.goldValue);
        transactionData.touch = parseFloat(newTransaction.touch);
        transactionData.purity = parseFloat(newTransaction.purity);
      }

      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/transactions`,
        transactionData
      );

      setTransactions([...transactions, response.data]);
      resetForm();
      setShowPopup(false);
      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(error.message || "Error adding transaction");
    }
  };

  const resetForm = () => {
    setNewTransaction({
      date: "",
      value: "",
      type: "Select",
      cashValue: "",
      goldValue: "",
      touch: "",
      purity: "",
      goldRate: "",
    });
    setError("");
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return (!from || transactionDate >= from) && (!to || transactionDate <= to);
  });
  

 
  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "Cash") {
        acc.totalCash += parseFloat(transaction.value) || 0;
      } else if (transaction.type === "Gold") {
        acc.totalPurity += parseFloat(transaction.purity) || 0;
      }
      return acc;
    },
    { totalCash: 0, totalPurity: 0 }
  );

  return (
    <div className="customer-transactions">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>
        Customer Transactions{" "}
        {customerName && `for ${decodeURIComponent(customerName)}`}
      </h2>
      <br />
      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
      </div>

      <button onClick={() => setShowPopup(true)} className="add-btn">
        Add Transaction
      </button>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span
              className="popup-close"
              onClick={() => {
                resetForm();
                setShowPopup(false);
              }}
            >
              ×
            </span>

            <h3>Add Transaction</h3>
            <form onSubmit={addTransaction}>
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Type:
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Select">Select</option>
                  <option value="Cash">Cash</option>
                  <option value="Gold">Gold</option>
                </select>
              </label>


{newTransaction.type === "Cash" && (
                <>
                  <label>
                    Cash Value:
                    <input
                      type="number"
                      name="cashValue"
                      value={newTransaction.cashValue}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    Gold Rate:
                    <input
                      type="number"
                      name="goldRate"
                      value={newTransaction.goldRate}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    Purity:
                    <input
                      type="number"
                      name="purity"
                      value={newTransaction.purity}
                      readOnly
                    />
                  </label>
                </>
              )}


              {newTransaction.type === "Gold" && (
                <>
                  <label>
                    Gold Value (grams):
                    <input
                      type="number"
                      name="goldValue"
                      value={newTransaction.goldValue}
                      onChange={handleChange}
                      step="0.001"
                      required
                    />
                  </label>
                  <label>
                    Touch (%):
                    <input
                      type="number"
                      name="touch"
                      value={newTransaction.touch}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </label>
                  <label>
                    Purity:
                    <input
                      type="number"
                      name="purity"
                      value={newTransaction.purity}
                      readOnly
                    />
                  </label>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    resetForm();
                    setShowPopup(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Value</th>
            <th>Type</th>
            <th>Touch</th>
            <th>Purity</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <tr
                key={index}
                className={
                  transaction.type === "Gold" ? "gold-row" : "cash-row"
                }
              >
                <td>
                  {new Date(transaction.date).toLocaleDateString("en-IN")}
                </td>
                <td>
                  {transaction.type === "Gold"
                    ? `${transaction.value} g`
                    : `₹ ${transaction.value.toFixed(2)}`}
                </td>
                <td>{transaction.type}</td>
                <td>{transaction.touch || "-"}</td>
                <td>{transaction.purity || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(totals.totalCash > 0 || totals.totalPurity > 0) && (
        <div className="transaction-totals">
          <h3>Transaction Totals</h3>
          <div className="total-row">
            <span>Total Cash:</span>
            <span>₹ {totals.totalCash.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Total Purity:</span>
            <span>{totals.totalPurity.toFixed(3)} g</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTranscation;