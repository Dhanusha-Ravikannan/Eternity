import React, { useState, useEffect } from "react";
import styles from "./MasterCasting.module.css";
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
import Master from "./MasterNavbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateCustomer } from "../../Utils/validationSchemas";
import { useSaveButton } from "../../Utils/useSaveButton";

function MasterCasting() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [balance, setBalance] = useState("");

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
    setBalance("");

  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/casting`);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
        toast.error("Failed to fetch casting members ");
      }
    };

    fetchCustomers();
  }, []);

  const handleSave = async () => {
    await handleSaveAction(async () => {
    const castingData = {
      name: customerName.trim() || "",
      phoneNumber: phoneNumber.trim() || "",
      email: email.trim() || "",
      address: address.trim() || "",
      balance: balance.toString().trim() || "",
    };

    const validation = validateCustomer(castingData, customers, editIndex);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    try {
      if (editIndex !== null) {
        const id = customers[editIndex].id;
        const response = await axios.put( `${BACKEND_SERVER_URL}/api/casting/${id}`,validation.data );
        const updated = [...customers];
        updated[editIndex] = response.data;
        setCustomers(updated);
        toast.success("Casting member updated successfully");
      } else {
        const response = await axios.post( `${BACKEND_SERVER_URL}/api/casting`, validation.data );
        setCustomers((prev) => [ response.data, ...prev]);
        toast.success("Casting member saved successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving casting member:", error.response?.data || error.message);
      toast.error("Failed to save casting member");
    }
  });
  };

  const handleEdit = (index) => {
    const customer = filteredCustomers[index];
    const originalIndex = customers.findIndex(
      (c) => c.name === customer.name && c.phoneNumber === customer.phoneNumber );

    setCustomerName(customer.name || "");
    setPhoneNumber(customer.phoneNumber || "");
    setAddress(customer.address || "");
    setEmail(customer.email || "");
    setBalance(customer.balance !== null && customer.balance !== undefined ? customer.balance.toString() : "");
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
      await axios.delete(`${BACKEND_SERVER_URL}/api/casting/${customer.id}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
      toast.success("Casting member deleted successfully ");
    } catch (error) {
      console.error("Error deleting customer:", error.response?.data || error.message);
      toast.error("Failed to delete casting member ");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  customer.phoneNumber.includes(searchTerm)
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
              marginLeft:'1.2rem'
            }}
            variant="contained"
            onClick={openModal}
          >
            Add Casting / Melting
          </Button>

          <TextField
            placeholder="Search by Name or Phone"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginLeft: "54rem" }}
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
    sx: { width: "400px", maxWidth: "90%", borderRadius: "5px" },
  }}
>
  <h5
    style={{
      textAlign: "center",
      padding: "1.1rem",
      backgroundColor: "#F5F5F5",
    }}
  >
    {editIndex !== null
      ? "Edit Casting / Melting Member"
      : "Add Casting / Melting Member"}
  </h5>

  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Casting Member Name"
      type="text"
      fullWidth
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
    />

        <Box sx={{ display: "flex", gap: 2 }}>
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
        label="Balance"
        type="number"
        fullWidth
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
      />
       </Box>
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
      rows={3}
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
    disabled={isSaving}
  >
    {isSaving
      ? (editIndex !== null ? "Updating..." : "Saving...")
      : (editIndex !== null ? "Update" : "Save")}
  </Button>
  </DialogActions>
</Dialog>

        <div className={styles.itemList}>
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
                      <td>{Number(customer.balance).toFixed(3)}</td>
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

export default MasterCasting;
