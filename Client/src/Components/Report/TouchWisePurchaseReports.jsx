import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import styles from "./TouchWisePurchaseReport.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "../../Utils/formatNumber";



const TouchWisePurchaseReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [touchFilter, setTouchFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [uniqueTouches, setUniqueTouches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_SERVER_URL}/api/purchase`);
      setPurchases(data);
      setAllPurchases(data);

      // Extract unique touches
      const touches = [
        ...new Set(data.map((p) => p.TouchId?.touch || p.touch_id)),
      ];
      setUniqueTouches(touches);
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/addsupplier`);
      setSuppliers(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error.message);
    }
  };

  const handleFilter = () => {
    let filtered = allPurchases;

    if (fromDate && toDate) {
      filtered = filtered.filter((purchase) => {
        const purchaseDate = new Date(purchase.createdAt)
          .toISOString()
          .split("T")[0];
        return purchaseDate >= fromDate && purchaseDate <= toDate;
      });
    }

    if (touchFilter) {
      filtered = filtered.filter(
        (purchase) =>
          (purchase.TouchId?.touch || purchase.touch_id) == touchFilter
      );
    }

    if (supplierFilter) {
      filtered = filtered.filter(
        (purchase) =>
          (purchase.SupplierId?.id || purchase.supplier_id) == supplierFilter
      );
    }

    setPurchases(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setTouchFilter("");
    setSupplierFilter("");
    setPurchases(allPurchases);
  };

  // Calculate summary data by touch
  const calculateTouchSummary = () => {
    const summary = {};

    purchases.forEach((purchase) => {
      const touch = purchase.TouchId?.touch || purchase.touch_id;
      if (!summary[touch]) {
        summary[touch] = {
          totalWeight: 0,
          totalValue: 0,
          count: 0,
        };
      }

      summary[touch].totalWeight += parseFloat(purchase.weight) || 0;
      summary[touch].totalValue += parseFloat(purchase.totalValue) || 0;
      summary[touch].count += 1;
    });

    return summary;
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    return purchases.reduce(
      (totals, purchase) => {
        totals.totalWeight += parseFloat(purchase.weight) || 0;
        totals.totalValue += parseFloat(purchase.totalValue) || 0;
        totals.count += 1;
        return totals;
      },
      { totalWeight: 0, totalValue: 0, count: 0 }
    );
  };

  const touchSummary = calculateTouchSummary();
  const overallTotals = calculateOverallTotals();



  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Process Report Details", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });
  
    //  Overall Summary
    autoTable(doc, {
      startY: 25,
      head: [["Total Purchases", "Total Weight", "Total Value"]],
      body: [[
        overallTotals.count,
        overallTotals.totalWeight.toFixed(3),
        overallTotals.totalValue.toFixed(3),
        // `₹${overallTotals.totalValue.toFixed(3)}`,
        
      ]],
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185] },
    });
  
    //  Touch-wise Summary
    if (Object.keys(touchSummary).length > 0) {
      const summaryRows = Object.entries(touchSummary).map(([touch, data]) => [
        `Touch ${touch}`,
        data.count,
        data.totalWeight.toFixed(3),
        data.totalValue.toFixed(3),
        // `₹${data.totalValue.toFixed(3)}`,
      ]);
  
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Touch", "Purchases", "Weight", "Value"]],
        body: summaryRows,
        styles: { halign: "center" },
        headStyles: { fillColor: [39, 174, 96] },
      });
    }
  
    //  Purchases Table
    const tableColumn = [
      "S.No",
      "Date",
      "Supplier",
      "Item",
      "Touch",
      "Weight",
      "Rate",
      "Value",
      "Remarks",
    ];
  
    const tableRows = purchases.map((purchase, index) => [
      index + 1,
      new Date(purchase.createdAt).toLocaleDateString(),
      purchase.SupplierId?.name || "-",
      purchase.item,
      purchase.TouchId?.touch || purchase.touch_id,
      purchase.weight,
      purchase.rate,
      purchase.totalValue,
      // `₹${purchase.totalValue}`,
      purchase.remarks || "-",
    ]);
  
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: [52, 73, 94] },
    });
  
    doc.save("Purchase_Report.pdf");
  };
  

  return (
    <>
      <Navbar />
      <Box>
        <center>
        <Typography variant="h5" gutterBottom sx={{ mb: 5, mt: 5 }}>
          Purchase Report
        </Typography> </center>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          mb={3}
          ml={3}
          flexWrap="wrap"
        >
          <TextField
            type="date"
            label="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Touch</InputLabel>
            <Select
              value={touchFilter}
              label="Touch"
              onChange={(e) => setTouchFilter(e.target.value)}
            >
              <MenuItem value="">All Touches</MenuItem>
              {uniqueTouches.map((touch) => (
                <MenuItem key={touch} value={touch}>
                  {touch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Supplier</InputLabel>
            <Select
              value={supplierFilter}
              label="Supplier"
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <MenuItem value="">All Suppliers</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          <Button
  variant="contained"
  color="primary"
  onClick={exportPDF}
  style={{marginLeft:'28rem'}}
>
  Download as PDF
</Button>

        </Stack>

        <div className={styles.summarySection}>
          <h4>Summary</h4>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span>Total Purchases:</span>
              <span>{formatNumber(overallTotals.count)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Weight:</span>
              <span>{formatNumber(overallTotals.totalWeight.toFixed(3))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Value:</span>
              <span>₹{formatNumber(overallTotals.totalValue.toFixed(3))}</span>
            </div>
          </div>
        </div>

        {Object.keys(touchSummary).length > 0 && (
          <div className={styles.summarySection}>
            <h4>Touch-wise Summary</h4>
            <div className={styles.summaryGrid}>
              {Object.entries(touchSummary).map(([touch, data]) => (
                <React.Fragment key={touch}>
                  <div className={styles.summaryItem}>
                    <span>Touch {touch} Purchases:</span>
                    <span>{formatNumber(data.count)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Touch {touch} Weight:</span>
                    <span>{formatNumber(data.totalWeight.toFixed(3))}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Touch {touch} Value:</span>
                    <span>{formatNumber(data.totalValue.toFixed(3))}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Purchases Table */}
        <TableContainer className={styles.itemList}>
  <Table className={styles.customerTable} style={{ margin: 0 }}>
    <TableHead>
      <TableRow className={styles.tableHeadRow}>
        <TableCell>S.No</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Supplier</TableCell>
        <TableCell>Item</TableCell>
        <TableCell>Touch</TableCell>
        <TableCell>Weight</TableCell>
        <TableCell>Rate</TableCell>
        <TableCell>Value</TableCell>
        <TableCell>Remarks</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {purchases.length > 0 ? (
        purchases.map((purchase, index) => (
          <TableRow key={purchase.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{purchase.SupplierId?.name || "-"}</TableCell>
            <TableCell>{purchase.item}</TableCell>
            <TableCell>{purchase.TouchId?.touch || purchase.touch_id}</TableCell>
            <TableCell>{purchase.weight}</TableCell>
            <TableCell>{purchase.rate}</TableCell>
            <TableCell>₹{purchase.totalValue}</TableCell>
            <TableCell>{purchase.remarks || "-"}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={9} align="center">No purchases found</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

      </Box>
    </>
  );
};

export default TouchWisePurchaseReport;
