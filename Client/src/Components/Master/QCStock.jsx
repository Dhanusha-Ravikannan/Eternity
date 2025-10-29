
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./QCStock.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import MasterNavbar from "./MasterNavbar";
import { Edit, Delete, Search  } from "@mui/icons-material";
import { TextField, MenuItem, Button, Box, InputAdornment,  FormControl,   InputLabel, Select,  Dialog,  DialogTitle,  DialogContent } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "@mui/material";



const QCStock = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [touches, setTouches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
    //  Validation before API call
    const { date, item_id, weight, stoneWeight, finalWeight, touch_id, purity } = formData;
  
    if (
      !date ||
      !item_id ||
      !weight ||
      !stoneWeight ||
      !finalWeight ||
      !touch_id ||
      !purity
    ) {
      toast.error("Please fill all required fields. Remarks is optional.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }
  
    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/qcstock`, {
        ...formData,
        id: editingId,
      });
      fetchEntries();
      handleClose();
  
      toast.success("QC Stock saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      console.error("Error saving QC stock:", err);
      toast.error("Failed to save QC Stock. Please check your inputs.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };
  
  const handleEdit = (index) => {
    const entry = entries[index];
    setFormData({
      date: entry.date ? entry.date.split("T")[0] : "", 
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
    const confirmDelete = window.confirm("Are you sure you want to delete this item? If you click ok this item will delete in Bill also"  );
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/qcstock/${id}`);
      fetchEntries();
    } catch (err) {
      console.error("Error deleting QC stock:", err);
    }
  };

// Filtered entries based on jewel name, date range, and status
const filteredEntries = entries.filter((entry) => {
  const matchesName =
    entry.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

  const entryDate = entry.updatedAt ? new Date(entry.updatedAt) : null;
  const matchesFromDate = fromDate ? entryDate >= new Date(fromDate) : true;
  const matchesToDate = toDate? entryDate <= new Date(new Date(toDate).setHours(23, 59, 59, 999)) : true;
  const matchesStatus =
    statusFilter === "Moved"
      ? entry.status === "Moved"
      : statusFilter === "Not Moved"
      ? entry.status === "Not Moved"
      : true;

  return matchesName && matchesFromDate && matchesToDate && matchesStatus;
});

  // Calculate totals
const totalWeight = filteredEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
const totalStoneWeight = filteredEntries.reduce((sum, entry) => sum + (entry.stone_weight || 0), 0);
const totalFinalWeight = filteredEntries.reduce((sum, entry) => sum + (entry.final_weight || 0), 0);
const totalPurity = filteredEntries.reduce((sum, entry) => sum + (entry.purity || 0), 0);


const handleDownloadPDF = () => {
  const doc = new jsPDF();
   // Title centered
   doc.setFontSize(16);
   const pageWidth = doc.internal.pageSize.getWidth();
   const title = "QC Stock Report";
   const textWidth = doc.getTextWidth(title);
   const xPos = (pageWidth - textWidth) / 2; // center horizontally
   doc.text(title, xPos, 15);

  // Summary
  doc.setFontSize(10);
  doc.text("Summary:", 14, 25);
  doc.text(`Total Weight: ${totalWeight}`, 14, 32);
  doc.text(`Total Stone Weight: ${totalStoneWeight}`, 14, 39);
  doc.text(`Total Final Weight: ${totalFinalWeight}`, 14, 46);
  doc.text(`Total Purity: ${totalPurity}`, 14, 53);

  // Table
  const tableColumn = [
    "S.No",
    "Date",
    "Time",
    "Jewel Name",
    "Weight",
    "Stone Wt",
    "Final Wt",
    "Touch",
    "Purity",
    "Remarks",
    "Status",
  ];

  const tableRows = filteredEntries.map((entry, index) => {
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

    return [
      index + 1,
      formattedUpdatedDate,
      formattedUpdatedTime,
      entry.itemId?.name || "",
      entry.weight || "",
      entry.stone_weight || "",
      entry.final_weight || "",
      entry.touchId?.touch || "",
      entry.purity || "",
      entry.remarks || "",
      entry.status || "",
    ];
  });

  autoTable(doc, {
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
  });

  doc.save("QCStock_Report.pdf");
};

