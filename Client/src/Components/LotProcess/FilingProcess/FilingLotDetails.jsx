import React, { useState, useEffect } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import styles from "./FilingLotDetails.module.css";
import { useParams } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import AddIcon from "@mui/icons-material/Add";

const FilingLotDetails = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [assignedEntries, setAssignedEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewedItems, setViewedItems] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [afterWeight, setAfterWeight] = useState("");
  const [productItems, setProductItems] = useState([]);
  const [scrapItems, setScrapItems] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [touchList, setTouchList] = useState([]);
  const [showProductTable, setShowProductTable] = useState(false);
  const [showScrapTable, setShowScrapTable] = useState(false);
  const [wastageOption, setWastageOption] = useState("No");
  const [currentFilingEntryId, setCurrentFilingEntryId] = useState(null);
  const [existingWastageId, setExistingWastageId] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(0);

  // Monthly wastage state variables
  const [wastageInputs, setWastageInputs] = useState([{ value: "" }]);
  const [wastagePercentage, setWastagePercentage] = useState("");
  const [givenGold, setGivenGold] = useState("");
  const [closingSummary, setClosingSummary] = useState(null);
  const [active, setActive] = useState(true);

  const { id: filingPersonId, name, lotNumber } = useParams();

  const fetchAssignedEntries = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/filingentry/person/${filingPersonId}/${lotNumber}`
      );
      setAssignedEntries(res.data);
      setFilteredEntries(res.data);
      setActive(res.data.lotFilingMapper?.isactive);
    } catch (error) {
      console.error("Error fetching assigned entries:", error);
    }
  };

  const fetchWastageData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/filingitems/entry/${filingPersonId}/${lotNumber}`
      );

      if (response.data.length > 0) {
        const wastageData = response.data[0];
        setExistingWastageId(wastageData.id);
        setWastagePercentage(wastageData.wastage_percentage.toString());
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

  const applyDateFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredEntries(assignedEntries);
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const filtered = assignedEntries.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      return createdAt >= from && createdAt <= to;
    });

    setFilteredEntries(filtered);
  };

  const fetchDropdownOptions = async () => {
    const touchRes = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
    const itemRes = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
    setItemsList(itemRes.data);
    setTouchList(touchRes.data);
    console.log("Available Touch", touchRes.data);
    console.log("Available Items", itemRes.data);
  };

  const fetchAvailableItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/castingitems/castingitems/available"
      );
      const unassignedItems = res.data.filter(
        (item) => item.status === "Unassigned"
      );
      setAvailableItems(unassignedItems);
    } catch (err) {
      console.error("Failed to fetch casting items", err);
    }
  };

  useEffect(() => {
    fetchAssignedEntries();
    fetchWastageData();
    fetchAvailableItems();
    fetchDropdownOptions();
  }, []);

  const handleBulkAssign = async () => {
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/filingentry", {
        filing_person_id: parseInt(filingPersonId),
        lot_number: parseInt(lotNumber),
        itemIds: selectedItemIds,
      });
      // Refresh both lists
      await fetchAvailableItems();
      await fetchAssignedEntries();
      // Reset
      setSelectedItemIds([]);
      setIsAssignOpen(false);
    } catch (error) {
      console.log("errr", error);
      if (error.response) {
        if (error.status === 404) {
          alert(error.response.data.error || "Resource not found");
        } else {
          alert(error.response.data.error || "Something went wrong");
        }
      } else {
        alert("Assignment failed:", error.response?.data || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePurity = (weight, touch) => {
    return weight && touch ? ((weight * touch) / 100).toFixed(2) : "";
  };

  const handleAddProductRow = () => {
    setProductItems([
      ...productItems,
      {
        item: "",
        weight: "",
        touch: "",
        purity: "",
        remarks: "",
        hasStone: "No",
        process: "Buffing",
      },
    ]);
    setShowProductTable(true);
  };

  const handleAddScrapRow = () => {
    setScrapItems([
      ...scrapItems,
      { item: "", weight: "", touch: "", purity: "", remarks: "" },
    ]);
    setShowScrapTable(true);
  };

  const totalProductWeight = productItems.reduce(
    (acc, curr) => acc + (parseFloat(curr.weight) || 0),
    0
  );

  const totalScrapWeight = scrapItems.reduce(
    (acc, curr) => acc + (parseFloat(curr.weight) || 0),
    0
  );
  const totalAssignedWeight = viewedItems.reduce(
    (acc, item) => acc + (parseFloat(item?.weight) || 0),
    0
  );
  const currentBalanceWeight = totalAssignedWeight - totalProductWeight;
  const finalBalance = currentBalanceWeight - totalScrapWeight;

  const addWastageInput = () => {
    setWastageInputs([...wastageInputs, { value: "" }]);
  };

  // Function to remove a wastage input field
  const removeWastageInput = (index) => {
    const newInputs = [...wastageInputs];
    newInputs.splice(index, 1);
    setWastageInputs(newInputs);
  };

  console.log("Wastage Inputs:", wastageInputs);

  // Function to update a wastage input value
  const handleWastageInputChange = (index, value) => {
    const newInputs = [...wastageInputs];
    newInputs[index].value = value;
    setWastageInputs(newInputs);
  };

  // Monthly wastage calculations
  const totalReceipt = filteredEntries.reduce((sum, entry) => {
    const balance =
      entry.filingTotalBalance && entry.filingTotalBalance.length > 0
        ? entry.filingTotalBalance[0]
        : null;

    return sum + (balance?.total_product_weight ?? 0);
  }, 0);

  const totalBalance = filteredEntries.reduce(
    (sum, entry) => sum + (parseFloat(entry.balance) || 0),
    0
  );

  const manualWastageSum = wastageInputs.reduce(
    (sum, w) => sum + (parseFloat(w.value) || 0),
    0
  );

  // % wastage calculation
  const totalWastageFromPercentage =
    (totalReceipt * (parseFloat(wastagePercentage) || 0)) / 100;

  // Final total wastage = percentage wastage + manual wastage inputs
  const totalWastage = totalWastageFromPercentage + manualWastageSum;

  const totalBalanceSum = filteredEntries.reduce((sum, entry) => {
    const balance =
      entry.filingTotalBalance && entry.filingTotalBalance.length > 0
        ? entry.filingTotalBalance[0]
        : null;

    return sum + (parseFloat(balance?.balance) || 0);
  }, 0);
  const overallWastage = totalBalanceSum - totalWastage + openingBalance;

  const additionalGold = parseFloat(givenGold) || 0;

  const closingBalance =
    overallWastage < 0 ? overallWastage + additionalGold : overallWastage;

  const settlementMessage =
    closingBalance < 0
      ? "Owner must give to worker"
      : "Worker must give to owner";

  /*   const handleSaveSummary = async () => {
    try {
      const data = {
        total_receipt: totalReceipt,
        total_wastage: totalWastage,
        balance: totalBalanceSum,
        wastage_percentage: parseFloat(wastagePercentage) || 0,
        given_gold: additionalGold,
        add_wastage: wastageInputs[0].value, // Sum of all manual wastage inputs
        overall_wastage: overallWastage,
        closing_balance: closingBalance,
        opening_balance: 0, // As specified, opening balance is 0
        filing_entry_id: 1, // You'll need to track the current filing entry ID
      };

      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/filingitems/wastage`,
        data
      );

      // Also save to localStorage as before
      localStorage.setItem("filingSummary", JSON.stringify(data));
      setClosingSummary(data);

      alert("Summary saved successfully to database!");
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary. Check console for details.");
    }
  }; */

  const handleSaveSummary = async () => {
    try {
      console.log("ssssssss", additionalGold);

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
        filing_person_id: filingPersonId,
        lotId: lotNumber,
      };

      let response;
      if (existingWastageId) {
        // Update existing wastage record
        response = await axios.put(
          `${BACKEND_SERVER_URL}/api/filingitems/wastage/${existingWastageId}`,
          data
        );
      } else {
        // Create new wastage record
        response = await axios.post(
          `${BACKEND_SERVER_URL}/api/filingitems/wastage`,
          data
        );
        setExistingWastageId(response.data.id);
      }

      localStorage.setItem("filingSummary", JSON.stringify(data));
      setClosingSummary(data);

      alert(`Summary ${existingWastageId ? "updated" : "saved"} successfully!`);
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary. Check console for details.");
    }
  };

  /* const handleCloseJobcard = () => {
    const savedLots = JSON.parse(localStorage.getItem("filingLots")) || [];
    const nextId = savedLots.length + 1;
    const updatedLots = [...savedLots, { id: nextId }];
    localStorage.setItem("filingLots", JSON.stringify(updatedLots));
    alert("Jobcard closed and lot created.");
  }; */

  const handleCloseJobcard = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/filingitems/close-jobcard`,
        {
          filing_person_id: filingPersonId,
          current_lot_number: lotNumber,
        }
      );

      // Redirect to the new lot
      window.location.href = `/filinglot/${filingPersonId}/${name}/${response.data.newLotNumber}`;

      alert("Jobcard closed and new lot created successfully!");
    } catch (error) {
      console.error("Error closing jobcard:", error);
      alert("Failed to close jobcard. Check console for details.");
    }
  };

  const handleSaveFilingData = async () => {
    if (!currentFilingEntryId) {
      alert("No Filing Entry selected!");
      return;
    }

    // Map product items with correct backend keys
    const formattedProductItems = productItems
      .map((item) => ({
        id: item.id,
        type: "ProductItems",
        filing_item_id: itemsList.find((i) => i.name === item.item)?.id || null,
        weight: parseFloat(item.weight) || 0,
        touch_id: touchList.find((t) => t.touch === item.touch)?.id || null,
        item_purity: parseFloat(item.purity) || 0,
        remarks: item.remarks || null,
        stone_option: item.hasStone === "Yes" ? "WithStone" : "WithoutStone",
        lot_filing_mapper_id: null,
        process: item.process || null,
      }))
      .filter((item) => item.filing_item_id !== null && item.touch_id !== null);

    // Map scrap items with correct backend keys
    const formattedScrapItems = scrapItems
      .map((item) => ({
        id: item.id,
        type: "ScrapItems",
        filing_item_id: itemsList.find((i) => i.name === item.item)?.id || null,
        weight: parseFloat(item.weight) || 0,
        touch_id: touchList.find((t) => t.touch === item.touch)?.id || null,
        item_purity: parseFloat(item.purity) || 0,
        remarks: item.remarks || null,
        stone_option: null,
        lot_filing_mapper_id: null,
        process: null,
      }))
      .filter((item) => item.filing_item_id !== null && item.touch_id !== null);

    // Calculate weights and balances
    const totalProductWeight = formattedProductItems.reduce(
      (acc, curr) => acc + curr.weight,
      0
    );
    const totalScrapWeight = formattedScrapItems.reduce(
      (acc, curr) => acc + curr.weight,
      0
    );
    const totalAssignedWeight = viewedItems.reduce(
      (acc, item) => acc + (parseFloat(item?.weight) || 0),
      0
    );
    const currentBalanceWeight = totalAssignedWeight - totalProductWeight;
    const finalBalance = currentBalanceWeight - totalScrapWeight;

    const totalBalance = {
      after_weight: Number(afterWeight) || 0,
      balance: Number(finalBalance) || 0,
      current_balance_weight: Number(currentBalanceWeight) || 0,
      total_product_weight: totalProductWeight,
      total_scrap_weight: totalScrapWeight,
      wastage: wastageOption === "Yes",
    };

    // Add these logs before the API call
    console.log("Formatted Product Items:", formattedProductItems);
    console.log("Formatted Scrap Items:", formattedScrapItems);
    console.log("Total Balance Object:", totalBalance);

    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/filingitems`, {
        filing_entry_id: currentFilingEntryId,
        items: [...formattedProductItems, ...formattedScrapItems],
        totalBalance,
      });

      alert("Data saved successfully!");
      // fetchAssignedEntries();
      await fetchAssignedEntries();
      setViewDialogOpen(false);
      setProductItems([]);
      setScrapItems([]);
      setAfterWeight("");
    } catch (error) {
      console.error("Failed to save filing data:", error);
      alert("Error saving data. Check console.");
    }
  };

  const handleDeleteItem = async (id, type) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;
    console.log("Delete id:", id);

    try {
      await axios.delete(`http://localhost:5000/api/filingitems/${id}`);
      alert("Item deleted successfully");

      if (type === "product") {
        setProductItems((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "scrap") {
        setScrapItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  return (
    <>
      <Navbar />
      <h5 className={styles.heading}>Filing Lot Details</h5>
      <div className={styles.container}>
        <div
          className={styles.header}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="From Date"
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
          <Button variant="outlined" onClick={applyDateFilter}>
            {" "}
            Filter{" "}
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setFromDate("");
              setToDate("");
              fetchAssignedEntries();
            }}
          >
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
            onClick={() => setIsAssignOpen(true)}
          >
            Add Filing
          </Button>
        </div>
        <table className={styles.table}>
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
              {/* <th>Status</th> */}
              <th> After Weight</th>
              <th> Total Product Weight </th>
              <th> Current Balance Weight </th>
              <th> Wastage </th>
              <th> Total Scrap Weight </th>
              <th> Balance </th>
              <th> Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <tr className={styles.groupHeader}>
                  <td rowSpan={entry.castingItems.length}>{index + 1}</td>
                  <td rowSpan={entry.castingItems.length}>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td rowSpan={entry.castingItems.length}>
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{entry.castingItems[0]?.item_name}</td>
                  <td>{entry.castingItems[0]?.weight}</td>
                  <td>{entry.castingItems[0]?.touch || "-"}</td>
                  <td>{entry.castingItems[0]?.purity || "-"}</td>
                  <td>{entry.castingItems[0]?.remarks || "-"}</td>
                  {/* <td>Assigned</td> */}
                  {(() => {
                    const balance =
                      entry.filingTotalBalance &&
                      entry.filingTotalBalance.length > 0
                        ? entry.filingTotalBalance[0]
                        : null;

                    return (
                      <>
                        <td rowSpan={entry.castingItems.length}>
                          {balance?.after_weight !== null &&
                          balance?.after_weight !== undefined
                            ? balance.after_weight
                            : "-"}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.total_product_weight ?? 0).toFixed(2)}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.current_balance_weight ?? 0).toFixed(2)}
                        </td>

                        <td rowSpan={entry.castingItems.length}>
                          {balance?.wastage ? "Yes" : "No"}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.total_scrap_weight ?? 0).toFixed(2)}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.balance ?? 0).toFixed(2)}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setViewedItems(entry.castingItems);
                              setCurrentFilingEntryId(entry.id);

                              const balance = entry.filingTotalBalance?.[0];
                              setAfterWeight(balance?.after_weight || "");
                              setWastageOption(balance?.wastage ? "Yes" : "No");

                              const products = entry.filingItems.filter(
                                (i) =>
                                  i.type === "ProductItems" ||
                                  i.type === "Items"
                              );
                              const scraps = entry.filingItems.filter(
                                (i) => i.type === "ScrapItems"
                              );

                              setProductItems(
                                products.map((p) => ({
                                  item:
                                    itemsList.find(
                                      (i) => i.id === p.filing_item_id
                                    )?.name || "",
                                  weight: p.weight,
                                  touch:
                                    touchList.find((t) => t.id === p.touch_id)
                                      ?.touch || "",
                                  purity: p.item_purity,
                                  remarks: p.remarks || "",
                                  hasStone:
                                    p.stone_option === "WithStone"
                                      ? "Yes"
                                      : "No",
                                  // process: p.process || 'Buffing',
                                  process:
                                    p.process ||
                                    (p.stone_option === "WithStone"
                                      ? "Setting"
                                      : "Buffing"),
                                  id: p.id,
                                }))
                              );

                              setScrapItems(
                                scraps.map((s) => ({
                                  item:
                                    itemsList.find(
                                      (i) => i.id === s.filing_item_id
                                    )?.name || "",
                                  weight: s.weight,
                                  touch:
                                    touchList.find((t) => t.id === s.touch_id)
                                      ?.touch || "",
                                  purity: s.item_purity,
                                  remarks: s.remarks || "",
                                  id: s.id,
                                }))
                              );

                              // Set visibility based on whether these arrays have items
                              setShowProductTable(products.length > 0);
                              setShowScrapTable(scraps.length > 0);

                              setViewDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </>
                    );
                  })()}
                </tr>
                {entry.castingItems.slice(1).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>{item.item_name}</td>
                    <td>{item.weight}</td>
                    <td>{item.touch || "-"}</td>
                    <td>{item.purity || "-"}</td>
                    <td>{item.remarks || "-"}</td>
                    {/* <td>Assigned</td>          */}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Wastage Box  */}
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
          <strong>Total Wastage:</strong> {totalWastage.toFixed(2)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Balance:</strong> {totalBalanceSum.toFixed(2)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Overall Wastage:</strong> {overallWastage.toFixed(2)} g
        </Typography>

        {/* Show Given Gold only if Overall Wastage is negative */}
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

        {/* Show settlement message */}
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

      <Dialog
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Assign Filing Items</DialogTitle>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, mt: 3 }}
          />
          <Typography variant="h6" gutterBottom>
            Available Filing Items
          </Typography>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
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
                {availableItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Checkbox
                        disabled={item.status === "Assigned"}
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => {
                          setSelectedItemIds((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                      />
                    </td>
                    <td>{item.item?.name}</td>
                    <td>{item.weight}</td>
                    <td>{item.touch?.touch}</td>
                    <td>{item.item_purity}</td>
                    <td>{item.remarks || "-"}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedItemIds.length === 0 || isLoading}
            onClick={async () => {
              setIsLoading(true);
              await handleBulkAssign();
              setIsLoading(false);
            }}
          >
            {isLoading ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assigned Items</DialogTitle>
        <DialogContent>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Weight</th>
                <th>Touch</th>
                <th>Purity</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(viewedItems) &&
                viewedItems.map((item, index) => (
                  <tr key={item?.id || index}>
                    <td>{index + 1}</td>
                    <td>{item?.item_name || "-"}</td>
                    <td>
                      {item?.weight != null
                        ? Number(item.weight).toFixed(2)
                        : "-"}
                    </td>
                    <td>{item?.touch || "-"}</td>
                    <td>
                      {item?.purity != null
                        ? Number(item.purity).toFixed(2)
                        : "-"}
                    </td>
                    <td>{item?.remarks || "-"}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <strong>Total</strong>
                </td>
                <td>
                  {" "}
                  <strong>
                    {Number(
                      viewedItems.reduce(
                        (acc, item) => acc + (parseFloat(item?.weight) || 0),
                        0
                      )
                    ).toFixed(2)}
                  </strong>
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
          <TextField
            label="After Weight"
            value={afterWeight}
            onChange={(e) => setAfterWeight(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Button
            variant="outlined"
            sx={{ mt: "1rem" }}
            onClick={handleAddProductRow}
          >
            {" "}
            Add Product Items{" "}
          </Button>

          {showProductTable && (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Item</th>
                      <th style={{ width: "7rem" }}>Weight</th>
                      <th>Touch</th>
                      <th>Purity</th>
                      <th style={{ width: "4rem" }}>Remarks</th>
                      <th>Has Stone</th>
                      <th>Process</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productItems.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <TextField
                            select
                            value={row.item}
                            onChange={(e) => {
                              const updated = [...productItems];
                              updated[index].item = e.target.value;
                              setProductItems(updated);
                            }}
                          >
                            {itemsList.map((i) => (
                              <MenuItem key={i.id} value={i.name}>
                                {i.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>
                          <TextField
                            type="number"
                            value={row.weight}
                            onChange={(e) => {
                              const updated = [...productItems];
                              updated[index].weight = parseFloat(
                                e.target.value
                              );
                              updated[index].purity = calculatePurity(
                                updated[index].weight,
                                updated[index].touch
                              );
                              setProductItems(updated);
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            select
                            value={row.touch}
                            onChange={(e) => {
                              const updated = [...productItems];
                              updated[index].touch = parseFloat(e.target.value);
                              updated[index].purity = calculatePurity(
                                updated[index].weight,
                                updated[index].touch
                              );
                              setProductItems(updated);
                            }}
                          >
                            {touchList.map((t) => (
                              <MenuItem key={t.id} value={t.touch}>
                                {t.touch}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>{row.purity}</td>
                        <td>
                          <TextField
                            value={row.remarks}
                            onChange={(e) => {
                              const updated = [...productItems];
                              updated[index].remarks = e.target.value;
                              setProductItems(updated);
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            select
                            value={row.hasStone}
                            onChange={(e) => {
                              const updated = [...productItems];
                              updated[index].hasStone = e.target.value;
                              updated[index].process =
                                e.target.value === "Yes"
                                  ? "Setting"
                                  : "Buffing";
                              setProductItems(updated);
                            }}
                          >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                          </TextField>
                        </td>
                        <td>{row.process}</td>

                        <td>
                          <IconButton
                            onClick={() => handleDeleteItem(row.id, "product")}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                {/* Left side: weights */}
                <Box sx={{ display: "flex", gap: 5 }}>
                  <Typography variant="body1">
                    <b> Total Product Weight:</b>{" "}
                    {(totalProductWeight ?? 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    <b> Current Balance Weight:</b>
                    {(currentBalanceWeight ?? 0).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 0.2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <b>Wastage:</b>
                  </Typography>
                  <Button
                    variant={wastageOption === "Yes" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => setWastageOption("Yes")}
                    sx={{ ml: 1, minWidth: "4rem" }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={wastageOption === "No" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => setWastageOption("No")}
                    sx={{ minWidth: "4rem", ml: 1 }}
                  >
                    No
                  </Button>
                </Box>
              </Box>
            </>
          )}
          <br />

          <Button variant="outlined" onClick={handleAddScrapRow}>
            {" "}
            Add Scrap Items{" "}
          </Button>
          {showScrapTable && (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Item</th>
                      <th style={{ width: "7rem" }}>Weight</th>
                      <th>Touch</th>
                      <th>Purity</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapItems.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <TextField
                            select
                            value={row.item}
                            onChange={(e) => {
                              const updated = [...scrapItems];
                              updated[index].item = e.target.value;
                              setScrapItems(updated);
                            }}
                          >
                            {itemsList.map((i) => (
                              <MenuItem key={i.id} value={i.name}>
                                {i.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>
                          <TextField
                            type="number"
                            value={row.weight}
                            onChange={(e) => {
                              const updated = [...scrapItems];
                              updated[index].weight = parseFloat(
                                e.target.value
                              );
                              updated[index].purity = calculatePurity(
                                updated[index].weight,
                                updated[index].touch
                              );
                              setScrapItems(updated);
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            select
                            value={row.touch}
                            onChange={(e) => {
                              const updated = [...scrapItems];
                              updated[index].touch = parseFloat(e.target.value);
                              updated[index].purity = calculatePurity(
                                updated[index].weight,
                                updated[index].touch
                              );
                              setScrapItems(updated);
                            }}
                          >
                            {touchList.map((t) => (
                              <MenuItem key={t.id} value={t.touch}>
                                {t.touch}
                              </MenuItem>
                            ))}
                          </TextField>
                        </td>
                        <td>{row.purity}</td>
                        <td>
                          <TextField
                            value={row.remarks}
                            onChange={(e) => {
                              const updated = [...scrapItems];
                              updated[index].remarks = e.target.value;
                              setScrapItems(updated);
                            }}
                          />
                        </td>
                        <td>
                          <IconButton
                            onClick={() => handleDeleteItem(row.id, "scrap")}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Box display="flex" alignItems="center" gap={8}>
                <Typography variant="body1">
                  <b> Total Scrap Weight: </b>{" "}
                  {(totalScrapWeight ?? 0).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <b> Balance: </b> {(finalBalance ?? 0).toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveFilingData}
            sx={{ ml: 30, mt: 0 }}
          >
            {" "}
            Save{" "}
          </Button>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FilingLotDetails;
