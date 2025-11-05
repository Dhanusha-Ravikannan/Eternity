import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import {
  Button,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Navbar from "../Navbar/Navbar";
import styles from "./ExpenseVoucher.module.css";
import { FaWallet } from "react-icons/fa";
import DeleteIcon from "@mui/icons-material/Delete";
import { Edit , Delete } from "@mui/icons-material";

const ExpenseVoucher = () => {
  const [summary, setSummary] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [touchList, setTouchList] = useState([]);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    gold: "",
    touch_id: "",
    purity: "",
  });

  const [availableInfo, setAvailableInfo] = useState({ available: 0, after: 0 });
  const [prevTouch, setPrevTouch] = useState(null);
  const [prevGold, setPrevGold] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);



  useEffect(() => {
    fetchTouches();
    fetchStock();
    fetchExpenseVouchers();
  }, []);

  const fetchTouches = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
      setTouchList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/stock`);
      const stockData = res.data;

      const grouped = Object.values(
        stockData.reduce((acc, item) => {
          const touchValue = item.touch?.touch || item.touch;
          if (!touchValue || isNaN(parseFloat(touchValue))) return acc;
      
          if (!acc[touchValue]) {
            acc[touchValue] = {
              touch: touchValue,
              totalWeight: 0,
              remaining: 0,
            };
          }
      
          acc[touchValue].totalWeight += parseFloat(item.weight) || 0;
          acc[touchValue].remaining += parseFloat(item.weight) || 0;
      
          return acc;
        }, {})
      );      

      setSummary(grouped);
    } catch (err) {
      console.error("Error fetching stock", err);
    }
  };

  const fetchExpenseVouchers = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/expense-voucher`);
      setExpenseList(res.data);
      setFilteredExpenses(res.data); 
    } catch (err) {
      console.error("Error fetching expense vouchers:", err);
    }
  };
  

  useEffect(() => {
    if (!fromDate && !toDate) {
      setFilteredExpenses(expenseList);
      return;
    }
  
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
  
    const filtered = expenseList.filter((item) => {
      const itemDate = new Date(item.date);
      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      return true;
    });
  
    setFilteredExpenses(filtered);
  }, [fromDate, toDate, expenseList]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    const goldValue = parseFloat(updatedForm.gold) || 0;
    const selectedTouch = touchList.find(
      (t) => t.id === parseInt(updatedForm.touch_id)
    );
    const touchValue = selectedTouch ? parseFloat(selectedTouch.touch) : null;

    // Auto-calculate purity
    if (name === "gold" || name === "touch_id") {
      if (goldValue && touchValue) {
        updatedForm.purity = ((goldValue * touchValue) / 100).toFixed(3);
      } else {
        updatedForm.purity = "";
      }
    }

    let updatedSummary = [...summary];
    let available = 0;
    let after = 0;

    // Restore previously deducted
    if (prevTouch !== null) {
      updatedSummary = updatedSummary.map((item) => {
        if (item.touch === prevTouch) {
          return {
            ...item,
            remaining: item.remaining + parseFloat(prevGold || 0),
          };
        }
        return item;
      });
    }

    if (name === "gold" && (!value || parseFloat(value) <= 0)) {
      updatedForm.purity = "";
      setFormData(updatedForm);
      setSummary(updatedSummary);
      setPrevTouch(null);
      setPrevGold(0);
      setAvailableInfo({ available: 0, after: 0 });
      return;
    }

    if (touchValue && goldValue) {
      let insufficient = false;

      updatedSummary = updatedSummary.map((item) => {
        if (item.touch === touchValue) {
          available = item.remaining;
          if (goldValue > available) {
            alert(`Only ${available.toFixed(3)} grams available in touch ${touchValue}.`);
            updatedForm.gold = "";
            updatedForm.purity = "";
            insufficient = true;
            after = available;
            return item;
          }

          after = available - goldValue;
          return { ...item, remaining: after };
        }
        return item;
      });

      if (insufficient) {
        setFormData(updatedForm);
        setAvailableInfo({ available, after });
        return;
      }

      setPrevTouch(touchValue);
      setPrevGold(goldValue);
    } else {
      setPrevTouch(null);
      setPrevGold(0);
    }

    setAvailableInfo({ available, after });
    setSummary(updatedSummary);
    setFormData(updatedForm);
  };

  //  CREATE or UPDATE