// const handlePrint = () => {
//   const printContent = document.getElementById("printable-section");
//   const WindowPrint = window.open("", "", "width=1200,height=800");
//   WindowPrint.document.write("<html><head><title>QC Stock Report</title></head><body>");
//   WindowPrint.document.write(printContent.innerHTML);
//   WindowPrint.document.write("</body></html>");
//   WindowPrint.document.close();
//   WindowPrint.print();
// };

  return (
    <>
     <MasterNavbar/>
     <div id="printable-section">
     <div> 

      <Box display="flex" gap={2} alignItems="center" >
      <Button
        style={{
          backgroundColor: "#F5F5F5",
          color: "black",
          borderColor: "#25274D",
          borderStyle: "solid",
          borderWidth: "2px",
          margin: "3rem 0 0 5rem",
        }}
        variant="contained"
        onClick={handleOpen}
      >
        Add QC Stock
      </Button> 
 
<div style={{marginTop:'3rem', display:'flex', gap:'1rem', marginLeft:'20rem'}}> 
        <TextField
          label="From Date"
          type="date"
          size="small"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To Date"
          type="date"
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Moved">Moved</MenuItem>
            <MenuItem value="Not Moved">Not Moved</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Search by Jewel Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setSearchTerm("");
            setFromDate("");
            setToDate("");
            setStatusFilter("");
          }}
        >
          Reset
        </Button>
        </div>
      </Box>
      </div>
  
      <div className={styles.summarySection}>
        <h4>Summary</h4>

        <div className={styles.summaryGrid}>

        <div className={styles.summaryItem}>
            <span>Total Weight :</span>
            <span>{totalWeight}</span>
        </div>
    <div className={styles.summaryItem}>
            <span>Total Stone Weight :</span>
            <span> {totalStoneWeight}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Total Final Weight :</span>
            <span>{totalFinalWeight}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Total Purity :</span>
            <span>{totalPurity.toFixed(3)}</span>
    </div>
        </div>
      </div> 

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
          <FormControl fullWidth margin="dense" variant="outlined">
  <InputLabel id="jewel-name-label">Jewel Name</InputLabel>
  <Select
    labelId="jewel-name-label"
    name="item_id"
    value={formData.item_id}
    onChange={handleChange}
    label="Jewel Name" 
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
          <FormControl fullWidth margin="dense" variant="outlined">
  <InputLabel id="touch-label">Touch</InputLabel>
  <Select
    labelId="touch-label"
    name="touch_id"
    value={formData.touch_id}
    onChange={handleChange}
    label="Touch"
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => {
const dateObj = entry.date ? new Date(entry.date) : null;
const formattedDate = dateObj
  ? dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "—";

const updatedAtObj = entry.updatedAt ? new Date(entry.updatedAt) : null;
const formattedTime = updatedAtObj
  ? updatedAtObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  : "—";

                return (
                  <tr key={entry.id} className={index % 2 === 0 ? styles.trEven : ""}>
                    <td>{index + 1}</td>
                    <td>{formattedDate}</td>
                    <td>{formattedTime}</td>
                    <td>{entry.itemId?.name}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.stone_weight}</td>
                    <td>{entry.final_weight}</td>
                    <td>{entry.touchId?.touch}</td>
                    <td>{entry.purity}</td>
                    <td>{entry.remarks}</td>
                    <td>{entry.status}</td>
                    {/* <td>
                       <Edit
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(index)}
                      />      
                      <Delete
             onClick={() => handleDelete(entry.id)}
              className={styles.deleteIcon}
            />
                    </td> */}

<td>
  {entry.status === "Moved" ? (
    <>
      <Tooltip title="Cannot edit a moved entry">
        <span>
          <Edit
            style={{
              cursor: "not-allowed",
              opacity: 0.4,
            }}
          />
        </span>
      </Tooltip>

      <Tooltip title="Cannot delete a moved entry">
        <span>
          <Delete
            style={{
              cursor: "not-allowed",
              opacity: 0.4,
              marginLeft: "0.5rem",
            }}
          />
        </span>
      </Tooltip>
    </>
  ) : (
    <>
      <Edit
        style={{ cursor: "pointer" }}
        onClick={() => handleEdit(index)}
      />
      <Delete
        onClick={() => handleDelete(entry.id)}
        className={styles.deleteIcon}
        style={{ marginLeft: "0.5rem" }}
      />
    </>
  )}
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  Jewel Name not found
                </td>
              </tr>
            )}
          </tbody>
     
        </table>
 </div>
        </div>
        {/* PDF & Print Buttons */}
<div style={{ margin: "1rem 0 2rem 5rem", display: "flex", gap: "1rem" }}>
  <Button
    variant="contained"
    color="primary"
    onClick={handleDownloadPDF}
  >
    Download PDF
  </Button>
  {/* <Button
    variant="outlined"
    color="secondary"
    onClick={handlePrint}
  >
    Print
  </Button> */}
</div>

<ToastContainer />
     
    </>
  );
};

export default QCStock;

