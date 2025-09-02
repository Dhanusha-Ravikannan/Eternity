import React, { useState, useEffect } from "react";
import Navbar from "../../Navbar/Navbar";
import { useParams } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
} from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./SettingLotDetails.module.css";

const SettingLotDetails = () => {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const { id: settingPersonId, name, lotNumber } = useParams();
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [assignedItems, setAssignedItems] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [touchList, setTouchList] = useState([]);
  const [viewData, setViewData] = useState({
    filingItems: [],
    receiptWeight: 0,
    stoneCount: 0,
    stoneWeight: 0,
    remarks: "",
    wastage: null,
    scrapItems: [],
  });
  const [fromDatee, setFromDatee] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);

  const [wastagePercent, setWastagePercent] = useState("");
  const [givenGold, setGivenGold] = useState("");

  const [wastageInputs, setWastageInputs] = useState([{ value: "" }]);
  const [closingSummary, setClosingSummary] = useState(null);
  const [active, setActive] = useState(true);
  const [existingWastageId, setExistingWastageId] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(0);

  const applyDateFilter = () => {
    if (!fromDatee || !toDate) {
      setFilteredEntries(assignedItems);
      return;
    }
    const from = new Date(fromDatee);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const filtered = assignedItems.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      return createdAt >= from && createdAt <= to;
    });

    setFilteredEntries(filtered);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const touchRes = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
        const itemRes = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
        setItemsList(itemRes.data);
        setTouchList(touchRes.data);
        console.log("Available Touch", touchRes.data);
        console.log("Available Items", itemRes.data);
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
      }
    };

    fetchDropdownOptions();
  }, []);

  const fetchWastageData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/settingitems/entry/${settingPersonId}/${lotNumber}`
      );

      if (response.data.length > 0) {
        const wastageData = response.data[0];
        setExistingWastageId(wastageData.id);
        setWastagePercent(wastageData.wastage_percentage.toString());
        setGivenGold(wastageData.given_gold?.toString() || "");
        setOpeningBalance(wastageData.opening_balance || 0);

        // If you have multiple wastage inputs, you might need to handle this differently
        if (wastageData.add_wastage) {
          setWastageInputs([{ value: wastageData.add_wastage.toString() }]);
        }
      } else {
        setExistingWastageId(null);
      }
    } catch (error) {
      console.error("Error fetching wastage data:", error);
      setExistingWastageId(null);
    }
  };

  const fetchAssignedItems = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_SERVER_URL}/api/settingentry/person/${settingPersonId}/${lotNumber}`
      );
      setAssignedItems(res.data || []);
      //setActive(res.data.lotFilingMapper?.isactive);
      console.log("Assigned items:", res.data);
    } catch (err) {
      console.error("Error fetching assigned items:", err);
    }
  };

  useEffect(() => {
    fetchAssignedItems();
    fetchWastageData();
  }, [settingPersonId]);

  //  Fetch unassigned items when dialog opens
  useEffect(() => {
    if (open) {
      axios
        .get("http://localhost:5000/api/filingitems/filingitems/available")
        .then((res) => {
          const filtered = res.data.filter(
            (item) =>
              item.type === "Items" &&
              item.status === "Unassigned" &&
              item.stone_option === "WithStone"
          );
          setItems(filtered);
          console.log("Available Setting Items:", filtered);
        })
        .catch((err) => {
          console.error("Error fetching available items:", err);
        });
    }
  }, [open]);

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        setting_person_id: Number(settingPersonId),
        lot_number: String(lotNumber),
        date: fromDate,
        items: selectedItems.map((id) => ({ filing_item_id: id })),
        // filingItemIds: selectedItems, // just array of ids
      };
      console.log("Posting payload:", payload);
      await axios.post("http://localhost:5000/api/settingentry", payload);
      setSelectedItems([]);
      handleClose();
      fetchAssignedItems();
    } catch (err) {
      console.error("Error saving setting entry:", err);
    }
  };

  const handleView = (entry) => {
    setViewData(entry);
    setViewOpen(true);
  };

  const handleViewSave = async () => {
    try {
      const receiptWeight = Number(viewData.receiptWeight || 0);
      const stoneWeight = Number(viewData.stoneWeight || 0);
      const totalProductWeight = receiptWeight;
      const totalScrapWeight =
        viewData.scrapItems?.reduce(
          (sum, item) => sum + Number(item.weight || 0),
          0
        ) || 0;
      const totalIssue = viewData.filingItems
        .reduce((sum, fi) => sum + Number(fi.weight || 0), 0)
        .toFixed(2);
      const currentBalanceWeight =
        totalIssue - totalProductWeight + stoneWeight;
      const balance = currentBalanceWeight - totalScrapWeight;

      const payload = {
        settingEntryId: viewData.id,
        setting_person_id: Number(settingPersonId),
        lot_number: String(lotNumber),
        date: fromDate,
        receiptWeight,
        stoneCount: Number(viewData.stoneCount || 0),
        stoneWeight,
        remarks: viewData.remarks || "",
        wastage: viewData.wastage || "No",
        scrapItems: viewData.scrapItems.map((item) => ({
          setting_item_id: Number(item.item_id),
          touch_id: Number(item.touch_id),
          weight: Number(item.weight || 0),
          purity: Number(item.purity || 0),
          remarks: item.remarks || "",
        })),

        totalProductWeight,
        currentBalanceWeight,
        totalScrapWeight,
        balance,
      };

      console.log("Posting viewData payload:", payload);
      await axios.post(`${BACKEND_SERVER_URL}/api/settingitems`, payload);
      await fetchAssignedItems();
      setViewOpen(false);
    } catch (err) {
      console.error("Error saving view data:", err);
    }
  };

  const handleDeleteScrapItem = async (item, idx) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scrap item?"
    );
    if (!confirmDelete) return;

    try {
      if (!item.id) {
        const updated = viewData.scrapItems.filter((_, i) => i !== idx);
        setViewData({ ...viewData, scrapItems: updated });
        return;
      }
      // await axios.delete(`http://localhost:5000/api/settingitems/${item.id}`);
      await axios.delete(`${BACKEND_SERVER_URL}/api/settingitems/${item.id}`);
      const updated = viewData.scrapItems.filter((_, i) => i !== idx);
      setViewData({ ...viewData, scrapItems: updated });
    } catch (error) {
      console.error("Error deleting scrap item:", error);
      alert("Failed to delete scrap item.");
    }
  };

  const resetFilter = () => {
    setFromDatee("");
    setToDate("");
    setFilteredEntries(assignedItems);
  };

  const handleSaveSummary = async () => {
    try {
      console.log("ssssssss", additionalGold);

      const data = {
        total_stone_count: totalStoneCount,
        total_wastage: totalWastage,
        balance: parseFloat(getOverallBalance()),
        wastage_percentage: parseFloat(wastagePercent) || 0,
        given_gold: additionalGold,
        add_wastage: manualWastageSum,
        overall_wastage: totalWastage,
        closing_balance: closingBalance,
        opening_balance: openingBalance,
        setting_person_id: settingPersonId,
        lotId: lotNumber,
      };

      let response;
      if (existingWastageId) {
        // Update existing wastage record
        response = await axios.put(
          `${BACKEND_SERVER_URL}/api/settingitems/wastage/${existingWastageId}`,
          data
        );
      } else {
        // Create new wastage record
        response = await axios.post(
          `${BACKEND_SERVER_URL}/api/settingitems/wastage`,
          data
        );
        setExistingWastageId(response.data.id);
      }

      localStorage.setItem("settingSummary", JSON.stringify(data));
      setClosingSummary(data);

      alert(`Summary ${existingWastageId ? "updated" : "saved"} successfully!`);
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary. Check console for details.");
    }
  };

  const handleCloseJobcard = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/settingitems/close-jobcard`,
        {
          setting_person_id: settingPersonId,
          current_lot_number: lotNumber,
        }
      );

      // Redirect to the new lot
      window.location.href = `/settinglot/${settingPersonId}/${name}/${response.data.newLotNumber}`;

      alert("Jobcard closed and new lot created successfully!");
    } catch (error) {
      console.error("Error closing jobcard:", error);
      alert("Failed to close jobcard. Check console for details.");
    }
  };

  useEffect(() => {
    setFilteredEntries(assignedItems);
  }, [assignedItems]);

  /*   const getOverallBalance = () => {
    return filteredEntries
      .reduce((total, group) => {
        if (!group.afterWeight) return total;

        const issueSum = group.items.reduce(
          (sum, item) => sum + parseFloat(item.beforeWeight || 0),
          0
        );

        const afterWeight = parseFloat(group.afterWeight || 0);
        const stoneWeight = parseFloat(group.stoneWeight || 0);
        const scrapWeight = parseFloat(
          getTotalScrapWeight(group.scrapItems || [])
        );

        const balance = issueSum - (afterWeight - stoneWeight) - scrapWeight;

        return total + (isNaN(balance) ? 0 : balance);
      }, 0)
      .toFixed(2);
  }; */

  const getOverallBalance = () => {
    return filteredEntries
      .reduce((total, entry) => {
        // Calculate total issue weight from filing items
        const issueSum = entry.filingItems.reduce(
          (sum, item) => sum + parseFloat(item.weight || 0),
          0
        );

        // Get other weights
        const receiptWeight = parseFloat(entry.receiptWeight || 0);
        const stoneWeight = parseFloat(entry.stoneWeight || 0);

        // Calculate scrap weight
        const scrapWeight = entry.scrapItems
          ? entry.scrapItems.reduce(
              (sum, item) => sum + parseFloat(item.weight || 0),
              0
            )
          : 0;

        // Calculate balance for this entry
        const balance = issueSum - receiptWeight + stoneWeight - scrapWeight;

        return total + (isNaN(balance) ? 0 : balance);
      }, 0)
      .toFixed(2);
  };
  const handleWastageInputChange = (index, value) => {
    const newInputs = [...wastageInputs];
    newInputs[index].value = value;
    setWastageInputs(newInputs);
  };

  const getTotalStoneCount = () => {
    return filteredEntries
      .reduce((total, group) => {
        const count = parseFloat(group.stoneCount || 0);
        return total + (isNaN(count) ? 0 : count);
      }, 0)
      .toFixed(2);
  };

  const totalStoneCount = getTotalStoneCount();

  const totalIssueWeight = selectedItems.reduce(
    (sum, item) => sum + parseFloat(item.beforeWeight || 0),
    0
  );

  const manualWastageSum = wastageInputs.reduce(
    (sum, w) => sum + (parseFloat(w.value) || 0),
    0
  );

  const totalWastageFromPercentage =
    (Number(totalStoneCount) * Number(wastagePercent || 0)) / 100;

  const totalWastage =
    manualWastageSum + totalWastageFromPercentage + openingBalance;

  const additionalGold = parseFloat(givenGold) || 0;

  const closingBalance =
    parseFloat(getOverallBalance()) - parseFloat(totalWastage);

  const finalClosingBalance = closingBalance + Number(givenGold || 0);

  return (
    <>
      <Navbar />
      <h5 className={styles.heading}>Setting Lot Details</h5>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1rem",
        }}
      >
        <TextField
          label="From Datee"
          type="date"
          size="small"
          value={fromDatee}
          onChange={(e) => setFromDatee(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ml: "2rem" }}
        />
        <TextField
          label="To Date"
          type="date"
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={applyDateFilter}>
          {" "}
          Filter{" "}
        </Button>
        <Button variant="outlined" onClick={resetFilter}>
          Reset
        </Button>
        <Button
          style={{
            backgroundColor: "#F5F5F5",
            color: "black",
            borderColor: "#25274D",
            borderStyle: "solid",
            borderWidth: "2px",
            marginLeft: "49rem",
          }}
          variant="contained"
          onClick={handleOpen}
        >
          Add Setting
        </Button>
      </div>

      {/* Main Table */}
      <table
        className={styles.table}
        border="1"
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {/* <div className={styles.tableContainer}> */}

        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Time</th>
            <th>Item</th>
            <th>Weight</th>
            <th>Touch</th>
            <th>Purity</th>
            <th>Remarks</th>
            <th>Stone Wt</th>
            <th>Stone Count</th>
            <th>Receipt Wt</th>
            <th>Wastage</th>
            <th>Scrap Item </th>
            <th>Scrap Item Qty</th>
            <th>Total Product Wt</th>
            <th>Current Balance Wt</th>
            <th>Total Scrap Wt</th>
            <th>Balance </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => (
              <>
                {entry.filingItems.map((fi, i) => (
                  <tr key={fi.id}>
                    {i === 0 && (
                      <>
                        <td rowSpan={entry.filingItems.length}>{index + 1}</td>
                        <td rowSpan={entry.filingItems.length}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {new Date(entry.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </>
                    )}
                    <td>{fi.item_name}</td>
                    <td>{fi.weight}</td>
                    <td>{fi.touch}</td>
                    <td>{fi.purity}</td>
                    <td>{fi.remarks}</td>

                    {i === 0 && (
                      <>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.stoneWeight}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.stoneCount}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.receiptWeight}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.wastage}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {(entry.scrapItems || [])
                            .map((item) => item.itemName)
                            .join(", ")}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {(entry.scrapItems || []).length}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.totalProductWeight?.toFixed(2)}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.currentBalanceWeight?.toFixed(2)}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.totalScrapWeight?.toFixed(2)}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          {entry.balance?.toFixed(2)}
                        </td>
                        <td rowSpan={entry.filingItems.length}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleView(entry)}
                          >
                            View
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            ))
          ) : (
            <tr>
              <td colSpan="19" style={{ textAlign: "center" }}>
                No assigned items yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Box
        sx={{
          ml: 4,
          p: 2,
          border: "1px solid #ccc",
          borderRadius: "8px",
          minWidth: "70px",
          height: "fit-content",
          mt: 1,
          mr: 10,
        }}
      >
        <Typography sx={{ marginLeft: "5rem", color: "darkblue" }}>
          <b> Opening Balance: {openingBalance.toFixed(0)} </b>{" "}
        </Typography>{" "}
        <hr />
        <Typography
          sx={{ color: "red", fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Monthly Wastage
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Total Stone Count:</strong> {getTotalStoneCount()} g
        </Typography>
        <TextField
          label="Wastage (%)"
          type="number"
          fullWidth
          size="small"
          value={wastagePercent}
          onChange={(e) => setWastagePercent(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Wastage Values (g) Optional:
          </Typography>
          {wastageInputs.map((input, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <TextField
                label={`Wastage ${index + 1}`}
                type="number"
                value={input.value}
                onChange={(e) =>
                  handleWastageInputChange(index, e.target.value)
                }
                size="small"
                sx={{ flexGrow: 1, mr: 1 }}
              />
            </Box>
          ))}
          {/* <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addWastageInput}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Wastage
                  </Button> */}
        </Box>
        <Typography sx={{ mt: 2 }}>
          <strong>Total Wastage:</strong> {Number(totalStoneCount).toFixed(2)} ×{" "}
          {Number(wastagePercent) || 0} / 100 ={" "}
          <strong>
            {!isNaN(totalWastage) ? Number(totalWastage).toFixed(2) : "0.00"} g
          </strong>
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Overall Balance:</strong>
          {getOverallBalance()}g
        </Typography>
        <Typography sx={{ mt: 1, color: "red" }}>
          <strong>Closing Balance:</strong> {closingBalance.toFixed(2)}g
        </Typography>
        {closingBalance < 0 && (
          <TextField
            label="Given Gold from owner (g)"
            type="number"
            fullWidth
            size="small"
            value={givenGold}
            onChange={(e) => setGivenGold(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
        <Typography
          sx={{
            mt: 2,
            fontWeight: "bold",
            color:
              finalClosingBalance > 0
                ? "green"
                : finalClosingBalance < 0
                  ? "red"
                  : "black",
          }}
        >
          {finalClosingBalance > 0
            ? `Worker should give ${Math.abs(finalClosingBalance).toFixed(2)}g to Owner`
            : finalClosingBalance < 0
              ? `Owner should give ${Math.abs(finalClosingBalance).toFixed(2)}g to Worker`
              : "No balance due"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            mt: 3,
            width: "100%",
            backgroundColor: "#1a1a1f",
            color: "white",
            textAlign: "center",
          }}
          onClick={handleSaveSummary}
        >
          {existingWastageId ? "Update Summary" : "Save Summary"}
        </Button>
        {/*  <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2, width: "100%" }}
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to close this jobcard?"
            );
            if (confirmed) {
              const existingLots =
                JSON.parse(localStorage.getItem("settingLots")) || [];
              const newLot = {
                id: existingLots.length + 1,
                entries,
                summary: {
                  totalStoneCount,
                  wastagePercent,
                  totalWastage: totalWastage.toFixed(2),
                  overallBalance: getOverallBalance(),
                  closingBalance: closingBalance.toFixed(2),
                  givenGold,
                  finalClosingBalance: finalClosingBalance.toFixed(2),
                },
              };
              localStorage.setItem(
                "settingLots",
                JSON.stringify([...existingLots, newLot])
              );
              alert("Jobcard closed successfully!");
              window.location.href = "/settinglot";
            }
          }}
        >
          Close Jobcard
        </Button> */}
        {active && (
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            onClick={handleCloseJobcard}
          >
            Close Jobcard
          </Button>
        )}
      </Box>

      {/* Add Setting Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Setting Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ ml: 0, mt: 3, mb: 2, width: "200px" }}
          />

          <table
            className={styles.table}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            <thead>
              <tr>
                <th>Select</th>
                <th>Item</th>
                <th>Weight</th>
                <th>Touch</th>
                <th>Purity</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </td>
                    <td>{item.filingitem?.name || "-"}</td>
                    <td>{item.weight ?? "-"}</td>
                    <td>{item.touch?.touch ?? "-"}</td>
                    <td>{item.item_purity ?? "-"}</td>
                    <td>{item.remarks || "-"}</td>
                    <td>{item.status || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assigned Items</DialogTitle>
        <DialogContent>
          {viewData ? (
            <>
              {/* Filing Items Table */}
              <table
                className={styles.table}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                  borderCollapse: "collapse",
                }}
                border="1"
              >
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Item</th>
                    <th>Weight</th>
                    <th>Touch</th>
                    <th>Purity</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {viewData.filingItems.map((fi, index) => (
                    <tr key={fi.id}>
                      <td>{index + 1}</td>
                      <td>{fi.item_name}</td>
                      <td>{fi.weight}</td>
                      <td>{fi.touch}</td>
                      <td>{fi.purity}</td>
                      <td>{fi.remarks}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>
                      <strong>Total Issue</strong>
                    </td>
                    <td>
                      <strong>
                        {viewData.filingItems
                          .reduce((sum, fi) => sum + Number(fi.weight || 0), 0)
                          .toFixed(2)}
                      </strong>
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>

              {/* Receipt / Stone / Remarks */}
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <TextField
                  label="Receipt Weight"
                  type="number"
                  fullWidth
                  required
                  value={viewData.receiptWeight || ""}
                  onChange={(e) =>
                    setViewData({
                      ...viewData,
                      receiptWeight: Number(e.target.value),
                    })
                  }
                />
                <TextField
                  label="Stone Count"
                  type="number"
                  fullWidth
                  required
                  value={viewData.stoneCount || ""}
                  onChange={(e) =>
                    setViewData({
                      ...viewData,
                      stoneCount: Number(e.target.value),
                    })
                  }
                />
                <TextField
                  label="Stone Weight"
                  type="number"
                  fullWidth
                  required
                  value={viewData.stoneWeight || ""}
                  onChange={(e) =>
                    setViewData({
                      ...viewData,
                      stoneWeight: Number(e.target.value),
                    })
                  }
                />
                {/* <TextField
            label="Remarks"
            type="text"
            fullWidth required
            value={viewData.remarks || ''}
            onChange={(e) => setViewData({ ...viewData, remarks: e.target.value })}
          />      */}
              </Box>

              {/* Totals & Wastage */}
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Typography>
                  <strong>Total Product Weight:</strong>{" "}
                  {(viewData.receiptWeight || 0).toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Current Balance Weight:</strong>{" "}
                  {(
                    viewData.filingItems.reduce(
                      (sum, fi) => sum + Number(fi.weight || 0),
                      0
                    ) -
                    (viewData.receiptWeight || 0) +
                    (viewData.stoneWeight || 0)
                  ).toFixed(2)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    marginLeft: "7.1rem",
                  }}
                >
                  <Typography>
                    <b>Wastage:</b>
                  </Typography>
                  <Button
                    variant={
                      viewData.wastage === "Yes" ? "contained" : "outlined"
                    }
                    color="success"
                    onClick={() => setViewData({ ...viewData, wastage: "Yes" })}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={
                      viewData.wastage === "No" ? "contained" : "outlined"
                    }
                    color="error"
                    onClick={() => setViewData({ ...viewData, wastage: "No" })}
                  >
                    No
                  </Button>
                </Box>
              </Box>

              {/* Scrap Items Table */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const newScrap = [
                      ...(viewData.scrapItems || []),
                      {
                        itemName: "",
                        weight: "",
                        touch: "",
                        purity: "",
                        remarks: "",
                      },
                    ];
                    setViewData({ ...viewData, scrapItems: newScrap });
                  }}
                >
                  Add Scrap Items
                </Button>

                <table
                  className={styles.table}
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    borderCollapse: "collapse",
                  }}
                  border="1"
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Item Name</th>
                      <th>Weight</th>
                      <th>Touch</th>
                      <th>Purity</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewData.scrapItems || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <TextField
                            select
                            size="small"
                            value={item.item_id || ""}
                            onChange={(e) => {
                              const updated = [...viewData.scrapItems];
                              const selectedItem = itemsList.find(
                                (itm) => itm.id === Number(e.target.value)
                              );
                              updated[idx].item_id = selectedItem?.id;
                              updated[idx].itemName = selectedItem?.name;
                              setViewData({ ...viewData, scrapItems: updated });
                            }}
                          >
                            {itemsList.map((itm) => (
                              <MenuItem key={itm.id} value={itm.id}>
                                {itm.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>
                          <TextField
                            size="small"
                            type="number"
                            value={item.weight}
                            onChange={(e) => {
                              const updated = [...viewData.scrapItems];
                              updated[idx].weight = e.target.value;
                              const weight = Number(e.target.value || 0);
                              const touch = Number(updated[idx].touch || 0);
                              updated[idx].purity = (
                                (weight * touch) /
                                100
                              ).toFixed(2);

                              setViewData({ ...viewData, scrapItems: updated });
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            select
                            size="small"
                            value={item.touch_id || ""}
                            onChange={(e) => {
                              const updated = [...viewData.scrapItems];
                              const selectedTouch = touchList.find(
                                (t) => t.id === Number(e.target.value)
                              );
                              updated[idx].touch_id = selectedTouch?.id;
                              updated[idx].touch = selectedTouch?.touch;

                              const weight = Number(updated[idx].weight || 0);
                              updated[idx].purity = (
                                (weight * selectedTouch.touch) /
                                100
                              ).toFixed(2);

                              setViewData({ ...viewData, scrapItems: updated });
                            }}
                          >
                            {touchList.map((tch) => (
                              <MenuItem key={tch.id} value={tch.id}>
                                {tch.touch}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>{item.purity || ""}</td>
                        <td>
                          <TextField
                            size="small"
                            value={item.remarks}
                            onChange={(e) => {
                              const updated = [...viewData.scrapItems];
                              updated[idx].remarks = e.target.value;
                              setViewData({ ...viewData, scrapItems: updated });
                            }}
                          />
                        </td>
                        <td>
                          <Button
                            onClick={() => handleDeleteScrapItem(item, idx)}
                          >
                            <DeleteIcon style={{ color: "red" }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Scrap Totals */}
                <Box sx={{ mt: 2, display: "flex", gap: 4 }}>
                  <Typography>
                    <strong>Total Scrap Weight:</strong>{" "}
                    {(
                      viewData.scrapItems?.reduce(
                        (sum, i) => sum + Number(i.weight || 0),
                        0
                      ) || 0
                    ).toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Balance:</strong>{" "}
                    {(
                      (viewData.filingItems?.reduce(
                        (sum, fi) => sum + Number(fi.weight || 0),
                        0
                      ) || 0) -
                      (viewData.receiptWeight || 0) +
                      (viewData.stoneWeight || 0) -
                      (viewData.scrapItems?.reduce(
                        (sum, i) => sum + Number(i.weight || 0),
                        0
                      ) || 0)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <p>No data available</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 30 }}
            disabled={viewData.wastage !== "Yes" && viewData.wastage !== "No"}
            onClick={handleViewSave}
          >
            Save
          </Button>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingLotDetails;
