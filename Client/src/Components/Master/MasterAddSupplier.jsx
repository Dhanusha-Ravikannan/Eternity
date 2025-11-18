import React, { useState, useEffect } from "react";
import styles from './MasterAddSupplier.module.css'
import axios from "axios";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import Master from "./MasterNavbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSaveButton } from "../../Utils/useSaveButton";

function MasterAddSupplier() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(""); 
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { isSaving, handleSaveAction } = useSaveButton();

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
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/addsupplier`);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
        toast.error("Error fetching suppliers");
      }
    };
  
    fetchCustomers();
  }, []);


//  Validation function
const validateForm = () => {
  const trimmedName = customerName.trim();
  const trimmedPhone = phoneNumber.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    toast.error("Supplier Name is required");
    return false;
  }

  if (!trimmedPhone) {
    toast.error("Phone Number is required");
    return false;
  }
  if (!/^\d{10}$/.test(trimmedPhone)) {
    toast.error("Phone Number must be 10 digits");
    return false;
  }

  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    toast.error("Enter a valid Email");
    return false;
  }

  //  Check duplicate name (case-insensitive)
  const isDuplicateName = customers.some(
    (c, i) => c.name.toLowerCase() === trimmedName.toLowerCase() && i !== editIndex
  );
  if (isDuplicateName) {
    toast.error("Supplier Name already exists");
    return false;
  }

  //  Check duplicate phone number
  const isDuplicatePhone = customers.some(
    (c, i) => c.phoneNumber === trimmedPhone && i !== editIndex
  );
  if (isDuplicatePhone) {
    toast.error("Phone number already exists");
    return false;
  }

  //  Check duplicate email (if provided)
  if (trimmedEmail) {
    const isDuplicateEmail = customers.some(
      (c, i) => c.email?.toLowerCase() === trimmedEmail && i !== editIndex
    );
    if (isDuplicateEmail) {
      toast.error("Email already exists");
      return false;
    }
  }

  return true;
};



  const handleSave = async () => {
    if (!validateForm()) return;
    await handleSaveAction(async () => {
    const customerData = {
      name: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      email: email.trim(),
    };
  
    try {
      if (editIndex !== null) {
        // PUT request for updating customer
        const id = customers[editIndex].id;
        const response = await axios.put(`${BACKEND_SERVER_URL}/api/addsupplier/${id}`, customerData);
        const updated = [...customers];
        updated[editIndex] = response.data;
        setCustomers(updated);
        toast.success("Supplier updated successfully");
      } else {
        // POST request for adding new customer
        const response = await axios.post(`${BACKEND_SERVER_URL}/api/addsupplier`, customerData);
        setCustomers((prev) => [response.data, ...prev]); 

        toast.success("Supplier added successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error.response?.data || error.message);
      toast.error("Error saving supplier");
    }
  });
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
      await axios.delete(`${BACKEND_SERVER_URL}/api/addsupplier/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
      toast.success("Supplier deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error.message);
      toast.error("Error deleting supplier");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Master />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.customerContainer}>
        <div className={styles.headerRow}>
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft:'1rem'
            }}
            variant="contained"
            onClick={openModal}
          >
            Add Supplier
          </Button>
          <TextField
            placeholder="Search by Name"
            variant="outlined"
            size="small"
            sx={{marginLeft:'49.5rem'}}
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

        {/* Dialog */}
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          PaperProps={{
            sx: { width: "450px", maxWidth: "90%", borderRadius:'5px' }
          }}>
          <h5 style={{ textAlign: "center", padding:'1.1rem', backgroundColor:"#F5F5F5" }}>
            {editIndex !== null ? "Edit Supplier" : "Add New Supplier"}
          </h5>

          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Supplier Name"
              type="text"
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
  label="Email (optional)"
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
          <DialogActions sx={{padding:'1rem'}}>
            <Button onClick={closeModal} color="primary" variant="outlined">Cancel</Button>
<Button
    onClick={handleSave}
    color="primary"
    variant="contained"
    sx={{ marginRight: "0.5rem" }}
    disabled={isSaving}
  >
    {isSaving
      ? editIndex !== null
        ? "Updating..."
        : "Saving..."
      : editIndex !== null
      ? "Update"
      : "Save"}
  </Button>
          </DialogActions>
        </Dialog>

        {/* Table */}
        <div className={styles.itemList}> 
          <table className={styles.purchaseTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Time</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => {
                  const updatedDateObj = customer.updatedAt ? new Date(customer.updatedAt) : null;

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
                    <tr key={index} className={index % 2 === 0 ? styles.trEven : ""}>
                      <td>{index + 1}</td>
                      <td>{formattedUpdatedDate}</td>
                      <td>{formattedUpdatedTime}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phoneNumber}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address}</td>
                      <td style={{ width: "7rem" }}>
                        <Edit onClick={() => handleEdit(index)} className={styles.actionIcon} />
                        <Delete onClick={() => handleDelete(index)} className={styles.deleteIcon} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Supplier Name not found
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

export default MasterAddSupplier;
