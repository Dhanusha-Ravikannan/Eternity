import React, { useState, useEffect } from "react";
import { Button, TextField, Stack, MenuItem } from "@mui/material";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import styles from "./CastingMeltingReports.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CastingMeltingReports = () => {
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [castingNames, setCastingNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");

  // Fetch all entries & casting names
  const fetchAllData = async () => {
    try {
      const [entryRes, castingRes] = await Promise.all([
        axios.get(`${BACKEND_SERVER_URL}/api/castingentry`),
        axios.get(`${BACKEND_SERVER_URL}/api/casting`), 
      ]);
      setEntries(entryRes.data);
      setAllEntries(entryRes.data);
      setCastingNames(castingRes.data);
    } catch (err) {
      console.error("Error fetching dropdown data", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply date + name filters
  const handleFilter = () => {
    let filtered = allEntries;

    if (fromDate && toDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date).toISOString().split("T")[0];
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    if (selectedName) {
      filtered = filtered.filter(
        (entry) => entry.customer?.name === selectedName
      );
    }

    setEntries(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedName("");
    setEntries(allEntries);
  };


   //  PDF Download
   const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title in center
    doc.setFontSize(16);
    doc.text("Casting/Melting Report", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });

    // Prepare table data
    const tableColumn = [
      "S.No",
      "Date",
      "Time",
      "Name",
      "Before Wt",
      "Product Item(s)",
      "Product Qty",
      "Scrap Item(s)",
      "Scrap Qty",
      "Total Item Wt",
      "Balance Wt",
      "Scrap Wt",
      "Wastage",
      "Next Process",
    ];

    const tableRows = entries.map((entry, index) => [
      index + 1,
      entry.date ? new Date(entry.date).toLocaleDateString() : "-",
      entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : "-",
      entry.customer?.name || "-",
      entry.final_weight ?? "-",
      Array.isArray(entry.productItems) ? entry.productItems.join(", ") : "-",
      entry.productQty || "-",
      Array.isArray(entry.scrapItems) ? entry.scrapItems.join(", ") : "-",
      entry.scrapQty || "-",
      entry.totalItemWeight ? entry.totalItemWeight.toFixed(2) : "-",
      entry.currentBalanceWeight
        ? entry.currentBalanceWeight.toFixed(2)
        : "-",
      entry.totalScrapWeight ? entry.totalScrapWeight.toFixed(2) : "-",
      entry.totalWastage ? entry.totalWastage.toFixed(2) : "-",
      "Filing",
    ]);

    // AutoTable from row 25 (below title)
    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      margin: { left: 1, right: 1, top: 20 },
      tableWidth: "auto",
    });

    doc.save("Casting_Melting_Report.pdf");
  };

  return (
    <>
      <Navbar />

      <h5 className={styles.heading}>Casting/Melting Report</h5>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={2}
        ml={4}
        mt={1}
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

        {/*  Name dropdown filter */}
        <TextField
          select
          label=" Person Name"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          sx={{ width: "12rem" }}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          {castingNames.map((c) => (
            <MenuItem key={c.id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="outlined" onClick={handleFilter}>
          Filter
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>

        <Button style={{marginLeft:'34rem'}} variant="contained" color="primary" onClick={handleDownloadPDF}  >
          Download as PDF
        </Button>

      </Stack>

      <div className={styles.tablecontainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Name</th>
              {/* <th>Before Wt</th> */}  <th>Issue</th>
              {/* <th>Product Item(s)</th>
              <th>Product Qty</th>
              <th>Scrap Item(s)</th>
              <th>Scrap Qty</th> */}
              {/* <th style={{ width: "8rem" }}>Total Item Wt</th> */}<th>Receipt</th>
              <th>Balance Wt</th>
              {/* <th>Scrap Wt</th> */}
              {/* <th>Wastage</th> */} <th>Final Weight</th>
              <th>Next Process</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>
                  {entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                </td>
                <td>
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleTimeString()
                    : "-"}
                </td>
                <td>{entry.customer?.name || "-"}</td>
                <td>{entry.final_weight ?? "-"}</td>
                {/* <td>
                  {Array.isArray(entry.productItems)
                    ? entry.productItems.join(", ")
                    : "-"}
                </td>
                <td>{entry.productQty || "-"}</td>
                <td>
                  {Array.isArray(entry.scrapItems)
                    ? entry.scrapItems.join(", ")
                    : "-"}
                </td>
                <td>{entry.scrapQty || "-"}</td> */}
                <td>
                  {entry.totalItemWeight
                    ? entry.totalItemWeight.toFixed(2)
                    : "-"}
                </td>
                <td>
                  {entry.currentBalanceWeight
                    ? entry.currentBalanceWeight.toFixed(2)
                    : "-"}
                </td>
                {/* <td>
                  {entry.totalScrapWeight
                    ? entry.totalScrapWeight.toFixed(2)
                    : "-"}
                </td> */}
                <td>
                  {entry.totalWastage ? entry.totalWastage.toFixed(2) : "-"}
                </td>
                <td>Filing</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </>
  );
};

export default CastingMeltingReports;
