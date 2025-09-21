import React, { useState, useEffect } from "react";
import styles from "./MasterBuffing.module.css";
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

function MasterBuffing() {
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
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/buffing`);
        setCustomers(response.data);
      } catch (error) {
        toast.error("Error fetching buffing members", { position: "top-right" });
        console.error("Error fetching customers:", error.message);
      }
    };
    fetchCustomers();
  }, []);


  const validateForm = () => {
    const trimmedName = customerName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = email.trim();
  
    if (!trimmedName) {
      toast.error("Name is required", { position: "top-right" });
      return false;
    }
    if (!trimmedPhone || !/^[0-9]{10}$/.test(trimmedPhone)) {
      toast.error("Enter a valid 10-digit phone number", { position: "top-right" });
      return false;
    }
    if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.error("Enter a valid email address", { position: "top-right" });
      return false;
    }
    // if (!address.trim()) {
    //   toast.error("Address is required", { position: "top-right" });
    //   return false;
    // }
  
    // Duplicate name check
    const duplicateName = customers.find(
      (c, idx) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        idx !== editIndex
    );
    if (duplicateName) {
      toast.error("Buffing member with this name already exists", { position: "top-right" });
      return false;
    }
  
    // Duplicate phone check
    const duplicatePhone = customers.find(
      (c, idx) => c.phoneNumber === trimmedPhone && idx !== editIndex
    );
    if (duplicatePhone) {
      toast.error("Phone number already exists", { position: "top-right" });
      return false;
    }
  
    // Duplicate email check (if email is not empty)
    if (trimmedEmail) {
      const duplicateEmail = customers.find(
        (c, idx) => c.email?.toLowerCase() === trimmedEmail.toLowerCase() && idx !== editIndex
      );
      if (duplicateEmail) {
        toast.error("Email already exists", { position: "top-right" });
        return false;
      }
    }
  
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const customerData = { name: customerName, phoneNumber, address, email };

    try {
      if (editIndex !== null) {
        // Update
        const id = customers[editIndex].id;
        const response = await axios.put(
          `${BACKEND_SERVER_URL}/api/buffing/${id}`,
          customerData
        );
        const updated = [...customers];
        updated[editIndex] = response.data.buffing || response.data;
        setCustomers(updated);
        toast.success("Buffing member updated successfully", {
          position: "top-right",
        });
      } else {
        // Create
        const response = await axios.post(
          `${BACKEND_SERVER_URL}/api/buffing`,
          customerData
        );
        setCustomers((prev) => [...prev, response.data.buffing]);
        toast.success("Buffing member added successfully", {
          position: "top-right",
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving buffing member:", error.response?.data || error.message);
      toast.error("Error saving buffing member", { position: "top-right" });
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
      await axios.delete(`${BACKEND_SERVER_URL}/api/buffing/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
      toast.success("Buffing member deleted successfully", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Error deleting buffing member:", error.response?.data || error.message);
      toast.error("Error deleting buffing member", { position: "top-right" });
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
              marginLeft:'1rem'
            }}
            variant="contained"
            onClick={openModal}
          >
            Add Buffing Member
          </Button>
          <TextField
            placeholder="Search by Name"
            variant="outlined"
            size="small"
            sx={{ marginLeft: "46rem" }}
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

        {/* Modal */}
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          PaperProps={{
            sx: { width: "450px", maxWidth: "90%", borderRadius: "5px" },
          }}
        >
          <h5
            style={{
              textAlign: "center",
              padding: "1.1rem",
              backgroundColor: "#F5F5F5",
            }}
          >
            {editIndex !== null ? "Edit Buffing Member" : "Add Buffing Member"}
          </h5>

          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Buffing Member Name"
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

          <DialogActions sx={{ padding: "1rem" }}>
            <Button onClick={closeModal} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              color="primary"
              variant="contained"
              sx={{ marginRight: "0.5rem" }}
            >
              Save
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
                  const updatedDateObj = customer.updatedAt
                    ? new Date(customer.updatedAt)
                    : null;

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
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    Name not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default MasterBuffing;
