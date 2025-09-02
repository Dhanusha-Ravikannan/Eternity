import React, { useState, useEffect } from "react";
import Navbar from "../../Navbar/Navbar";
import styles from "./BuffingLotDetails.module.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { major } from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import {
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";

const BuffingLotDetails = () => {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedItems, setSelectedItems] = useState([]);
  const [mainTableData, setMainTableData] = useState([]);
  major;
  const [popupData, setPopupData] = useState([]);
  const [viewEntry, setViewEntry] = useState(null);
  const { id, name, lotNumber } = useParams();
  const [receiptWeight, setReceiptWeight] = useState("");
  const [remarks, setRemarks] = useState("");

  const [wastageInputs, setWastageInputs] = useState([{ value: "" }]);
  const [wastagePercentage, setWastagePercentage] = useState("");
  const [givenGold, setGivenGold] = useState("");
  const [closingSummary, setClosingSummary] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(0);

  const [existingWastageId, setExistingWastageId] = useState(null);
  const [active, setActive] = useState(true);

  const [wastage, setWastage] = useState("No");
  const [scrapItems, setScrapItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [touchOptions, setTouchOptions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [itemRes, touchRes] = await Promise.all([
          axios.get(`${BACKEND_SERVER_URL}/api/additem`),
          axios.get(`${BACKEND_SERVER_URL}/api/addtouch`),
        ]);
        setItemOptions(itemRes.data);
        setTouchOptions(touchRes.data);
        console.log(setItemOptions);
      } catch (err) {
        console.error("Error fetching dropdowns", err);
      }
    };
    fetchDropdowns();
  }, []);

  const addScrapItem = () => {
    setScrapItems([
      ...scrapItems,
      { item: "", weight: "", touch: "", purity: "", remarks: "" },
    ]);
  };

  const fetchBuffingEntries = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/buffingentry/person/${id}/${lotNumber}`
      );

      setActive(res.data.lotFilingMapper?.isactive);

      const formatted = res.data.map((entry) => ({
        id: entry.id,
        date: new Date(entry.createdAt).toISOString().split("T")[0],
        items:
          entry.lotBuffingMapper.length > 0
            ? entry.lotBuffingMapper.map((mapper) => ({
                id: mapper.filing_item_id || mapper.setting_item_id,
                item:
                  mapper.filing_item_name ||
                  mapper.setting_item_name ||
                  entry.item_name,
                weight: mapper.filing_item_weight || entry.casting_item_weight,
                touch: mapper.filing_item_touch || entry.touch,
                purity: mapper.filing_item_purity || entry.casting_item_purity,
                remarks:
                  mapper.filing_item_remarks || entry.casting_item_remarks,
                stoneCount: "-",
                stoneWeight: "-",
              }))
            : [
                {
                  id: entry.casting_item_id,
                  item: entry.item_name,
                  weight: entry.casting_item_weight,
                  touch: entry.touch,
                  purity: entry.casting_item_purity,
                  remarks: entry.casting_item_remarks,
                  stoneCount: "-",
                  stoneWeight: "-",
                },
              ],

        receiptWeight: entry.receiptWeight || "-",
        remarks: entry.remarks || "",
        wastage: entry.wastage || "-",
        scrapItems:
          entry.buffingItems?.map((bi) => ({
            id: bi.id,
            itemName: bi.item_name,
            weight: bi.scrap_weight,
            touch: bi.touch,
            purity: bi.item_purity,
            remarks: bi.scrap_remarks,
          })) || [],

        totalScrapWeight: entry.totalScrapWeight || "-",
        balance: entry.balance || "-",
      }));

      setMainTableData(formatted);
      console.log("buffing datas", formatted);
    } catch (error) {
      console.error("Error fetching buffing entries:", error);
    }
  };

  const fetchWastageData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/buffing/entry/${id}/${lotNumber}`
      );

      console.log("Sssssssssssssssssssssssssssssssssop", response);

      if (response.data.length > 0) {
        const wastageData = response.data[0];
        setExistingWastageId(wastageData.id);
        setWastagePercentage(wastageData.wastage_percentage.toString());
        setGivenGold(wastageData.given_gold?.toString() || "");
        setOpeningBalance(wastageData.opening_balance || 0);

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

  useEffect(() => {
    fetchWastageData();
    fetchBuffingEntries();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!viewEntry) return;

      // Calculate totals
      const totalWeight = viewEntry.items.reduce(
        (sum, item) => sum + (parseFloat(item.weight) || 0),
        0
      );

      const totalScrapWeight = scrapItems.reduce(
        (sum, s) => sum + (parseFloat(s.weight) || 0),
        0
      );

      const balance =
        totalWeight - (parseFloat(receiptWeight) || 0) - totalScrapWeight;

      // Prepare payload with proper buffing_item_id
      const payload = {
        buffingEntryId: viewEntry.id,
        receiptWeight: parseFloat(receiptWeight) || 0,
        remarks,
        wastage,
        totalScrapWeight,
        balance,
        scrapItems: scrapItems
          .filter((s) => s.item)
          .map((s) => ({
            buffing_item_id: parseInt(s.item),
            weight: parseFloat(s.weight) || 0,
            touch_id: s.touch || null,
            item_purity: parseFloat(s.purity) || 0,
            scrap_remarks: s.remarks || "",
          })),
      };

      console.log("Saving Buffing Items:", payload);

      // POST to backend
      await axios.post(`${BACKEND_SERVER_URL}/api/buffingitems`, payload);

      // Update frontend table
      const updatedEntry = {
        ...viewEntry,
        receiptWeight,
        wastage,
        scrapItems: scrapItems.map((s) => ({
          itemName:
            itemOptions.find((opt) => opt.id === parseInt(s.item))?.name || "",
          ...s,
        })),
        totalScrapWeight,
        balance,
      };

      setMainTableData((prev) =>
        prev.map((e) => (e.id === viewEntry.id ? updatedEntry : e))
      );

      alert("Buffing Entry saved successfully!");
      await fetchBuffingEntries();

      setOpen(false);
      setViewEntry(null);
      setScrapItems([]);
      setReceiptWeight("");
      setRemarks("");
      setWastage("No");
    } catch (error) {
      console.error("Error saving Buffing entry:", error);
      alert("Failed to save Buffing Entry");
    }
  };

  console.log(
    "Buffing Datas:",
    `person_id: ${id},`,
    `name: ${name},`,
    `lot_number: ${lotNumber}`
  );

  const handleAssign = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one row.");
      return;
    }

    try {
      const payload = {
        buffing_person_id: parseInt(id),
        lot_number: parseInt(lotNumber),
        items: selectedItems.map((item) => ({
          filing_item_id: item.id,
        })),
      };

      console.log("Posting Buffing Entry:", payload);

      const res = await axios.post(
        "http://localhost:5000/api/buffingentry",
        payload
      );
      const newEntry = {
        id: res.data.entry.id,
        date,
        items: selectedItems,
        receiptWeight: "-",
        wastage: "-",
        scrapItems: [],
        totalScrapWeight: "-",
        balance: "-",
      };
      setMainTableData((prev) => [...prev, newEntry]);

      setPopupData((prev) =>
        prev.filter((item) => !selectedItems.some((sel) => sel.id === item.id))
      );
      setOpen(false);
      setSelectedItems([]);
      alert("Buffing Entry created successfully!");
    } catch (error) {
      console.error("Error assigning buffing entry:", error);

      if (error.response) {
        alert(error.response.data.error || "Failed to create Buffing Entry");
      } else {
        alert("Something went wrong while assigning buffing entry.");
      }
    }
  };

  const handleView = (entry) => {
    setViewEntry(entry);
    setReceiptWeight(entry.receiptWeight !== "-" ? entry.receiptWeight : "");
    setRemarks(entry.remarks || "");
    setWastage(entry.wastage !== "-" ? entry.wastage : "No");

    setScrapItems(
      entry.scrapItems.map((s) => {
        console.log("entry", entry.scrapItems);
        // find touch id from numeric touch value (95, 98 etc.)
        const touchMatch = touchOptions.find((opt) => opt.touch === s.touch);

        return {
          id: s.id,
          buffing_item_id:
            itemOptions.find((opt) => opt.name === s.itemName)?.id || "",
          item: itemOptions.find((opt) => opt.name === s.itemName)?.id || "",
          weight: s.weight,
          touch: touchMatch ? touchMatch.id : "",
          purity: s.purity,
          remarks: s.remarks,
          itemName: s.itemName,
        };
      })
    );

    setOpen(true);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/filingitems/filingitems/available"
        );
        const filtered = res.data.filter(
          (item) =>
            item.stone_option === "WithoutStone" && item.status === "Unassigned"
        );
        console.log("Filtered items from Filing Process", filtered);

        const transformed = filtered.map((item) => ({
          id: item.id,
          item: item.filingitem?.name,
          weight: item.weight,
          touch: item.touch?.touch || "-",
          purity: item.item_purity,
          remarks: item.remarks,
          stoneCount: item.stoneCount || "-",
          stoneWeight: item.stoneWeight || "-",
          status: item.status || "Unassigned",
        }));

        setPopupData(transformed);
      } catch (error) {
        console.error("Error fetching filing items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedItems([]);
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  // http://localhost:5000/api/buffingitems/:id - DELETE

  useEffect(() => {
    setFilteredData(mainTableData);
  }, [mainTableData]);

  const handleFilter = () => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = mainTableData.filter((entry) => {
      const entryDate = new Date(entry.date);

      if (from && to) return entryDate >= from && entryDate <= to;
      if (from) return entryDate >= from;
      if (to) return entryDate <= to;
      return true;
    });

    setFilteredData(filtered);
  };

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(mainTableData);
  };

  // Monthly wastage calculations
  const totalReceipt = filteredData.reduce((sum, entry) => {
    return sum + (parseFloat(entry.receiptWeight) || 0);
  }, 0);

  const manualWastageSum = wastageInputs.reduce(
    (sum, w) => sum + (parseFloat(w.value) || 0),
    0
  );

  // % wastage calculation
  const totalWastageFromPercentage =
    (totalReceipt * (parseFloat(wastagePercentage) || 0)) / 100;

  // Final total wastage = percentage wastage + manual wastage inputs
  const totalWastage = totalWastageFromPercentage + manualWastageSum;

  const totalBalanceSum = filteredData.reduce((sum, entry) => {
    return sum + (parseFloat(entry.balance) || 0);
  }, 0);
  const overallWastage = totalBalanceSum - totalWastage + openingBalance;

  const additionalGold = parseFloat(givenGold) || 0;

  const closingBalance =
    overallWastage < 0 ? overallWastage + additionalGold : overallWastage;

  const settlementMessage =
    closingBalance < 0
      ? "Owner must give to worker"
      : "Worker must give to owner";

  const handleSaveSummary = async () => {
    try {
      const data = {
        total_receipt: totalReceipt,
        total_wastage: totalWastage,
        balance: totalBalanceSum,
        wastage_percentage: parseFloat(wastagePercentage) || 0,
        given_gold: additionalGold,
        add_wastage: manualWastageSum,
        overall_wastage: overallWastage,
        closing_balance: closingBalance,
        opening_balance: openingBalance,
        buffing_person_id: id,
        lotId: lotNumber,
      };

      let response;
      if (existingWastageId) {
        // Update existing wastage record
        response = await axios.put(
          `${BACKEND_SERVER_URL}/api/buffing/wastage/${existingWastageId}`,
          data
        );
      } else {
        // Create new wastage record
        response = await axios.post(
          `${BACKEND_SERVER_URL}/api/buffing/wastage`,
          data
        );
        setExistingWastageId(response.data.id);
      }

      localStorage.setItem("buffingSummary", JSON.stringify(data));
      setClosingSummary(data);

      alert(`Summary ${existingWastageId ? "updated" : "saved"} successfully!`);
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary. Check console for details.");
    }
  };

  console.log("ssss", openingBalance);

  const handleCloseJobcard = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/buffing/close-jobcard`,
        {
          buffing_person_id: id,
          current_lot_number: lotNumber,
        }
      );

      // Redirect to the new lot
      window.location.href = `/buffinglot/${id}/${name}/${response.data.newLotNumber}`;

      alert("Jobcard closed and new lot created successfully!");
    } catch (error) {
      console.error("Error closing jobcard:", error);
      alert("Failed to close jobcard. Check console for details.");
    }
  };

  const addWastageInput = () => {
    setWastageInputs([...wastageInputs, { value: "" }]);
  };

  const removeWastageInput = (index) => {
    const newInputs = [...wastageInputs];
    newInputs.splice(index, 1);
    setWastageInputs(newInputs);
  };

  const handleWastageInputChange = (index, value) => {
    const newInputs = [...wastageInputs];
    newInputs[index].value = value;
    setWastageInputs(newInputs);
  };

  return (
    <>
      <Navbar />
      <h5 className={styles.heading}>Buffing Lot Details</h5>
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
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
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

        <Button variant="outlined" onClick={() => handleFilter()}>
          {" "}
          Filter{" "}
        </Button>
        <Button variant="outlined" onClick={() => handleResetFilter()}>
          Reset
        </Button>

        <Button
          style={{
            backgroundColor: "#F5F5F5",
            color: "black",
            borderColor: "#25274D",
            borderStyle: "solid",
            borderWidth: "2px",
            marginLeft: "47rem",
          }}
          variant="contained"
          onClick={handleClickOpen}
        >
          Add Buffing
        </Button>
      </div>

      <table
        className={styles.table}
        border="1"
        style={{ width: "95%", marginTop: "2rem", marginLeft: "2rem" }}
      >
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Item</th>
            <th>Weight</th>
            <th>Touch</th>
            <th>Purity</th>
            <th>Remarks</th>
            <th>Stone Count</th>
            <th>Stone Weight</th>
            <th>Receipt weight</th>
            <th>Wastage</th>
            <th>Scrap Item Name</th>
            <th>Scrap Quantity</th>
            <th>Total Scrap Weight</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((entry, index) =>
              entry.items.map((item, i) => (
                <tr key={item.id}>
                  {i === 0 && (
                    <>
                      <td rowSpan={entry.items.length}>{index + 1}</td>
                      <td rowSpan={entry.items.length}>{entry.date}</td>
                    </>
                  )}
                  <td>{item.item}</td>
                  <td>{item.weight}</td>
                  <td>{item.touch}</td>
                  <td>{item.purity}</td>
                  <td>{item.remarks}</td>
                  <td>{item.stoneCount || "-"}</td>
                  <td>{item.stoneWeight || "-"}</td>
                  {i === 0 && (
                    <>
                      <td rowSpan={entry.items.length}>
                        {entry.receiptWeight || "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
                        {entry.wastage || "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
                        {entry.scrapItems?.map((s) => s.itemName).join(", ") ||
                          "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
                        {entry.scrapItems?.length || "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
                        {entry.totalScrapWeight || "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
                        {entry.balance || "-"}
                      </td>
                      <td rowSpan={entry.items.length}>
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
              ))
            )
          ) : (
            <tr>
              <td colSpan="16" align="center">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Monthly Wastage Box - Similar to Filing */}
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
        <Typography sx={{ marginLeft: "3rem", color: "darkblue" }}>
          <b>Opening Balance:</b> {openingBalance.toFixed(2)}
        </Typography>
        <hr />

        <Typography
          sx={{ color: "red", fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Monthly Wastage
        </Typography>
        <br />

        <Typography>
          <strong>Total Receipt:</strong> {totalReceipt.toFixed(2)} g
        </Typography>

        <TextField
          label="Wastage (%)"
          type="number"
          value={wastagePercentage}
          onChange={(e) => setWastagePercentage(e.target.value)}
          fullWidth
          size="small"
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
              {/* {wastageInputs.length > 1 && (
                <IconButton onClick={() => removeWastageInput(index)}>
                  <DeleteIcon />
                </IconButton>
              )} */}
            </Box>
          ))}
          {/*  <Button
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
          <strong>Total Wastage:</strong> {totalWastage.toFixed(2)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Balance:</strong> {totalBalanceSum.toFixed(2)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Overall Wastage:</strong> {overallWastage.toFixed(2)} g
        </Typography>

        {parseFloat(overallWastage) < 0 && (
          <TextField
            label="Given Gold"
            type="number"
            fullWidth
            size="small"
            value={givenGold}
            onChange={(e) => setGivenGold(parseFloat(e.target.value))}
            sx={{ mt: 2 }}
          />
        )}

        <Typography sx={{ mt: 2, color: "red" }}>
          <strong>Closing Balance:</strong> {closingBalance.toFixed(2)} g
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontWeight: "bold",
            color: closingBalance < 0 ? "red" : "green",
          }}
        >
          {settlementMessage}
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

        {existingWastageId && active && (
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

      {open && (
        <div className={styles.overlay}>
          <div className={styles.assign}>
            <h5>{viewEntry ? "View Buffing Lot" : "Assign Buffing Lot"}</h5>

            {!viewEntry && (
              <>
                <TextField
                  label="Date"
                  type="date"
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ml: 0, mt: 2, mb: 2, width: "200px" }}
                />
              </>
            )}

            <table border="1" cellPadding="5" className={styles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  {!viewEntry && <th>Select</th>}
                  <th>Item</th>
                  <th>Weight</th>
                  <th>Touch</th>
                  <th>Purity</th>
                  <th>Remarks</th>
                  <th>Stone Count</th>
                  <th>Stone Weight</th>
                  {!viewEntry && <th>Status</th>}
                </tr>
              </thead>
              <tbody>
                {(viewEntry ? viewEntry.items : popupData).map(
                  (item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      {!viewEntry && (
                        <td>
                          {/* <input
                    type="checkbox"
                    checked={selectedItems.some((i) => i.id === item.id)}
                    onChange={() => handleCheckboxChange(item)}
                  /> */}
                          <Checkbox
                            checked={selectedItems.some(
                              (i) => i.id === item.id
                            )}
                            onChange={() => handleCheckboxChange(item)}
                          />
                        </td>
                      )}
                      <td>{item.item}</td>
                      <td>{item.weight}</td>
                      <td>{item.touch}</td>
                      <td>{item.purity}</td>
                      <td>{item.remarks}</td>
                      <td>{item.stoneCount}</td>
                      <td>{item.stoneWeight}</td>
                      {!viewEntry && <td>{item.status || "Unassigned"}</td>}
                    </tr>
                  )
                )}
              </tbody>
              {viewEntry && (
                <tfoot>
                  <tr>
                    <td colSpan={2}>
                      {" "}
                      <b> Total </b>
                    </td>
                    <td>
                      <b>
                        {viewEntry.items
                          .reduce(
                            (sum, item) => sum + (parseFloat(item.weight) || 0),
                            0
                          )
                          .toFixed(2)}{" "}
                      </b>
                    </td>
                    <td colSpan={6}></td>
                  </tr>
                </tfoot>
              )}
            </table>

            {viewEntry && (
              <>
                <Box sx={{ mt: 3, display: "flex", gap: 15 }}>
                  <TextField
                    label="Receipt Weight"
                    type="number"
                    fullWidth
                    required
                    value={receiptWeight}
                    onChange={(e) =>
                      setReceiptWeight(parseFloat(e.target.value) || 0)
                    }
                  />
                  <TextField
                    label="Remarks"
                    type="text"
                    fullWidth
                    required
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginTop: "10px",
                    }}
                  >
                    <Typography>
                      <b>Wastage:</b>
                    </Typography>
                    <Button
                      variant={wastage === "Yes" ? "contained" : "outlined"}
                      color="success"
                      onClick={() => setWastage("Yes")}
                      // value={wastage}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={wastage === "No" ? "contained" : "outlined"}
                      color="error"
                      onClick={() => setWastage("No")}
                      // value={wastage}
                    >
                      No
                    </Button>
                  </Box>
                </Box>
                <div style={{ marginTop: "2rem" }}>
                  <Button variant="outlined" onClick={addScrapItem}>
                    {" "}
                    Add Scrap Items{" "}
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
                      {(scrapItems || []).map((scrap, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <TextField
                              select
                              size="small"
                              value={scrap.item || ""}
                              onChange={(e) => {
                                const updated = [...scrapItems];
                                const selectedItem = itemOptions.find(
                                  (itm) => itm.id === Number(e.target.value)
                                );
                                updated[idx].item = selectedItem?.id;
                                updated[idx].itemName = selectedItem?.name;
                                setScrapItems(updated);
                              }}
                            >
                              <MenuItem value="">Select Item</MenuItem>
                              {itemOptions.map((opt) => (
                                <MenuItem key={opt.id} value={opt.id}>
                                  {opt.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          </td>
                          <td>
                            <TextField
                              size="small"
                              type="number"
                              value={scrap.weight || ""}
                              onChange={(e) => {
                                const weight = parseFloat(e.target.value) || 0;
                                const touchObj = touchOptions.find(
                                  (t) => t.id === scrap.touch
                                );
                                const purity = touchObj
                                  ? (weight * touchObj.touch) / 100
                                  : 0;

                                const updated = [...scrapItems];
                                updated[idx].weight = weight;
                                updated[idx].purity = purity.toFixed(3);
                                setScrapItems(updated);
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              select
                              size="small"
                              value={scrap.touch || ""}
                              onChange={(e) => {
                                const touchId = parseInt(e.target.value);
                                const touchObj = touchOptions.find(
                                  (t) => t.id === touchId
                                );
                                const purity = scrap.weight
                                  ? (scrap.weight * (touchObj?.touch || 0)) /
                                    100
                                  : 0;

                                const updated = [...scrapItems];
                                updated[idx].touch = touchId;
                                updated[idx].purity = purity.toFixed(3);
                                setScrapItems(updated);
                              }}
                            >
                              <MenuItem value="">Select Touch</MenuItem>
                              {touchOptions.map((opt) => (
                                <MenuItem key={opt.id} value={opt.id}>
                                  {opt.touch}
                                </MenuItem>
                              ))}
                            </TextField>
                          </td>
                          <td>
                            <TextField
                              size="small"
                              type="text"
                              value={scrap.purity || ""}
                              InputProps={{ readOnly: true }}
                            />
                          </td>
                          <td>
                            <TextField
                              size="small"
                              value={scrap.remarks || ""}
                              onChange={(e) => {
                                const updated = [...scrapItems];
                                updated[idx].remarks = e.target.value;
                                setScrapItems(updated);
                              }}
                            />
                          </td>
                          <td>
                            <Button
                              onClick={() => handleDeleteScrapItem(scrap, idx)}
                            >
                              <DeleteIcon style={{ color: "red" }} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Box sx={{ mt: 2, display: "flex", gap: 4 }}>
                    <Typography>
                      <strong>Total Scrap Weight:</strong>
                      {scrapItems
                        .reduce(
                          (sum, s) => sum + (parseFloat(s.weight) || 0),
                          0
                        )
                        .toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>Balance:</strong>
                      {(
                        viewEntry.items.reduce(
                          (sum, item) => sum + (parseFloat(item.weight) || 0),
                          0
                        ) -
                        receiptWeight -
                        scrapItems.reduce(
                          (sum, s) => sum + (parseFloat(s.weight) || 0),
                          0
                        )
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </div>
              </>
            )}
            <DialogActions>
              <Button
                onClick={() => {
                  setOpen(false);
                  setSelectedItems([]);
                  setViewEntry(null);
                }}
                variant="outlined"
                color="primary"
              >
                Close
              </Button>

              {!viewEntry && (
                <Button
                  onClick={handleAssign}
                  variant="contained"
                  color="primary"
                >
                  Assign
                </Button>
              )}

              {viewEntry && (
                <Button
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              )}
            </DialogActions>
          </div>
        </div>
      )}
    </>
  );
};

export default BuffingLotDetails;