const handleSave = async () => {
  if (!formData.gold || !formData.touch_id) {
    alert("Please fill all required fields");
    return;
  }

  try {
    if (isEditing && editId) {
      //  Update existing voucher
      await axios.put(`${BACKEND_SERVER_URL}/api/expense-voucher/${editId}`, formData);
      alert("Expense voucher updated successfully");
    } else {
      //  Create new voucher
      await axios.post(`${BACKEND_SERVER_URL}/api/expense-voucher`, formData);
      alert("Expense voucher added successfully");
    }

    // Refresh data and reset form
    fetchExpenseVouchers();
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      gold: "",
      touch_id: "",
      purity: "",
    });
    setAvailableInfo({ available: 0, after: 0 });
    setPrevTouch(null);
    setPrevGold(0);
    setOpen(false);
    setIsEditing(false);
    setEditId(null);
  } catch (err) {
    console.error("Error saving voucher:", err);
    alert("Error saving voucher");
  }
};

//  DELETE EXPENSE
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this expense voucher?")) {
    return;
  }

  try {
    await axios.delete(`${BACKEND_SERVER_URL}/api/expense-voucher/${id}`);
    alert("Expense voucher deleted successfully");
    fetchExpenseVouchers();
  } catch (err) {
    console.error("Error deleting expense voucher:", err);
    alert("Error deleting expense voucher");
  }
};


  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setFilteredExpenses(expenseList);
  };

  const handleEdit = (item) => {
    setFormData({
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      description: item.description || "",
      gold: item.gold || "",
      touch_id: item.touch_id || (item.touchId?.id || ""),
      purity: item.purity || "",
    });
    setEditId(item.id);
    setIsEditing(true);
    setOpen(true);
  };
  
  

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.tableSection}>
        <center><h4> <FaWallet /> Expense Tracker</h4> </center>

<div className={styles.headerRow}>
  <div className={styles.filterSection}>
    <TextField
      type="date"
      label="From Date"
      InputLabelProps={{ shrink: true }}
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      size="small"
      sx={{ backgroundColor: "#fff", borderRadius: "6px" , marginLeft:'2rem'}}
    />
    <TextField
      type="date"
      label="To Date"
      InputLabelProps={{ shrink: true }}
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      size="small"
      sx={{ backgroundColor: "#fff", borderRadius: "6px" }}
    />
    <Button
      variant="outlined"
      color="secondary"
      onClick={handleResetFilter}
      sx={{ height: "40px", marginLeft: "10px" }}
    >
      Reset
    </Button>
    <Button
      style={{
        backgroundColor: "#F5F5F5",
        color: "black",
        borderColor: "#25274D",
        borderStyle: "solid",
        borderWidth: "2px",
        marginLeft:'48rem'
      }}
      variant="contained"
      onClick={() => setOpen(true)}
    >
      Add New Expense
    </Button>
  </div>
</div>

          <table className={styles.table}>
  <thead>
    <tr>
      <th>S.No</th>
      <th>Date</th>
      <th>Time</th>
      <th>Given Gold</th>
      <th>Touch</th>
      <th>Purity</th>
      <th>Description</th>
      <th>Actions</th>

    </tr>
  </thead>
  <tbody>
    {filteredExpenses.length === 0 ? (
      <tr>
        <td colSpan={7} style={{ textAlign: "center" }}>
          No Expense found
        </td>
      </tr>
    ) : (
        filteredExpenses.map((item, index) => {
        const createdAt = new Date(item.createdAt);
        const formattedDate = createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedTime = createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",

        });

        return (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{new Date(item.date).toLocaleDateString("en-GB")}</td>
            <td>{formattedTime}</td>
            <td>{item.gold}</td>
            <td>{item.touchId?.touch || "-"}</td>
            <td>{item.purity}</td>
            <td>{item.description || "-"}</td>
<td>
  <Edit 
  onClick={() => handleEdit(item)}/> 

 <Delete 
   color="error"
   sx={{marginLeft:"1rem"}}
   onClick={() => handleDelete(item.id)}
   />
</td>

          </tr>
        );
      })
    )}
  </tbody>
