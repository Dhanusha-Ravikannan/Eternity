import React, { useState, useEffect } from "react";
import styles from "./MasterSetting.module.css";
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
        console.error("Error fetching setting members:", error.message);
        toast.error("Failed to fetch setting members");
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
  
    if (!trimmedName) {
      toast.error("Setting member name is required");
      return;
    }
    if (!nameRegex.test(trimmedName)) {
      toast.error("Invalid name. Only letters and spaces allowed");
      return;
    }
  
    // Duplicate check for name
    const isNameDuplicate = customers.some((cust, idx) => {
      return cust.name.toLowerCase() === trimmedName.toLowerCase() && idx !== editIndex;
    });
    if (isNameDuplicate) {
      toast.error("Setting member name already exists");
      return;
    }
  
    if (!trimmedPhone) {
      toast.error("Phone number is required");
      return;
    }
    if (!phoneRegex.test(trimmedPhone)) {
      toast.error("Invalid phone number");
      return;
    }
  
    // Duplicate check for phone
    const isPhoneDuplicate = customers.some((cust, idx) => {
      return cust.phoneNumber === trimmedPhone && idx !== editIndex;
    });
    if (isPhoneDuplicate) {
      toast.error("Phone number already exists");
      return;
    }
  
    // if (!address.trim()) {
    //   toast.error("Address is required");
    //   return;
    // }
  
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      toast.error("Invalid email format");
      return;
    }
  
    // Duplicate check for email (if not empty)
    if (trimmedEmail) {
      const isEmailDuplicate = customers.some((cust, idx) => {
        return cust.email?.toLowerCase() === trimmedEmail.toLowerCase() && idx !== editIndex;
      });
      if (isEmailDuplicate) {
        toast.error("Email already exists");
        return;
      }
    }
  
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
          `${BACKEND_SERVER_URL}/api/setting/${id}`,
          customerData
        );
        const updated = [...customers];
        updated[editIndex] = response.data.setting || response.data;
        setCustomers(updated);
        toast.success("Setting member updated successfully");
      } else {
        const response = await axios.post(
          `${BACKEND_SERVER_URL}/api/setting`,
          customerData
        );
        setCustomers((prev) => [...prev, response.data.setting]);
        toast.success("Setting member saved successfully");
      }
      closeModal();
    } catch (error) {
      console.error(
        "Error saving setting member:",
        error.response?.data || error.message
      );
      toast.error("Failed to save setting member");
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this setting member?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/setting/${id}`);
      const updatedCustomers = customers.filter((customer) => customer.id !== id);
      setCustomers(updatedCustomers);
      toast.success("Setting member deleted successfully");
    } catch (error) {
      console.error(
        "Error deleting setting member:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete setting member");
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
            Add Setting Member
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
            {editIndex !== null ? "Edit Setting Member" : "Add Setting Member"}
          </h5>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Setting Member Name"
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
                      <td style={{ width: "7rem" }}>
                        <Edit
                          onClick={() => handleEdit(index)}
                          className={styles.actionIcon}
                        />
                        <Delete
                          onClick={() => handleDelete(customer.id)}
                          className={styles.deleteIcon}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Name not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}

export default MasterSetting;





