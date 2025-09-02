import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import Master from "./MasterNavbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from './MasterFiling.module.css';

function MasterFiling() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(""); 
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  const clearForm = () => {
    setCustomerName("");
    setPhoneNumber("");
    setAddress("");
    setEmail("");
    setEditIndex(null);
  };



  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/filing`);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
      }
    };
  
    fetchCustomers();
  }, []);




  const handleSave = async () => {
    const customerData = {
      name: customerName,
      phoneNumber,
      address,
      email,
    };
  
    try {
      if (editIndex !== null) {
        const id = customers[editIndex].id;
        const response = await axios.put(`${BACKEND_SERVER_URL}/api/filing/${id}`, customerData);
        const updated = [...customers];
        updated[editIndex] = response.data.filing || response.data; 
        setCustomers(updated);
      } else {
        const response = await axios.post(`${BACKEND_SERVER_URL}/api/filing`, customerData);
        console.log('posting filing', response);
        setCustomers((prev) => [...prev, response.data.filing]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.error || "Something went wrong"));
    }
  };
  

  const handleEdit = (index) => {
    const customer = filteredCustomers[index];
    const originalIndex = customers.findIndex(
      (c) => c.name === customer.name && c.phoneNumber === customer.phoneNumber
    );
    setCustomerName(customer.name);
    setPhoneNumber(customer.phoneNumber);
    setAddress(customer.address);
    setEmail(customer.email || "");
    setEditIndex(originalIndex);
    openModal();
  };
  const handleDelete = async (index) => {
    const customer = customers[index];
    const confirmed = window.confirm(`Are you sure you want to delete "${customer.name}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/filing/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.error || "Something went wrong"));
    }
  };
  
  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  return (
    <>
      <Master />
        <div className={styles.customerContainer}>
        <div className={styles.headerRow}>
          
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            variant="contained"
            onClick={openModal}
          >
            Add Filing
          </Button>
          <TextField
            placeholder="Search by Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            sx={{ marginLeft: "52.6rem" }}
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
            }}
            onClick={() => setSearchTerm("")}
          >
            Reset
          </Button>
        </div>

        <Dialog open={isModalOpen} onClose={closeModal}>
          <DialogTitle style={{ color: "#a33768" }}>
            {editIndex !== null ? "Edit Filing Member" : "Add Filing Member"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Customer Name"
              type="text"
              fullWidth
              sx={{mt:3}}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Phone Number"
              type="tel"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Address"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} color="secondary">Cancel</Button>
            <Button onClick={handleSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>


<div className={styles.itemList}> 
<table className={styles.customerTable} >
  <thead>
    <tr>
      <th>S.No</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Address</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredCustomers.length > 0 ? (
      filteredCustomers.map((customer, index) => (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{customer.name}</td>
          <td>{customer.phoneNumber}</td>
          <td>{customer.email}</td>
          <td>{customer.address}</td>          
          <td style={{width:"7rem"}}>
          
          <Edit onClick={() => handleEdit(index)} className={styles.actionIcon} />
          <Delete onClick={() => handleDelete(index)} className={styles.deleteIcon} />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" className={styles.centerText}>
          Name not found
        </td>
      </tr>
    )}
  </tbody>
</table>
</div>
      </div>
    </>
  );
}

export default MasterFiling;