</table>
        </div>
      </div>

      {/*  Popup with left+right sections */}
      <Dialog
  open={open}
  onClose={() => setOpen(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    style: { maxWidth: "1050px", borderRadius: "12px" },
  }} >
   <h5 style={{padding:'1rem 0rem 0rem 1rem'}}>  
    {
      isEditing? "Edit Expense" : "Add New Expense"
    }
   </h5>
    
        <DialogContent dividers>
          <div className={styles.container} style={{ display: "flex", gap: "20px" }}>
            {/* Left Section (Form) */}
            <div className={styles.formSection} style={{ flex: 1 }}>

            <TextField
  label="Date"
  name="date"
  type="date"
  fullWidth
  margin="dense"
  value={formData.date}
  onChange={handleChange}
  InputLabelProps={{ shrink: true }}
/>

              <TextField
  label="Description"
  name="description"
  fullWidth
  margin="dense"
  multiline
  rows={3}
  value={formData.description}
  onChange={handleChange}
  placeholder="Enter expense details here..."
/>

              <TextField
                label="Given Gold"
                name="gold"
                type="number"
                fullWidth
                margin="dense"
                value={formData.gold}
                onChange={handleChange}
              />

              {formData.touch_id && availableInfo.available > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "green",
                    mt: 0.5,
                    fontWeight: 500,
                    background: "#f9f9f9",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  🟡 Available: {availableInfo.available.toFixed(3)}g | After Deduction:{" "}
                  {availableInfo.after.toFixed(3)}g
                </Typography>
              )}

              <TextField
                label="Touch"
                select
                name="touch_id"
                fullWidth
                margin="dense"
                value={formData.touch_id}
                onChange={handleChange}
              >
                <MenuItem value="">Select Touch</MenuItem>
                {touchList.map((touch) => (
                  <MenuItem key={touch.id} value={touch.id}>
                    {touch.touch}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Purity"
                name="purity"
                type="number"
                fullWidth
                margin="dense"
                value={formData.purity}
                InputProps={{ readOnly: true }}
              />

              <Button
  variant="contained"
  color="primary"
  onClick={handleSave}
  fullWidth
  sx={{ mt: 2 }}
>
  {isEditing ? "Update" : "Save"}
</Button>

            </div>

            {/* Right Section (Touch Summary) */}
            <div className={styles.tableSection} style={{ flex: 1 }}>
              <h5 style={{marginLeft:"2rem"}}>Touch Summary</h5>
              <table className={styles.table } style={{marginTop:"1rem"}}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Touch</th>
                    <th>Total Weight</th>
                    <th>Remaining Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No stock available
                      </td>
                    </tr>
                  ) : (
                    summary
                      .sort((a, b) => parseFloat(a.touch) - parseFloat(b.touch))
                      .map((item, index) => (
                        <tr key={item.touch}>
                          <td>{index + 1}</td>
                          <td>{item.touch}</td>
                          <td>{item.totalWeight.toFixed(3)}</td>
                          <td
                            style={{
                              color: item.remaining < 0 ? "red" : "black",
                              fontWeight: "bold",
                            }} >
                            {item.remaining.toFixed(3)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <DialogActions>
<Button
  onClick={() => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      gold: "",
      touch_id: "",
      purity: "",
    });
    setAvailableInfo({ available: 0, after: 0 });
    setPrevTouch(null);
    setPrevGold(0);
    setIsEditing(false);
    setEditId(null);
    setOpen(false);
  }}
  color="secondary"
>
  Cancel
</Button>

</DialogActions>

        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseVoucher;
