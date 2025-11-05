import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Master from "./MasterNavbar";
import styles from "./MasterPurchaseStock.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { Edit, Delete, Search } from "@mui/icons-material";
import {
  TextField,
  MenuItem,
  Button,
  Box,
  InputAdornment,
} from "@mui/material";
import { useSaveButton } from "../../Utils/useSaveButton";

const MasterPurchaseStock = () => {
  const [showModal, setShowModal] = useState(false);
  const [purchaseList, setPurchaseList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [supplierList, setSupplierList] = useState([]);
  const [touchList, setTouchList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { isSaving, handleSaveAction } = useSaveButton();

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: getTodayDate(),
    item: "",
    weight: "",
    touch_id: "",
    touch_value: "",
    purity: "",
    rate: "",
    totalValue: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchPurchases = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_SERVER_URL}/api/purchase`);
      console.log("Qqqqqqqqqqq", data)
      setPurchaseList(data);
    } catch {
      toast.error("Failed to fetch purchases");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_SERVER_URL}/api/addsupplier`);
      setSupplierList(data);
    } catch {
      toast.error("Failed to fetch suppliers");
    }
  };

  const fetchTouchList = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
      setTouchList(data);
    } catch {
      toast.error("Failed to fetch touch list");
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchTouchList();
  }, []);

  const resetForm = () => {
    setFormData({
      supplierId: "",
      purchaseDate: getTodayDate(),
      item: "",
      weight: "",
      touch_id: "",
      touch_value: "",
      purity: "",
      rate: "",
      totalValue: "",
      remarks: "",
    });
    setEditingIndex(null);
  };

  useEffect(() => {
    const w = parseFloat(formData.weight);
    const t = parseFloat(formData.touch_value);
    if (!isNaN(w) && !isNaN(t)) {
      const purity = (w * t) / 100; // formula: weight * touch / 100
      setFormData((prev) => ({ ...prev, purity: purity.toFixed(2) }));
    } else {
      setFormData((prev) => ({ ...prev, purity: "" }));
    }
  }, [formData.weight, formData.touch_value]);

  //  formula updated: totalValue = purity * rate
  useEffect(() => {
    const r = parseFloat(formData.rate);
    const p = parseFloat(formData.purity);
    if (!isNaN(r) && !isNaN(p)) {
      setFormData((prev) => ({
        ...prev,
        totalValue: (p * r).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, totalValue: "" }));
    }
  }, [formData.rate, formData.purity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSaveAction(async () => {
    const payload = {
      supplierId: parseInt(formData.supplierId, 10),
      // createdAt: formData.purchaseDate,
      purchaseDate: formData.purchaseDate, 
      item: formData.item,
      weight: parseFloat(formData.weight),
      touch_id: parseInt(formData.touch_id, 10),
      purity: parseFloat(formData.purity),
      rate: parseFloat(formData.rate),
      totalValue: parseFloat(formData.totalValue),
      remarks: formData.remarks || "",
    };

    try {
      const headers = { headers: { "Content-Type": "application/json" } };
      let data;

      if (editingIndex !== null) {
        // Update existing purchase (using savePurchase endpoint)
        const id = purchaseList[editingIndex].id;
        const res = await axios.put(
          `${BACKEND_SERVER_URL}/api/purchase/purchase/${id}`,
          payload,
          headers
        );
        data = res.data;

        // Replace updated row in state
        setPurchaseList((prev) =>
          prev.map((p, i) => (i === editingIndex ? data : p))
        );
        toast.success("Purchase updated!");
      } else {
        //  Create new purchase (using savePurchase endpoint)
        const res = await axios.post(
          `${BACKEND_SERVER_URL}/api/purchase/purchase`,
          payload,
          headers
        );
        data = res.data;

        // Add new row at end of table
        setPurchaseList((prev) => [...prev, data]);
        toast.success("Purchase submitted!");
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  });
  };

  const handleEdit = (index) => {
    const p = purchaseList[index];
    setFormData({
      supplierId: p.supplierId,
      // purchaseDate: p.createdAt.split("T")[0],
      purchaseDate: p.purchaseDate ? p.purchaseDate.split("T")[0] : "", 
      item: p.item,
      weight: p.weight,
      touch_id: p.touch_id,
      touch_value: p.TouchId?.touch || "",
      purity: p.purity,
      rate: p.rate,
      totalValue: p.totalValue,
      remarks: p.remarks || "",
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const p = purchaseList[index];
    if (!window.confirm(`Delete purchase for supplier ID ${p.supplierId}?`))
      return;
    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/purchase/${p.id}`);
      setPurchaseList((prev) => prev.filter((_, i) => i !== index));
      toast.success("Purchase deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredPurchases = purchaseList.filter((p) =>
    (p.SupplierId?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Master />
      <div className={styles.stockPage}>
        <ToastContainer />
        <div className={styles.search}>
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft: "3rem",
            }}
            variant="contained"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Add Stock Purchase
          </Button>

          <TextField
            placeholder="Search by Supplier Name"
            variant="outlined"
            size="small"
            sx={{ marginLeft: "51.5rem" }}
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

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h5 style={{ textAlign: "center", fontWeight:'530' }}>
                {editingIndex !== null ? "Edit Purchase" : "Add Stock Purchase"}
              </h5>
              <form onSubmit={handleSubmit} className={styles.purchaseForm}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    select
                    label="Select Supplier"
                    name="supplierId"
                    fullWidth
                    required
                    value={formData.supplierId}
                    onChange={handleChange}
                  >
                    {supplierList
                      .filter((s) => s.name.trim())
                      .map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    margin="dense"
                    label="Purchase Date"
                    name="purchaseDate"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />
                  <Box display="flex" gap={2}>
                    <TextField
                      select
                      label="Item"
                      name="item"
                      fullWidth
                      required
                      value={formData.item}
                      onChange={handleChange}
                    >
                      <MenuItem value="Gold">Gold</MenuItem>
                      <MenuItem value="Silver">Silver</MenuItem>
                    </TextField>

                    <TextField
                      label="Weight"
                      name="weight"
                      type="number"
                      autoComplete="off"
                      onWheel={(e) => e.target.blur()}
                      fullWidth
                      required
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField
                      select
                      label="Touch"
                      name="touch_id"
                      fullWidth
                      required
                      value={formData.touch_id}
                      onChange={(e) => {
                        const selected = touchList.find(
                          (t) => t.id === parseInt(e.target.value)
                        );
                        setFormData((prev) => ({
                          ...prev,
                          touch_id: e.target.value,
                          touch_value: selected?.touch || "",
                        }));
                      }}
                    >
                      {touchList.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.touch}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Purity"
                      name="purity"
                      type="number"
                      fullWidth
                      value={formData.purity}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Rate"
                      name="rate"
                      type="number"
                      autoComplete="off"
                      onWheel={(e) => e.target.blur()}
                      fullWidth
                      required
                      value={formData.rate}
                      onChange={handleChange}
                    />

                    <TextField
                      label="Total Value"
                      name="totalValue"
                      type="number"
                      fullWidth
                      value={formData.totalValue}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <TextField
                    label="Remarks"
                    name="remarks"
                    multiline
                    rows={2}
                    fullWidth
                    value={formData.remarks}
                    onChange={handleChange}
                  />

                  <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                      variant="outlined"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
  variant="contained"
  type="submit"
  disabled={isSaving} 
>
  {isSaving
    ? (editingIndex !== null ? "Updating..." : "Saving...")
    : (editingIndex !== null ? "Update" : "Save")}
</Button>

                  
                  </Box>
                </Box>
              </form>
            </div>
          </div>
        )}

<div>
  <table className={styles.purchaseTable}>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Date</th>
        <th>Time</th>
        <th>Name</th>
        <th>Item</th>
        <th>Weight</th>
        <th>Touch</th>
        <th>Purity</th>
        <th>Rate</th>
        <th>Total Value</th>
        <th>Remarks</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  {filteredPurchases.length > 0 ? (
    filteredPurchases.map((p, idx) => {
    
      const purchaseDateObj = p.purchaseDate ? new Date(p.purchaseDate) : null;
      const formattedDate = purchaseDateObj
        ? purchaseDateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";


      const updatedAtObj = p.updatedAt ? new Date(p.updatedAt) : null;
      const formattedTime = updatedAtObj
        ? updatedAtObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "—";

      return (
        <tr key={p.id} className={idx % 2 === 0 ? styles.trEven : ""}>
          <td>{idx + 1}</td>
          <td>{formattedDate}</td>
          <td>{formattedTime}</td>
          <td>{p.SupplierId?.name || "-"}</td>
          <td>{p.item}</td>
          <td>{p.weight}</td>
          <td>{p.TouchId?.touch || "-"}</td>
          <td>{p.purity}</td>
          <td>{p.rate}</td>
          <td>{p.totalValue}</td>
          <td>{p.remarks || "-"}</td>
          <td>
            <Edit style={{ cursor: "pointer" }} onClick={() => handleEdit(idx)} />
            <Delete onClick={() => handleDelete(idx)} className={styles.deleteIcon} />
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={12} style={{ textAlign: "center", padding: "1rem" }}>
        Purchase Name not found
      </td>
    </tr>
  )}
</tbody>

  </table>
</div>

      </div>
    </>
  );
};

export default MasterPurchaseStock;
