
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./QCStock.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import MasterNavbar from "./MasterNavbar";
import { Edit, Delete, Search  } from "@mui/icons-material";
import { TextField, MenuItem, Button, Box, InputAdornment,  FormControl,   InputLabel, Select,  Dialog,  DialogTitle,  DialogContent } from "@mui/material";


const QCStock = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [touches, setTouches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    date: today,
    item_id: "",
    weight: "",
    stoneWeight: "",
    finalWeight: "",
    touch_id: "",
    purity: "",
    remarks: "",
  });

  useEffect(() => {
    fetchEntries();
    fetchItems();
    fetchTouches();
  }, []);


  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/qcstock`);
      console.log("qcstock", res)
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching QC stock:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchTouches = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
      setTouches(res.data);
    } catch (err) {
      console.error("Error fetching touches:", err);
    }
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingIndex(null);
    setEditingId(null);
    setFormData({
      date: today,
      item_id: "",
      weight: "",
      stoneWeight: "",
      finalWeight: "",
      touch_id: "",
      purity: "",
      remarks: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "weight" || name === "stoneWeight") {
      const weight = parseFloat(updated.weight) || 0;
      const stoneWeight = parseFloat(updated.stoneWeight) || 0;
      updated.finalWeight = weight - stoneWeight;
    }

    if (name === "touch_id" || name === "weight" || name === "stoneWeight") {
      const finalWeight = parseFloat(updated.finalWeight) || 0;
      const selectedTouch = touches.find((t) => t.id === parseInt(updated.touch_id));
      const touchValue = selectedTouch ? selectedTouch.touch : 0;

      updated.purity = finalWeight * touchValue/100;
    }

    setFormData(updated);
  };


const handleSave = async () => {
    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/qcstock`, {
        ...formData,
        id: editingId, 
      });
      fetchEntries();
      handleClose();
    } catch (err) {
      console.error("Error saving QC stock:", err);
    }
  };
  

  const handleEdit = (index) => {
    const entry = entries[index];
    setFormData({
      date: entry.createdAt?.split("T")[0],
      item_id: entry.item_id,
      weight: entry.weight,
      stoneWeight: entry.stone_weight,
      finalWeight: entry.final_weight,
      touch_id: entry.touch_id,
      purity: entry.purity,
      remarks: entry.remarks,
    });
    setEditingIndex(index);
    setEditingId(entry.id);
    setOpen(true);
  };
  

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/qcstock/${id}`);
      fetchEntries();
    } catch (err) {
      console.error("Error deleting QC stock:", err);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  return (
    <>
     <MasterNavbar/>
      <Button
        style={{
          backgroundColor: "#F5F5F5",
          color: "black",
          borderColor: "#25274D",
          borderStyle: "solid",
          borderWidth: "2px",
          margin: "3rem 0 0 4rem",
        }}
        variant="contained"
        onClick={handleOpen}
      >
        Add QC Stock
      </Button>

<TextField
            placeholder="Search by Jewel Name"
            variant="outlined"
            size="small"
            sx={{ marginLeft: "55.5rem", mt:'3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft: "1.2rem",
              marginTop:'3rem'
              
            }}
            onClick={() => setSearchTerm("")}
          >
            Reset
          </Button>


                <Dialog
  open={open}
  onClose={handleClose}
  PaperProps={{
    sx: { width: "450px", maxWidth: "90%", borderRadius:'7px' } }}>
          <h5 style={{ textAlign: "center", padding:'1.1rem', backgroundColor:"#F5F5F5"}}>
          {editingIndex !== null ? "Edit QC Stock" : "Add QC Stock"}</h5>

        <DialogContent >
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />

          <Box display="flex" gap={2}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Jewel Name</InputLabel>
              <Select
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
              >
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Weight"
              name="weight"
              type="number"
              autoComplete="off"
              onWheel={(e) => e.target.blur()}
              value={formData.weight}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Stone Weight"
              name="stoneWeight"
              type="number"
              autoComplete="off"
              onWheel={(e) => e.target.blur()}
              value={formData.stoneWeight}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Final Weight"
              name="finalWeight"
              type="number"
              value={formData.finalWeight}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box display="flex" gap={2}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Touch</InputLabel>
              <Select
                name="touch_id"
                value={formData.touch_id}
                onChange={handleChange}
              >
                {touches.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.touch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Purity"
              name="purity"
              type="number"
              value={formData.purity}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Box>

          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            fullWidth
            margin="dense"
            multiline
            rows={2}
          />
        </DialogContent>

        <Box display="flex" justifyContent="flex-end" p={2} gap={2}>
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}  sx={{marginRight:'0.5rem'}}>
            {editingIndex !== null ? "Update" : "Save"}
          </Button>
        </Box>
      </Dialog>
<div>
        <table className={styles.purchaseTable}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Jewel Name</th>
              <th>Weight</th>
              <th>Stone Weight</th>
              <th>Final Weight</th>
              <th>Touch</th>
              <th>Purity</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => {

                const updatedDateObj = entry.updatedAt ? new Date(entry.updatedAt) : null;

const formattedUpdatedDate = updatedDateObj
  ? updatedDateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "—";

const formattedUpdatedTime = updatedDateObj
  ? updatedDateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  : "—";

                return (
                  <tr key={entry.id} className={index % 2 === 0 ? styles.trEven : ""}>
                    <td>{index + 1}</td>
                    <td>{formattedUpdatedDate}</td>
                    <td>{formattedUpdatedTime}</td>
                    <td>{entry.itemId?.name}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.stone_weight}</td>
                    <td>{entry.final_weight}</td>
                    <td>{entry.touchId?.touch}</td>
                    <td>{entry.purity}</td>
                    <td>{entry.remarks}</td>
                    <td>
                      <Edit
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(index)}
                      />
                    
                      <Delete
             onClick={() => handleDelete(entry.id)}
              className={styles.deleteIcon}
            />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  Jewel Name not found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default QCStock;
