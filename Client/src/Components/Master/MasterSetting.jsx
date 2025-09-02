import React, { useState, useEffect } from "react";
import styles from './MasterSetting.module.css';
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

function MasterSetting() {
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
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/setting`);
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
      phoneNumber ,
      address,
      email,
    };
  
    try {
      if (editIndex !== null) {
        // PUT request for updating customer
        const id = customers[editIndex].id; // assuming your customers have unique IDs
        const response = await axios.put(`${BACKEND_SERVER_URL}/api/setting/${id}`, customerData);
        const updated = [...customers];
        updated[editIndex] = response.data.setting || response.data; 
        setCustomers(updated);
      } else {
        // POST request for adding new customer
        const response = await axios.post(`${BACKEND_SERVER_URL}/api/setting`, customerData);
        setCustomers((prev) => [...prev, response.data]);
        setCustomers((prev) => [...prev, response.data.setting]);

        console.log('setting members:',response)
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


  const handleDelete = async (id) => {
    const confirmed = window.confirm(`Are you sure you want to delete this customer?`);
    if (!confirmed) return;
  
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/setting/${id}`);
      const updatedCustomers = customers.filter((customer) => customer.id !== id);
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
            Add Setting Member
          </Button>
          <TextField
            placeholder="Search by Name"
            variant="outlined"
            size="small"
            sx={{ marginLeft: "47rem" }}
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
            }}
            onClick={() => setSearchTerm("")}
          >
            Reset
          </Button>
        </div>

        <Dialog open={isModalOpen} onClose={closeModal}>
          <DialogTitle style={{ color: "#a33768" }}>
            {editIndex !== null ? "Edit Setting Member" : "Add Setting Memberr"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Customer Name"
              type="text"
              sx={{marginTop:'2rem'}}
              fullWidth
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

          {/* <td style={{width:"7rem"}}>
            <b onClick={() => handleEdit(index)} style={{ marginRight: "8px" }}>
           <Edit />
            </b>
            <b onClick={() => handleDelete(customer.id)} style={{ color: "red", marginLeft:'0.5rem' }}>
  <Delete />
</b>

          </td> */}
             <td style={{width:"7rem"}}>
          
          <Edit onClick={() => handleEdit(index)} className={styles.actionIcon} />
          <Delete onClick={() => handleDelete(customer.id)} className={styles.deleteIcon} />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6">Name not found</td>
      </tr>
    )}
  </tbody>
</table>

</div> 
      </div>
    </>
  );
}

export default MasterSetting;
