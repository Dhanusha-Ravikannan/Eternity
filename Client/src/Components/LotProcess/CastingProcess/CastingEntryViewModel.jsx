import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import DeleteIcon from "@mui/icons-material/Delete";

const CastingEntryViewModal = ({
  open,
  handleClose,
  form,
  mode,
  nameOptions = [],
  touchOptions = [],
  handleChange,
  handleSave,
  castingEntryId,
  handleCastingItemsSaved,
}) => {
  const isView = mode === "view";

  const [productItems, setProductItems] = useState([]);
  const [scrapItems, setScrapItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [availableStock, setAvailableStock] = useState([]);
  const [stockValidation, setStockValidation] = useState({
    isValid: true,
    message: "",
    available: 0,
    requested: 0,
  });
  const [openingBalance, setOpeningBalance] = useState(0);


  console.log("Casting Entry ID from parent:", castingEntryId);

  useEffect(() => {
    if (open && mode === "add") {
      setProductItems([]);
      setScrapItems([]);
    }
  }, [open, mode]);

  // Fetch available stock when modal opens
  useEffect(() => {
    const fetchAvailableStock = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/stock`);
        setAvailableStock(response.data);
        console.log("Available Stock:", response.data);
      } catch (error) {
        console.error("Failed to fetch available stock:", error);
      }
    };

    if (open) {
      fetchAvailableStock();
    }
  }, [open]);

  useEffect(() => {
    if (form.givenGold && form.touch) {
      const selectedTouch = touchOptions.find((t) => t.touch === form.touch);
      if (selectedTouch) {
        const touchId = selectedTouch.id;

        // Calculate available weight for this touch
        const availableForTouch = availableStock
          .filter((item) => item.touch_id === touchId)
          .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);

        const requestedGold = parseFloat(form.givenGold);

        if (requestedGold > availableForTouch) {
          setStockValidation({
            isValid: false,
            message: `Insufficient stock! Available: ${availableForTouch.toFixed(2)}, Requested: ${requestedGold.toFixed(2)}`,
            available: availableForTouch,
            requested: requestedGold,
          });
        } else {
          setStockValidation({
            isValid: true,
            message: `Available: ${availableForTouch.toFixed(2)}`,
            available: availableForTouch,
            requested: requestedGold,
          });
        }
      }
    } else {
      setStockValidation({
        isValid: true,
        message: "",
        available: 0,
        requested: 0,
      });
    }
  }, [form.givenGold, form.touch, availableStock, touchOptions]);

  const handleSaveItems = async () => {
    if (!castingEntryId) {
      alert("Casting Entry ID is missing.");
      return;
    }

    if (!stockValidation.isValid) {
      alert("Cannot save with insufficient stock!");
      return;
    }

    try {
      const payloads = [];

      productItems.forEach((item) => {
        payloads.push({
          id: item.id || undefined,
          weight: parseFloat(item.weight),
          touch_id: parseInt(
            touchOptions.find((t) => t.touch === item.touch)?.id || 0
          ),
          item_purity: parseFloat(item.purity),
          remarks: item.remarks || "",
          casting_entry_id: castingEntryId,
          item_id: parseInt(
            itemOptions.find((i) => i.name === item.item)?.id || 0
          ),
          type: "Items",
        });
      });

      scrapItems.forEach((item) => {
        payloads.push({
          id: item.id || undefined,
          weight: parseFloat(item.weight),
          touch_id: parseInt(
            touchOptions.find((t) => t.touch === item.touch)?.id || 0
          ),
          item_purity: parseFloat(item.purity),
          remarks: item.scrapremarks || "",
          casting_entry_id: castingEntryId,
          item_id: parseInt(
            itemOptions.find((i) => i.name === item.item)?.id || 0
          ),
          type: "ScrapItems",
        });
      });

      const balanceData = {
        total_item_weight: totalProductWeight,
        current_balance_weight: currentBalanceWeight,
        total_scrap_weight: totalScrapWeight,
        total_wastage: totalWastage,
      };

      await axios.post("http://localhost:5000/api/castingitems", {
        items: payloads,
        balanceData,
      });

      alert("Items and balance saved successfully!");

      handleCastingItemsSaved(castingEntryId, {
        totalItemWeight: totalProductWeight,
        currentBalanceWeight,
        totalScrapWeight,
        totalWastage,
        productItems,
        scrapItems,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to save items:", error);
      alert("Error saving items. Please check console.");
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
        setItemOptions(response.data);
        console.log("Available Items:", response.data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    fetchItems();
  }, []);

  // Add a blank product item
  const addProductItem = () => {
    setProductItems([
      ...productItems,
      { item: "", weight: "", touch: "", purity: "", remarks: "" },
    ]);
  };

  // Add a blank scrap item
  const addScrapItem = () => {
    setScrapItems([
      ...scrapItems,
      { item: "", weight: "", touch: "", purity: "", scrapremarks: "" },
    ]);
  };

  const deleteProductItem = async (index, itemId) => {
    try {
      console.log("Deleting item with ID:", index, itemId);
      if (itemId) {
        await axios.delete(`${BACKEND_SERVER_URL}/api/castingitems/${itemId}`);
      }

      setProductItems(productItems.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete product item:", error);
      alert("Error deleting item. Please check console.");
    }
  };

  const deleteScrapItem = async (index, itemId) => {
    try {
      if (itemId) {
        await axios.delete(`${BACKEND_SERVER_URL}/api/stock/${itemId}`);
      }

      setScrapItems(scrapItems.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete scrap item:", error);
      alert("Error deleting item. Please check console.");
    }
  };

  const handleItemChange = (type, index, field, value) => {
    const updateArray = (prevItems) => {
      const updatedList = [...prevItems];
      const item = { ...updatedList[index], [field]: value };

      const weight = parseFloat(field === "weight" ? value : item.weight) || 0;
      const touch = parseFloat(field === "touch" ? value : item.touch) || 0;

      // Only update purity if weight and touch are both valid
      if (!isNaN(weight) && !isNaN(touch)) {
        item.purity = ((weight * touch) / 100).toFixed(2);
      }

      updatedList[index] = item;
      return updatedList;
    };

    if (type === "product") {
      setProductItems((prev) => updateArray(prev));
    } else {
      setScrapItems((prev) => updateArray(prev));
    }
  };

  const totalProductWeight = productItems.reduce(
    (sum, item) => sum + parseFloat(item.weight || 0),
    0
  );
  const currentBalanceWeight =
    parseFloat(form.beforeWeight || 0) - totalProductWeight;
  const totalScrapWeight = scrapItems.reduce(
    (sum, item) => sum + parseFloat(item.weight || 0),
    0
  );
  const totalWastage = currentBalanceWeight - totalScrapWeight;

  useEffect(() => {
    const fetchExistingItems = async () => {
      if (!castingEntryId || mode !== "view") return;

      try {
        const res = await axios.get(
          `${BACKEND_SERVER_URL}/api/castingitems/${castingEntryId}`
        );
        const items = res.data;
        const product = [];
        const scrap = [];

        items.forEach((item) => {
          const formattedItem = {
            id: item.id,
            item: item.item?.name || "",
            weight: item.weight,
            touch: item.touch?.touch || "",
            purity: item.item_purity,
            remarks: item.remarks || "",
            scrapremarks: item.remarks || "",
          };

          if (item.type === "Items") product.push(formattedItem);
          else if (item.type === "ScrapItems") scrap.push(formattedItem);
        });

        setProductItems(product);
        setScrapItems(scrap);
      } catch (err) {
        console.error("Failed to load existing casting items:", err);
      }
    };

    fetchExistingItems();
  }, [castingEntryId, mode]);

  // Calculate available stock summary by touch
    const calculateStockSummary = () => {
    const summary = {};

    availableStock.forEach((item) => {
      const touch = item.touch?.touch || item.touch_id;
      const weight = parseFloat(item.weight) || 0;

      if (touch) {
        if (!summary[touch]) {
          summary[touch] = 0;
        }
        summary[touch] += weight;
      }
    });

    return summary;
  };

  const adjustedStockSummary = () => {
    const summary = calculateStockSummary();

    if (form.givenGold && form.touch) {
      const selectedTouch = touchOptions.find((t) => t.touch === form.touch);
      if (selectedTouch) {
        const touchId = selectedTouch.id;
        const requestedGold = parseFloat(form.givenGold) || 0;

        const touchKey = selectedTouch.touch; 
        if (summary[touchKey] !== undefined) {
          summary[touchKey] = Math.max(summary[touchKey] - requestedGold, 0); 
        }
      }
    }

    return summary;
  };

  const stockSummary = adjustedStockSummary();



  useEffect(() => {
    const fetchOpeningBalance = async () => {
      if (!form.name) return; // only fetch when a name is selected
  
      try {
        const res = await axios.get(`${BACKEND_SERVER_URL}/api/casting`);
        if (Array.isArray(res.data)) {
          const selectedCustomer = res.data.find(
            (entry) => entry.name === form.name
          );
  
          if (selectedCustomer) {
            setOpeningBalance(parseFloat(selectedCustomer.balance) || 0);
          } else {
            setOpeningBalance(0);
          }
        } else {
          setOpeningBalance(0);
        }
      } catch (error) {
        console.error("Failed to fetch opening balance:", error);
        setOpeningBalance(0);
      }
    };
  
    fetchOpeningBalance();
  }, [form.name]);

  useEffect(() => {
    if (!open) {
      setOpeningBalance(0);
    }
  }, [open]);
  
  

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <div
        style={{
          fontSize: "1.3rem",
          padding: "1rem",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {isView ? "View Casting Entry" : "Add Casting Entry"}
      </div>

      {Object.keys(stockSummary).length > 0 && (
        <Box sx={{ mt: 0, p: 2, border: "1px solid #ddd", borderRadius: 1, backgroundColor:' #f8f9fa' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Available Stock
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stockSummary).map(([touch, weight]) => (
              <Grid item xs={6} sm={4} md={3} key={touch}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    // backgroundColor: "#f5f5f5",
                    backgroundColor:"#38383e",
                    color:'white',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1">Touch {touch}:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {weight.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <DialogContent>
  
     <Grid container spacing={6}>
     <Grid item xs={3}>
          <TextField
          label="Date"
          type="date"
          sx={{ width: "180px" }}
          margin="dense"
          value={form.date}
          onChange={handleChange("date")}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly: isView }}
        />
          </Grid>

      
<Grid item xs={3}>
            <TextField
              label="Name"
              select
              sx={{ width: "180px" }}
              margin="dense"
              value={form.name}
              onChange={handleChange("name")}
              InputProps={{ readOnly: isView }}
            >
              {nameOptions.map((nameObj) => (
                <MenuItem key={nameObj.id} value={nameObj.name}>
                  {nameObj.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Touch"
              select
              sx={{ width: "160px" }}
              margin="dense"
              value={form.touch}
              onChange={handleChange("touch")}
              InputProps={{ readOnly: isView }}
            >
              {touchOptions.map((touchObj) => (
                <MenuItem key={touchObj.id} value={touchObj.touch}>
                  {touchObj.touch}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={3}>
            <TextField
              label="Given Gold"
              type="number"
              autoComplete="off"
              onWheel={(e) => e.target.blur()}
              sx={{ width: "160px" }}
              margin="dense"
              value={form.givenGold}
              onChange={handleChange("givenGold")}
              InputProps={{ readOnly: isView }}
              error={!stockValidation.isValid}
              helperText={stockValidation.message}
            />
          </Grid>
      
        </Grid>

        {!stockValidation.isValid && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Insufficient stock for this touch! Available:{" "}
            {stockValidation.available.toFixed(2)}, Requested:{" "}
            {stockValidation.requested.toFixed(2)}
          </Alert>
        )}

        <Grid container spacing={6}>
          {/* 2nd Row */}

          <Grid item xs={3}>
            <TextField
              label="Purity"
              sx={{ width: "180px" }}
              margin="dense"
              value={form.purity}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Final Touch"
              type="number"
              autoComplete="off"
              onWheel={(e) => e.target.blur()}
              sx={{ width: "180px" }}
              margin="dense"
              value={form.finalTouch}
              onChange={handleChange("finalTouch")}
              InputProps={{ readOnly: isView }}
            />
          </Grid>
          {/* <Grid item xs={2}>
            <TextField
              label="Pure Value"
              sx={{ width: "160px" }}
              margin="dense"
              value={form.pureValue}
              InputProps={{ readOnly: true }}
            />
          </Grid> */}
          <Grid item xs={2}>
            <TextField
              label="Before Weight"
              sx={{ width: "160px" }}
              margin="dense"
              value={form.beforeWeight}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Copper"
              sx={{ width: "160px" }}
              margin="dense"
              value={form.copper}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>


        {openingBalance !== null && (
  <Typography
    sx={{
      mt: 2,
      fontWeight: "bold",
      textAlign: "right",
      fontSize: "1rem",
      color:
        openingBalance > 0
          ? "green"
          : openingBalance < 0
          ? "red"
          : "text.primary",
    }}
  >
    Opening Balance: ₹ {openingBalance.toFixed(2)}
  </Typography>
)}



        {/* Add Product Items Section */}
        <Button onClick={addProductItem} variant="outlined" sx={{ mt: 3 , backgroundColor:' #f8f9fa', fontWeight:'530' }}>
          Add Product Items
        </Button>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Item
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Weight
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Touch
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Purity
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Remarks
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productItems.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    select
                    value={row.item}
                    size="small"
                    onChange={(e) =>
                      handleItemChange("product", index, "item", e.target.value)
                    }
                  >
                    {itemOptions.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.weight}
                    size="small"
                    type="number"
                    autoComplete="off"
                    onWheel={(e) => e.target.blur()}                 
                    onChange={(e) =>
                      handleItemChange(
                        "product",
                        index,
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    value={row.touch}
                    size="small"
                    onChange={(e) =>
                      handleItemChange(
                        "product",
                        index,
                        "touch",
                        e.target.value
                      )
                    }
                  >
                    {touchOptions.map((touchObj) => (
                      <MenuItem key={touchObj.id} value={touchObj.touch}>
                        {touchObj.touch}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.purity}
                    size="small"
                    type="number"
                    InputProps={{ readOnly: true }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.remarks}
                    size="small"
                    type="text"
                    onChange={(e) =>
                      handleItemChange(
                        "product",
                        index,
                        "remarks",
                        e.target.value
                      )
                    }
                  />
                </TableCell>

                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => deleteProductItem(index, row.id)}
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography sx={{ mt: 1 }}>
          <strong>Total Item Weight:</strong> {totalProductWeight.toFixed(2)}{" "}
          &nbsp;&nbsp;&nbsp;
          <strong>Current Balance Weight:</strong>{" "}
          {currentBalanceWeight.toFixed(2)}
        </Typography>

        {/* Add Scrap Items Section */}
        <Button onClick={addScrapItem} variant="outlined" sx={{ mt: 3 , backgroundColor:' #f8f9fa', fontWeight:'530' }}>
          Add Scrap Items
        </Button>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Item
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Weight
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Touch
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Purity
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Remarks
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  backgroundColor: "#38383e",
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scrapItems.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    select
                    value={row.item}
                    size="small"
                    onChange={(e) =>
                      handleItemChange("scrap", index, "item", e.target.value)
                    }
                  >
                    {itemOptions.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.weight}
                    size="small"
                    type="number"
                    autoComplete="off"
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) =>
                      handleItemChange("scrap", index, "weight", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    value={row.touch}
                    size="small"
                    onChange={(e) =>
                      handleItemChange("scrap", index, "touch", e.target.value)
                    }
                  >
                    {touchOptions.map((touchObj) => (
                      <MenuItem key={touchObj.id} value={touchObj.touch}>
                        {touchObj.touch}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.purity}
                    size="small"
                    type="number"
                    InputProps={{ readOnly: true }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.remarks}
                    size="small"
                    type="text"
                    onChange={(e) =>
                      handleItemChange(
                        "scrap",
                        index,
                        "scrapremarks",
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => deleteScrapItem(index, row.id)}
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography sx={{ mt: 1 }}>
          <strong>Total Scrap Weight:</strong> {totalScrapWeight.toFixed(2)}{" "}
          &nbsp;&nbsp;&nbsp;
          <strong>Total Wastage:</strong> {totalWastage.toFixed(2)}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button  variant="outlined"  onClick={handleClose}>Close</Button>

        {mode === "add" && (
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        )}

        {mode === "view" && (
          <Button onClick={handleSaveItems} variant="contained" color="primary">
            Save Items
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CastingEntryViewModal;
