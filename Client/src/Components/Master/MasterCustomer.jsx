import React, { useState, useEffect, useRef } from "react";
import styles from "./MasterCustomer.module.css";
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
import { BACKEND_SERVER_URL } from "../../../Config/config";
import MasterNavbar from "./MasterNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function MasterCustomer() {
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

  const nameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers`);
        console.log("customerr", response)
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
      }
    };

    fetchCustomers();
  }, []);




  const handleSave = async () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    const trimmedName = customerName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = email.trim();
  
    // Validate name
    if (!trimmedName) {
      toast.error("Customer name is required");
      return;
    }
    if (!nameRegex.test(trimmedName)) {
      toast.error("Invalid name. Only letters and spaces allowed");
      return;
    }
  
    // Validate phone
    if (!trimmedPhone) {
      toast.error("Phone number is required");
      return;
    }
    if (!phoneRegex.test(trimmedPhone)) {
      toast.error("Invalid phone number. Only digits allowed (7 to 15 numbers)");
      return;
    }
  
    // Validate email
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      toast.error("Invalid email format");
      return;
    }
  
    // Duplicate checks
    const isDuplicateName = customers.some(
      (cust, idx) =>
        cust.name.toLowerCase() === trimmedName.toLowerCase() && idx !== editIndex
    );
    if (isDuplicateName) {
      toast.error("Customer name already exists");
      return;
    }
  
    const isDuplicatePhone = customers.some(
      (cust, idx) =>
        cust.phoneNumber === trimmedPhone && idx !== editIndex
    );
    if (isDuplicatePhone) {
      toast.error("Phone number already exists");
      return;
    }
  
    const isDuplicateEmail = trimmedEmail
      ? customers.some(
          (cust, idx) => cust.email === trimmedEmail && idx !== editIndex
        )
      : false;
    if (isDuplicateEmail) {
      toast.error("Email already exists");
      return;
    }
  
    // Save or update
    const customerData = {
      name: trimmedName,
      phoneNumber: trimmedPhone,
      address: address.trim(),
      email: trimmedEmail,
    };
  
    try {
      if (editIndex !== null) {
        const id = customers[editIndex].id;
        const response = await axios.put(
          `${BACKEND_SERVER_URL}/api/customers/${id}`,
          customerData
        );
        const updated = [...customers];
        updated[editIndex] = response.data;
        setCustomers(updated);
        toast.success("Customer updated successfully");
      } else {
        const response = await axios.post(
          `${BACKEND_SERVER_URL}/api/customers`,
          customerData
        );
        setCustomers((prev) => [...prev, response.data]);
        toast.success("Customer added successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error.response?.data || error.message);
      toast.error("Error saving customer");
    }
  };
  
  const handleDelete = async (index) => {
    const customer = customers[index];
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );
    if (!confirmed) return;
  
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/customers/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error.message);
      toast.error("Error deleting customer");
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

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <MasterNavbar />
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
            Add Customer
          </Button>
          <TextField
            placeholder="Search by Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginLeft: "49rem" }}
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
          <Dialog
  open={isModalOpen}
  onClose={closeModal}
  PaperProps={{ sx: { width: "450px", maxWidth: "90%", borderRadius:'5px' } }}>
          <h5 style={{ textAlign: "center", padding:'1.1rem', backgroundColor:"#F5F5F5" }}>
          {editIndex !== null ? "Edit Casting Member" : "Add Casting Member"} </h5>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Customer Name"
              type="text"
              sx={{marginTop:'0rem'}}
              fullWidth
              autoComplete="off"
              inputRef={nameRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                  phoneRef.current?.focus();
                }
              }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Phone Number"
              type="tel"
              fullWidth
              autoComplete="off"
              inputRef={phoneRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                  emailRef.current?.focus();
                } else if (e.key === "ArrowUp") {
                  nameRef.current?.focus();
                }
              }}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Email"
              type="email"
              autoComplete="new-email"
              name="newEmail"
              fullWidth
              inputRef={emailRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                  addressRef.current?.focus();
                } else if (e.key === "ArrowUp") {
                  phoneRef.current?.focus();
                }
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Address"
              type="text"
              autoComplete="new-address"
              name="newAddress"
              fullWidth
              multiline
              rows={4}
              inputRef={addressRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  emailRef.current?.focus();
                }
              }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </DialogContent>
             <DialogActions sx={{padding:'1rem'}}>
            <Button onClick={closeModal} color="primary" variant="outlined">Cancel</Button>
            <Button onClick={handleSave} color="primary" variant="contained"  sx={{marginRight:'0.5rem'}}>Save</Button>
      
          </DialogActions>
        </Dialog>

        <div> 
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
                      <td className={styles.tableActions}>
                        <Edit
                          onClick={() => handleEdit(index)}
                          className={styles.actionIcon}
                        />
                        <Delete
                          onClick={() => handleDelete(index)}
                          className={styles.deleteIcon}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className={styles.centerText}>
                    Name not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />



    </>
  );
}

export default MasterCustomer;
