import React, { useState } from "react";
import {Button,Dialog, DialogTitle,DialogContent,DialogActions,TextField,Snackbar} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Navbar from "../Navbar/Navbar";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Filing.css'

const Filing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [beforeWeight, setBeforeWeight] = useState("");
  const [purity, setPurity] = useState("");
  const [touch, setTouch] = useState("");
  const [difference, setDifference] = useState("");
  const [afterWeight, setAfterWeight] = useState("");
  const [entries, setEntries] = useState([]);

  // Toast state
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleToast = (message) => {
    setToastMessage(message);
    setOpenToast(true);
  };

  const openModal = () => {
    clearFields();
    setEditIndex(null); // new entry
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearFields();
    setEditIndex(null);
  };

  const clearFields = () => {
    setDate("");
    setName("");
    setBeforeWeight("");
    setPurity("");
    setTouch("");
    setDifference("");
    setAfterWeight("");
  };

  const handleSave = () => {
    const hasData =
      date || name || beforeWeight || purity || touch || difference || afterWeight;

    if (!hasData) {
      handleToast("Please fill in at least one field before saving.");
      return;

      
    }

    const newEntry = {
      date,
      name,
      beforeWeight,
      purity,
      touch,
      difference,
      afterWeight,
    };

    if (editIndex !== null) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = newEntry;
      setEntries(updatedEntries);
      toast.success("Updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      setEntries([...entries, newEntry]);
      toast.success("Saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    }

    closeModal();
  };

  const handleViewEdit = (index) => {
    const entry = entries[index];
    setDate(entry.date);
    setName(entry.name);
    setBeforeWeight(entry.beforeWeight);
    setPurity(entry.purity);
    setTouch(entry.touch);
    setDifference(entry.difference);
    setAfterWeight(entry.afterWeight);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="filing-container">
        <br />
       

<Box display="flex" alignItems="center" gap="1rem" mb={2}>
  <TextField
    id="from-date"
    label="From Date"
    type="date"
    InputLabelProps={{ shrink: true }}
  />
  <TextField
    id="to-date"
    label="To Date"
    type="date"
    InputLabelProps={{ shrink: true }}
  />
  <FormControl>
    <InputLabel id="status-label">Status</InputLabel>
    <Select
      labelId="status-label"
      id="status"
      value={name}
      label="Status"
      onChange={(e) => setName(e.target.value)}
      style={{ minWidth: 150 }}
    >
      <MenuItem value="Processing">Processing</MenuItem>
      <MenuItem value="Completed">Completed</MenuItem>
    </Select>
  </FormControl>
  <Button
          style={{
            backgroundColor: "#F5F5F5",
            color: "black",
            borderColor: "#25274D",
            borderStyle: "solid",
            borderWidth: "2px",
            marginLeft: "81rem",
            position: "absolute",
          }}
          variant="contained"
          onClick={openModal}
        >
          Add Filing Items
        </Button>
</Box>

        

        <Dialog open={isModalOpen} onClose={closeModal} 
        >
          <DialogTitle style={{ color: "#a33768" }}>Filing</DialogTitle>

          <Dialog
  open={isModalOpen}
  onClose={closeModal}
  maxWidth="lg"
  fullWidth
  PaperProps={{
    style: { minHeight: "300px", padding: "1rem",minWidth:"60%" , height:"fit-content"},
  }}
>
  <DialogTitle style={{ color: "#a33768", textAlign: "center" }}>
    Filing Entry
  </DialogTitle>

  <DialogContent>
    <Box display="flex" gap={4}>
      {/* Left Column - Filing Section */}
      <Box flex={1} p={2} borderRight="1px solid #ccc">
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Filing</h3>
        <TextField
          id="date"
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          style={{ marginBottom: "1rem" }}
        />
        <FormControl fullWidth>
          <InputLabel id="name-label">Name</InputLabel>
          <Select
            labelId="name-label"
            id="name"
            value={name}
            label="Name"
            onChange={(e) => setName(e.target.value)}
          >
            <MenuItem value="Dhanusha">Dhanusha</MenuItem>
            <MenuItem value="Saranya">Saranya</MenuItem>
            <MenuItem value="Boobalan">Boobalan</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Right Column - Casting Items */}
      <Box flex={2} p={2}>
        <h3 style={{ textAlign: "center" }}>Casting Items</h3>
        <br/>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Touch</TableCell>
                <TableCell>Purity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Example rows — replace with your dynamic data */}
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Ring</TableCell>
                <TableCell>10g</TableCell>
                <TableCell>92</TableCell>
                <TableCell>22K</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Chain</TableCell>
                <TableCell>15g</TableCell>
                <TableCell>91.6</TableCell>
                <TableCell>22K</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={closeModal} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleSave} color="primary">
      {editIndex !== null ? "Update" : "Save"}
    </Button>
  </DialogActions>
</Dialog>



          <DialogActions>
            <Button onClick={closeModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              {editIndex !== null ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>


        <div className="tables-container">
        <div className="left-table"> 
        <h3 style={{textAlign:'center', color:'#d40b4e',fontSize:'1.3rem',fontWeight:'bold'}}> Filing </h3>
        <TableContainer component={Paper} style={{ marginTop: "1rem",width:"60rem"}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >S.No</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Date</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Name</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Before Weight</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Purity</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Touch</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Difference</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >After Weight</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} >Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.beforeWeight}</TableCell>
                  <TableCell>{entry.purity}</TableCell>
                  <TableCell>{entry.touch}</TableCell>
                  <TableCell>{entry.difference}</TableCell>
                  <TableCell>{entry.afterWeight}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewEdit(index)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
        <div className="right-table">  
<h3 style={{textAlign:'center',color:'#d40b4e',fontSize:'1.3rem',fontWeight:'bold'}}> Filing Items </h3>
        <TableContainer component={Paper} style={{ marginTop: "1rem",width:"30rem"}} > 
          <Table> 
            <TableHead> 
              <TableRow> 
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} > S.No</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} > Item Name</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} > Weight</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} > Touch</TableCell>
                <TableCell className="table-head-cell" sx={{fontSize:'1rem'}} > Purity</TableCell>              
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
        </div>

        </div>
   

        {/* Snackbar for Toast */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={openToast}
          autoHideDuration={3000}
          onClose={() => setOpenToast(false)}
        >
          <MuiAlert
            onClose={() => setOpenToast(false)}
            severity="warning"
            elevation={6}
            variant="filled"
          >
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </>
  );
};

export default Filing;
