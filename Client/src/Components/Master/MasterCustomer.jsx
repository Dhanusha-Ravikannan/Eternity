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
  
    if (!trimmedName) {
      alert("Customer name is required.");
      return;
    }
    if (!nameRegex.test(trimmedName)) {
      alert("Invalid name. Only letters and spaces are allowed for NAME.");
      return;
    }
  
  
    const isDuplicate = customers.some((cust, idx) => {
      return (
        cust.name.toLowerCase() === trimmedName.toLowerCase() &&
        idx !== editIndex
      );
    });
  
    if (isDuplicate) {
      alert("Customer name already exists. Please use a different name.");
      return;
    }
  
    if (!phoneNumber.trim()) {
      alert("Phone number is required.");
      return;
    }
    if (!phoneRegex.test(phoneNumber.trim())) {
      alert("Invalid phone number. Only digits allowed (7 to 15 numbers).");
      return;
    }

    if (!address.trim()) {
      alert("Address is required.");
      return;
    }

    if (email.trim() && !emailRegex.test(email.trim())) {
      alert("Invalid email format.");
      return;
    }

    const customerData = {
      name: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      email: email.trim(),
    };

    try {
      if (editIndex !== null) {
        const id = customers[editIndex].id;
        const response = await axios.put( `${BACKEND_SERVER_URL}/api/customers/${id}`,customerData);
        const updated = [...customers];
        updated[editIndex] = response.data;
        setCustomers(updated);
      } else {
        const response = await axios.post( `${BACKEND_SERVER_URL}/api/customers`,customerData );
        setCustomers((prev) => [...prev, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error(
        "Error saving customer:",
        error.response?.data || error.message
      );
      alert(
        "Error: " + (error.response?.data?.error || "Something went wrong")
      );
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
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );
    if (!confirmed) return;
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/customers/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error(
        "Error deleting customer:",
        error.response?.data || error.message
      );
      alert(
        "Error: " + (error.response?.data?.error || "Something went wrong")
      );
    }
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
            sx={{ marginLeft: "50rem" }}
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
          PaperProps={{
            style: {
              width: "450px",
              maxWidth: "90%",
              padding: "1rem",
            },
          }}
        >
          <DialogTitle style={{ color: "#a33768" }}>
            {editIndex !== null ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogContent>
            <br />
            <TextField
              autoFocus
              margin="dense"
              label="Customer Name"
              type="text"
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

          <DialogActions>
            <Button onClick={closeModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <div className={styles.itemList}>
          <table className={styles.customerTable}>
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
                  const createdDate = new Date(customer.createdAt);
                  const formattedDate = createdDate.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  const formattedTime = createdDate.toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{formattedDate}</td>
                      <td>{formattedTime}</td>
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
    </>
  );
}

export default MasterCustomer;
