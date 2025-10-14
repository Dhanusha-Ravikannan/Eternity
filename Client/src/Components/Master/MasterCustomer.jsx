import React, { useState, useEffect, useRef } from "react";
import styles from "./MasterCustomer.module.css";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Box
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import MasterNavbar from "./MasterNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateCustomer } from "../../Utils/validationSchemas";

function MasterCustomer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const nameRef = useRef();
  const phoneRef = useRef();
  const balanceRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();

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
    setBalance("");
    setEditIndex(null);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers`);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
      }
    };
    fetchCustomers();
  }, []);

  const handleSave = async () => {
    const customerData = {
      name: customerName.trim() || "",
      phoneNumber: phoneNumber.trim() || "",
      email: email.trim() || "",
      address: address.trim() || "",
      balance: balance.toString().trim() || "",
    };

    const validation = validateCustomer(customerData, customers, editIndex);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    try {
      if (editIndex !== null) {
        const id = customers[editIndex].id;
        const response = await axios.put(
          `${BACKEND_SERVER_URL}/api/customers/${id}`, validation.data );
        const updated = [...customers];
        updated[editIndex] = response.data;
        setCustomers(updated);
        toast.success("Customer updated successfully");
      } else {
        const response = await axios.post( `${BACKEND_SERVER_URL}/api/customers`,validation.data );
        setCustomers((prev) => [ response.data, ...prev]);
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
    if (!window.confirm(`Are you sure you want to delete "${customer.name}"?`)) return;

    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/customers/${customer.id}`);
      const updated = [...customers];
      updated.splice(index, 1);
      setCustomers(updated);
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error.message);
      toast.error("Error deleting customer");
    }
  };

  const handleEdit = (index) => {
    const customer = filteredCustomers[index];
    const originalIndex = customers.findIndex(
      (c) =>
        c.name === customer.name &&
        c.phoneNumber === customer.phoneNumber
    );

    setCustomerName(customer.name || "");
    setPhoneNumber(customer.phoneNumber || "");
    setAddress(customer.address || "");
    setEmail(customer.email || "");
    setBalance(customer.balance !== null && customer.balance !== undefined ? customer.balance.toString() : "");
    setEditIndex(originalIndex);
    openModal();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm)
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
            placeholder="Search by Name or Phone Number"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginLeft: "58rem" }}
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
          PaperProps={{ sx: { width: "400px", maxWidth: "90%", borderRadius:'5px' } }}
        >
          <h5 style={{ textAlign: "center", padding:'1.1rem', backgroundColor:"#F5F5F5" }}>
            {editIndex !== null ? "Edit Customer Member" : "Add Customer Member"}
          </h5>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Customer Name"
              type="text"
              fullWidth
              value={customerName}
              inputRef={nameRef}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && phoneRef.current?.focus()}
            />
                  <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              margin="dense"
              label="Phone Number"
              type="tel"
              fullWidth
              value={phoneNumber}
              inputRef={phoneRef}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && balanceRef.current?.focus()}
            />
            <TextField
              margin="dense"
              label="Balance"
              type="number"
              fullWidth
              value={balance}
              inputRef={balanceRef}
              onChange={(e) => setBalance(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && emailRef.current?.focus()}
            /> </Box>
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={email}
              inputRef={emailRef}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addressRef.current?.focus()}
            />
            <TextField
              margin="dense"
              label="Address"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={address}
              inputRef={addressRef}
              onChange={(e) => setAddress(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ padding:'1rem' }}>
            <Button onClick={closeModal} variant="outlined">Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        <table className={styles.purchaseTable}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => {
              const updatedDateObj = c.updatedAt ? new Date(c.updatedAt) : null;
              return (
                <tr key={i} className={i % 2 === 0 ? styles.trEven : ""}>
                  <td>{i + 1}</td>
                  <td>{updatedDateObj?.toLocaleDateString("en-IN") || "-"}</td>
                  <td>{updatedDateObj?.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}) || "-"}</td>
                  <td>{c.name}</td>
                  <td>{c.phoneNumber}</td>
                  {/* <td>{((c.balance ?? c.openingBalance) ?? 0).toFixed(3)}</td> */}
                  <td>{((c.openingBalance ?? c.balance) ?? 0).toFixed(3)}</td>
                  <td>{c.email}</td>
                  <td>{c.address}</td>

                  <td>
                    <Edit onClick={() => handleEdit(i)} className={styles.actionIcon} />
                    <Delete onClick={() => handleDelete(i)} className={styles.deleteIcon} />
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="9" style={{ textAlign: "center" }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default MasterCustomer;






