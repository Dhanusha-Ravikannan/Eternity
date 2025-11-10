import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import { TextField, MenuItem, Button } from "@mui/material";
import styles from './CustomerTranscation.module.css'


const CustomerTranscation = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");
  const customerName = searchParams.get("name");
  const openingBalance = parseFloat(searchParams.get("balance")) || 0;
  console.log("customerId:", customerId, "customerName:", customerName, "Balance:", openingBalance);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [touchOptions, setTouchOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [newTransaction, setNewTransaction] = useState({
    date: getTodayDate(),
    value: "",
    type: "Select",
    cashValue: "",
    goldValue: "",
    touch: "",
    touchId: "", 
    purity: "",
    goldRate: "",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (customerId) {
          const response = await axios.get(
            `${BACKEND_SERVER_URL}/api/transactions/${customerId}`
          );
          console.log("transactions", response) 
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
      }
    };

    const fetchAllData = async () => {
      try {
        const [touchRes] = await Promise.all([
          axios.get(`${BACKEND_SERVER_URL}/api/addtouch`),
        ]);
        setTouchOptions(touchRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data", err);
      }
    };

    fetchAllData();
    fetchTransactions();
  }, [customerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    //  Prevent negative inputs for specific fields
    if (
      (name === "cashValue" || name === "goldRate") &&
      newTransaction.type === "Cash" &&
      parseFloat(value) < 0
    ) {
      toast.error("Negative values are not allowed for Cash transactions");
      return;
    }
  
    if (
      name === "goldValue" &&
      newTransaction.type === "Gold" &&
      parseFloat(value) < 0
    ) {
      toast.error("Negative values are not allowed for Gold transactions");
      return;
    }
  
    const updatedTransaction = { ...newTransaction, [name]: value };
  
    // 🔹 Cash type calculations
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
  
    // 🔹 Gold type calculations
    } else if (name === "goldValue" && updatedTransaction.type === "Gold") {
      updatedTransaction.value = value;
      const touch = parseFloat(updatedTransaction.touch);
      const gold = parseFloat(value);
      if (!isNaN(gold) && !isNaN(touch)) {
        updatedTransaction.purity = ((gold * touch) / 100).toFixed(3);
      } else {
        updatedTransaction.purity = "";
      }
  
    } else if (name === "touchId" && updatedTransaction.type === "Gold") {
      const selectedTouch = touchOptions.find(
        (option) => option.id === parseInt(value)
      );
      if (selectedTouch) {
        updatedTransaction.touchId = selectedTouch.id;
        updatedTransaction.touch = selectedTouch.touch;
        const gold = parseFloat(updatedTransaction.goldValue);
        const touch = parseFloat(selectedTouch.touch);
        if (!isNaN(gold) && !isNaN(touch)) {
          updatedTransaction.purity = ((gold * touch) / 100).toFixed(3);
        }
      }
  
    // 🔹 Reset values when type changes
    } else if (name === "type") {
      updatedTransaction.value = "";
      updatedTransaction.cashValue = "";
      updatedTransaction.goldValue = "";
      updatedTransaction.touch = "";
      updatedTransaction.touchId = "";
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
  
      if (!customerId) throw new Error("Customer ID is missing");
  
      let transactionData = {
        date: newTransaction.date,
        type: newTransaction.type,
        customerId: parseInt(customerId),
      };
  
      if (newTransaction.type === "Cash") {
        if (!newTransaction.cashValue || !newTransaction.goldRate)
          throw new Error("Cash value and Gold Rate are required");
  
        transactionData.value = parseFloat(newTransaction.cashValue);
        transactionData.goldRate = parseFloat(newTransaction.goldRate);
        transactionData.purity = parseFloat(newTransaction.purity);
      } else if (newTransaction.type === "Gold") {
        if (!newTransaction.goldValue || !newTransaction.touchId)
          throw new Error("Gold value and touch are required");
  
        transactionData.value = parseFloat(newTransaction.goldValue);
        transactionData.touchId = parseInt(newTransaction.touchId);
        transactionData.purity = parseFloat(newTransaction.purity);
      }
  
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/transactions`,
        transactionData
      );
  
      //  Update balance on frontend immediately
      // const newBalance = response.data.updatedBalance;
      // toast.success(`Transaction added! New Balance: ₹ ${newBalance.toFixed(2)}`);

      const newBalance = response.data.updatedBalance;

if (newBalance !== undefined && newBalance !== null) {
  toast.success(`Transaction added! New Balance: ₹ ${newBalance.toFixed(2)}`);
} else {
  toast.success("Transaction added successfully!");
}

  
      //  Refresh transactions
      // setTransactions([...transactions, response.data.transaction]);
   
      // const newTransactionRecord = {
      //   ...response.data.transaction,
      //   createdAt: new Date().toISOString(),
      // };
  
      // setTransactions((prev) => [newTransactionRecord, ...prev]);

      // Ensure purity and touch details are visible immediately
const newTransactionRecord = {
  ...response.data.transaction,
  createdAt: new Date().toISOString(),
  purity: newTransaction.purity,
  touch: newTransaction.type === "Gold"
    ? { id: newTransaction.touchId, touch: newTransaction.touch }
    : null,
  goldRate: newTransaction.goldRate || null,
  value: newTransaction.value || transactionData.value,
  type: newTransaction.type,
};

setTransactions((prev) => [newTransactionRecord, ...prev]);

      
      resetForm();
      setShowPopup(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(error.message || "Error adding transaction");
    }
  };
  
  const resetForm = () => {
    setNewTransaction({
      date: getTodayDate(),
      value: "",
      type: "Select",
      cashValue: "",
      goldValue: "",
      touch: "",
      touchId: "",
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


  console.log("filteredTransactions", filteredTransactions);

  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "Cash") {
        acc.totalCash += parseFloat(transaction.value) || 0;
      } else if (transaction.type === "Gold") {
        acc.totalPurity += parseFloat(transaction.purity) || 0;
      }
  
      //  Always add purity if available (for total across both types)
      acc.goldTotalPurity += parseFloat(transaction.purity) || 0;
      acc.totalUsedPurity += parseFloat(transaction.usedPurity) || 0;

      return acc;
    },
    { totalCash: 0, totalPurity: 0, goldTotalPurity: 0, totalUsedPurity: 0 }
  );
  

  return (
    <>
      <Navbar />
      <div className={styles.customerTransactions}>
        <ToastContainer position="top-right" autoClose={3000} />
        <h4>
          Customer Transactions{" "}
          {customerName && `for ${decodeURIComponent(customerName)}`}
        </h4><hr/>
       
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.filters}>

        <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginRight:'18rem'
            }}
            variant="contained"
            onClick={() => setShowPopup(true)}
          > Add Transaction </Button>

<TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ ml: "7.5rem" }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            sx={{ ml: "1rem" }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

<Button
    variant="outlined"
    color="error"
    size="small"
    style={{
      borderStyle: "solid",
      borderWidth: "2px",
      marginLeft:"1rem",
      backgroundColor: "rgb(188, 18, 35)",
      color: "white",
      borderColor: "brown",
    }}
    onClick={() => {
      setFromDate(" ");
      setToDate(" ");
    }}
  >
    Reset 
  </Button>
        </div>

{showPopup && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h5 style={{ textAlign: "center", fontWeight: "530" }}>Add Transaction</h5>
      <form onSubmit={addTransaction} className={styles.transactionForm}>
        {/* Date */}

        <TextField
          margin="dense"
          label="Date"
          name="date"
          type="date"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          value={newTransaction.date}
          onChange={handleChange}
        />
   
        {/* Type */}
  
        <TextField
          select
          label="Type"
          name="type"
          fullWidth
          required
          value={newTransaction.type}
          onChange={handleChange}
        >
          <MenuItem value="Cash">Cash</MenuItem>
          <MenuItem value="Gold">Gold</MenuItem>
        </TextField>
      

        {/* Cash fields */}
        {newTransaction.type === "Cash" && (
          <>
            <TextField
              label="Cash Value"
              name="cashValue"
              type="number"
              fullWidth
              required
              value={newTransaction.cashValue}
              onChange={handleChange}
            />
            <TextField
              label="Gold Rate"
              name="goldRate"
              type="number"
              fullWidth
              required
              value={newTransaction.goldRate}
              onChange={handleChange}
            />
            <TextField
              label="Purity"
              name="purity"
              type="number"
              fullWidth
              value={newTransaction.purity}
              InputProps={{ readOnly: true }}
            />
          </>
        )}

        {/* Gold fields */}
        {newTransaction.type === "Gold" && (
          <>
            <TextField
              label="Gold Value (grams)"
              name="goldValue"
              type="number"
              fullWidth
              required
              value={newTransaction.goldValue}
              onChange={handleChange}
            />
            <TextField
              select
              label="Touch"
              name="touchId"
              fullWidth
              required
              value={newTransaction.touchId}
              onChange={handleChange}
            >
              {touchOptions.map((touchObj) => (
                <MenuItem key={touchObj.id} value={touchObj.id}>
                  {touchObj.touch}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Purity"
              name="purity"
              type="number"
              fullWidth
              value={newTransaction.purity}
              InputProps={{ readOnly: true }}
            />
          </>
        )}

        <div className={styles.formActions}>
          <Button
            variant="outlined"
            onClick={() => {
              resetForm();
              setShowPopup(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
<br/>

<div className={styles.openingBalanceSection}>
  <h5>
    Opening Balance: <span style={{ color: "red" }}>  ₹ {openingBalance}   </span>
  </h5>
</div>


<div > 
        <table className={styles.purchaseTable}>
          <thead>
            <tr>
            <th>S.No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Value</th>
              <th>Gold Rate</th>
              <th>Touch</th>
              <th>Purity</th>
              <th>Used Purity</th>
            </tr>
          </thead>
<tbody>
  {filteredTransactions.length > 0 ? (
    filteredTransactions.map((transaction, index) => (
      <tr
        key={index} 
        className={transaction.type === "Gold" ? "gold-row" : "cash-row"}
      >
        <td>{index + 1}</td>   
        <td>{new Date(transaction.date).toLocaleDateString("en-IN")}</td>
        <td>
          {transaction.updatedAt
            ? new Date(transaction.updatedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
             
              })
            : "-"}
        </td>
        <td>{transaction.type}</td>
        <td>
          {transaction.type === "Gold"
            ? `${transaction.value} g`
            : `₹ ${transaction.value}`}
        </td>

        <td>{transaction.goldRate}</td>
        <td>{transaction.touch ? transaction.touch.touch : "-"}</td>
        <td>{transaction.purity || "-"}</td>
        <td>{transaction.usedPurity || "-" }</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className={styles.noData}>
        No transactions found
      </td>
    </tr>
  )}
</tbody>
          <tfoot> 
            <tr><td colSpan={7}><b>  Total Purity ( Both Cash and Gold )</b> </td> 
            <td> <b> {totals.goldTotalPurity.toFixed(3)} g </b></td>
            <td><b>{totals.totalUsedPurity.toFixed(3)} g</b></td>
            </tr>
          </tfoot>
        </table>
        </div>

        {(totals.totalCash > 0 || totals.totalPurity > 0) && (
  <div className={styles.transactionTotals}>
    <h4>Transaction Totals</h4>
    <div className={styles.totalRow}>
      <span>Total Cash:</span>
      <span>₹ {totals.totalCash.toFixed(2)}</span>
    </div>
    <div className={styles.totalRow}>
      <span>Total Purity (Gold only):</span>
      <span>{totals.totalPurity.toFixed(3)} g</span>
    </div>
    <div className={styles.totalRow}>
      <span>Available Purity (Not Used):</span>
      <span> {(totals.goldTotalPurity - totals.totalUsedPurity).toFixed(3)} g </span>
    </div>
  
  </div>
)}

      </div>
    </>
  );
};

export default CustomerTranscation; 







