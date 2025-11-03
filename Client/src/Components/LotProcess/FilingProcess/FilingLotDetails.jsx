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
  Accordion,
AccordionSummary,
AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import styles from "./FilingLotDetails.module.css";
import { data, useParams } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import AddIcon from "@mui/icons-material/Add";

const FilingLotDetails = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [date, setDate] = useState( () => new Date().toISOString().split("T")[0]);
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
  const [openingBalanceTotal, setOpeningBalanceTotal] = useState(0); 
  const [totalSumBalance, setTotalSumBalance] = useState(0);
  const [currentBalanceWeight, setCurrentBalanceWeight] = useState(0);
  const [finalBalance, setFinalBalance] = useState (0);
  const { id: filingPersonId, name, lotNumber } = useParams();

 
  const fetchOpeningBalance = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/filing/${filingPersonId}`);
      setOpeningBalanceTotal(response.data.balance || 0);
      console.log('Balance for this person', response.data.balance)
    } catch (error) {
      console.error("Error fetching opening balance:", error);
    }
  };

  useEffect(() => {
    fetchOpeningBalance();
  }, [filingPersonId]);

  const fetchAssignedEntries = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_SERVER_URL}/api/filingentry/person/${filingPersonId}/${lotNumber}`
    
      );
      setAssignedEntries(res.data);
      setFilteredEntries(res.data);

      const isActive = res.data?.[0]?.lotFilingMapper?.[0]?.isactive ?? false;
      console.log("isActive value:", isActive);

      setActive(isActive);

    } catch (error) {
      console.error("Error fetching assigned entries:", error);
    }
  };

  const fetchWastageData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/filingitems/entry/${filingPersonId}/${lotNumber}`
      );

      console.log("Wastage Data Response:", response.data);

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
        `${BACKEND_SERVER_URL}/api/castingitems/castingitems/available`
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
      await axios.post(`${BACKEND_SERVER_URL}/api/filingentry`, {
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
    return weight && touch ? ((weight * touch) / 100).toFixed(3) : "";
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
const totalProductWeight = productItems.reduce( (acc, curr) => acc + (parseFloat(curr.weight) || 0),  0 );
const totalScrapWeight = scrapItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0 );
const totalTableWeight = viewedItems.reduce( (acc, item) => acc + (parseFloat(item?.weight) || 0),0 );

useEffect(() => {
  const totalSumBalance = (openingBalanceTotal || 0) + totalTableWeight;
  setTotalSumBalance(totalSumBalance);

  const currentBalanceWeight = totalSumBalance - totalProductWeight;
  setCurrentBalanceWeight(currentBalanceWeight);

  const finalBalance = currentBalanceWeight - totalScrapWeight;
  setFinalBalance(finalBalance);
}, [openingBalanceTotal, productItems, scrapItems]);

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
const totalProductWeight = formattedProductItems.reduce(  (acc, curr) => acc + curr.weight,   0 );
const totalScrapWeight = formattedScrapItems.reduce(  (acc, curr) => acc + curr.weight,   0 );
const totalTableWeight = viewedItems.reduce((acc, item) => acc + (parseFloat(item?.weight) || 0), 0 );
const totalSumBalance = (openingBalanceTotal || 0) + totalTableWeight;
const currentBalanceWeight = totalSumBalance - totalProductWeight;
const finalBalance = currentBalanceWeight - totalScrapWeight;

    const totalBalance = {
      opening_balance: Number(openingBalanceTotal) || 0,
      total_sum_balance: Number(totalSumBalance) || 0,
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
      // Refetch opening balance immediately
      await fetchOpeningBalance();

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
      await axios.delete(`${BACKEND_SERVER_URL}/api/filingitems/${id}`);
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
            Filter
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFromDate("");
              setToDate("");
              fetchAssignedEntries();
            }}
          >
            Reset
          </Button>
          <Button> Open Balance: {openingBalanceTotal}</Button>

          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft: "37rem",
            }}
            variant="contained"
            onClick={() => setIsAssignOpen(true)}
          >
            Add Filing
          </Button>
        </div>
        
        <div className={styles.tablecontainer} > 
        <table className={styles.table} style={{marginTop:'2rem'}}>
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
              <React.Fragment key={entry.id} >
                <tr className={styles.groupHeader}>
                  <td rowSpan={entry.castingItems.length}>{index + 1}</td>
                  <td rowSpan={entry.castingItems.length}>
                  {new Date(entry.createdAt).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})}

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
                          {(balance?.total_product_weight ?? 0).toFixed(3)}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.current_balance_weight ?? 0).toFixed(3)}
                        </td>

                        <td rowSpan={entry.castingItems.length}>
                          {balance?.wastage ? "Yes" : "No"}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.total_scrap_weight ?? 0).toFixed(3)}
                        </td>
                        <td rowSpan={entry.castingItems.length}>
                          {(balance?.balance ?? 0).toFixed(3)}
                        </td>
                      
<td rowSpan={entry.castingItems.length}>
<Button
  variant="outlined"
  size="small"
  onClick={() => {
    setViewedItems(entry.castingItems);
    setCurrentFilingEntryId(entry.id);

    // Get the saved balance object from backend
    const balance = entry.filingTotalBalance?.[0];

    // If balance exists use it, otherwise fallback to filing_person.balance
    const openingBalanceValue =
      balance?.opening_balance ?? entry.filing_person?.balance ?? 0;

    // Set all balance-related states
    setOpeningBalanceTotal(openingBalanceValue);
    setAfterWeight(balance?.after_weight || "");
    setWastageOption(balance?.wastage ? "Yes" : "No");
    setTotalSumBalance(balance?.total_sum_balance ?? openingBalanceValue);
    setCurrentBalanceWeight(balance?.current_balance_weight ?? openingBalanceValue);
    setFinalBalance(balance?.balance ?? openingBalanceValue);

    // Filter and set saved product items
    const products = entry.filingItems.filter(
      (i) => i.type === "ProductItems" || i.type === "Items"
    );

    setProductItems(
      products.map((p) => ({
        item: itemsList.find((i) => i.id === p.filing_item_id)?.name || "",
        weight: p.weight,
        touch: touchList.find((t) => t.id === p.touch_id)?.touch || "",
        purity: p.item_purity,
        remarks: p.remarks || "",
        hasStone: p.stone_option === "WithStone" ? "Yes" : "No",
        process:
          p.process || (p.stone_option === "WithStone" ? "Setting" : "Buffing"),
        id: p.id,
      }))
    );

    // Filter and set saved scrap items
    const scraps = entry.filingItems.filter((i) => i.type === "ScrapItems");

    setScrapItems(
      scraps.map((s) => ({
        item: itemsList.find((i) => i.id === s.filing_item_id)?.name || "",
        weight: s.weight,
        touch: touchList.find((t) => t.id === s.touch_id)?.touch || "",
        purity: s.item_purity,
        remarks: s.remarks || "",
        id: s.id,
      }))
    );

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

                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
      </div>


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
          <b>Opening Balance:</b> {openingBalance.toFixed(3)}
        </Typography>
        <hr />

        <Typography
          sx={{ color: "red", fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Monthly Wastage
        </Typography>
        <br />

        <Typography>
          <strong>Total Receipt:</strong> {totalReceipt.toFixed(3)} g
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
       
        </Box>

        <Typography sx={{ mt: 2 }}>
          <strong>Total Wastage:</strong> {totalWastage.toFixed(3)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Balance:</strong> {totalBalanceSum.toFixed(3)} g
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Overall Wastage:</strong> {overallWastage.toFixed(3)} g
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
            onWheel={(e) => e.target.blur()}
     
          />
        )}

        <Typography sx={{ mt: 2, color: "red" }}>
          <strong>Closing Balance:</strong> {closingBalance.toFixed(3)} g
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

        {active && existingWastageId && (
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

       
        <div
        style={{
          fontSize: "1.3rem",
          padding: "1rem",
          textAlign: "center",
          fontWeight: "500",
          backgroundColor:' #f8f9fa'
        }}
      > 
       Assign Filing Items 
      </div>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, mt: 0 }}
          />
       {/* <Typography sx={{ color: openingBalanceTotal >= 0 ? "green" : "red", fontWeight: "bold" }}>
    Open Balance: {openingBalanceTotal.toFixed(2)} g
  </Typography> */}
          <Typography variant="h6" gutterBottom>
            Available Filing Items
          </Typography>
          <div className={styles.tableContainer}>
            <table className={styles.table} >
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
          <Button  variant="outlined" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
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

        <div
        style={{
          fontSize: "1.3rem",
          padding: "1rem",
          textAlign: "center",
          fontWeight: "500",
          backgroundColor:' #f8f9fa'
        }}
      >
       Assigned  Filing Items
      </div>
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
                        ? (item.weight)
                        : "-"}
                    </td>
                    <td>{item?.touch || "-"}</td>
                    <td>
                      {item?.purity != null
                        ? (item.purity)
                        : "-"}
                    </td>
                    <td>{item?.remarks || "-"}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot style={{backgroundColor:'#f8f9fa'}}>
              <tr>
                <td colSpan={2}  >
                  <strong>Total</strong>
                </td>
                <td >
                  <strong>
                    {Number(
                      viewedItems.reduce(
                        (acc, item) => acc + (parseFloat(item?.weight) || 0),
                        0
                      )
                    ).toFixed(3)}
                  </strong>
                </td>
                <td colSpan={3}></td>
              </tr>
           
            </tfoot>
          </table>

<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mt: 2,
    mb: 1,
    gap: 2
  }}
>
  {/* After Weight Input */}
  <TextField
    label="After Weight"
    value={afterWeight}
    onChange={(e) => setAfterWeight(e.target.value)}
    sx={{ width: "12rem" }}
    margin="normal"
  />

  {/* Right-aligned balances */}
  <Box sx={{ textAlign: "right", minWidth: "150px" }}>
    <Typography sx={{ color: openingBalanceTotal >= 0 ? "green" : "red" }}>
      <strong>Opening Balance:</strong> {openingBalanceTotal}
    </Typography>
    <Typography sx={{ color: totalSumBalance >= 0 ? "green" : "red" }}>
      <strong>Total Sum Balance:</strong> {totalSumBalance.toFixed(3)}
    </Typography>
  </Box>
</Box>

 {/* Accordion for Calculation Details */}
 <Accordion className={styles.calculationAccordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filing-calculation-details"
          id="filing-calculation-header"
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Calculation Details
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <div className={styles.calculationInfo}>
            <ul>
              <li>
                <b>After Weight</b> – (Optional)
              </li>
              <li>
                <b>Opening Balance</b> – Comes from <i>Master Filing</i> table with
                the respective name
              </li>
              <li>
                <b>Total Sum Balance</b> = Opening Balance + Total
              </li>
              <li>
                <b>Purity</b> = Weight × Touch / 100
              </li>
              <li>
                <b>Total Product Weight</b> = Sum of weight from Add Product Items
                table
              </li>
              <li>
                <b>Current Balance Weight</b> = Total Sum Balance − Total Product Weight
              </li>
              <li>
                <b>Total Scrap Weight</b> = Sum of weight from Add Scrap Items table
              </li>
              <li>
                <b>Balance</b> = Current Balance Weight − Total Scrap Weight
              </li>
            </ul>
<hr/>
            <div className={styles.sectionDivider}></div>

            <h5 className={styles.sectionTitle}>Monthly Wastage:</h5>
            <ul>
              <li>
                <b>Total Receipt</b> = Sum of Weight column (main table)
              </li>
              <li>
                <b>Balance</b> = Sum of Balance column (main table)
              </li>
              <li>
                <b>Overall Wastage</b> = Balance − Total Wastage + opening balance
              </li>
              <li>
                <b>Total Wastage</b> = (Total Receipt × Wastage % / 100) +{" "}
                <i>Wastage Values (g)</i> (Optional)
              </li>
            </ul>
          </div>
        </AccordionDetails>
      </Accordion>
<br/>
          <Button
            variant="outlined"
            sx={{ mt: 0 , backgroundColor:' #f8f9fa', fontWeight:'530' }}
            onClick={handleAddProductRow} >
            Add Product Items
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
                            autoComplete="off"
                            onWheel={(e) => e.target.blur()}
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
                           color="error"
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

                <Box sx={{ display: "flex", gap: 5 }}>
                  <Typography variant="body1">
                    <b> Total Product Weight:</b>{" "}
                    {(totalProductWeight ?? 0).toFixed(3)}
                  </Typography>
                  <Typography variant="body1">
                    <b> Current Balance Weight:</b>
                    {(currentBalanceWeight ?? 0).toFixed(3)}
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

          <Button variant="outlined" onClick={handleAddScrapRow} 
            sx={{ mt: 1 , backgroundColor:' #f8f9fa', fontWeight:'530' }}   >
           
            Add Scrap Items
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
                            autoComplete="off"
                            onWheel={(e) => e.target.blur()}
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
                              color="error"
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
<br/>
              <Box display="flex" alignItems="center" gap={8}>
                <Typography variant="body1">
                  <b> Total Scrap Weight: </b>{" "}
                  {(totalScrapWeight ?? 0).toFixed(3)}
                </Typography>
                <Typography variant="body1">
                  <b> Balance: </b> {(finalBalance ?? 0).toFixed(3)}
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
            Save
          </Button>
          <Button variant="outlined" onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FilingLotDetails; 