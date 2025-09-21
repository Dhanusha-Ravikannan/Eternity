// import React from 'react'
// import Navbar from '../Navbar/Navbar'

// const StockReport = () => {
//   return (
//     <> 
//     <Navbar/>
//     <div>StockReport</div>
//     </>
//   )
// }

// export default StockReport

// src/components/Reports/StockReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import { TextField, Button } from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./StockReport.module.css";

const StockReport = () => {
  const [stockItems, setStockItems] = useState([]);
  const [qcItems, setQcItems] = useState([]);
  const [touchSummary, setTouchSummary] = useState({});
  const [movementSummary, setMovementSummary] = useState({ inflow: 0, outflow: 0 });
  const [qcSummary, setQcSummary] = useState({ pending: 0, passed: 0, failed: 0 });

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchStock();
    fetchQCStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/stock`);
      const data = res.data;
      setStockItems(data);
      calculateTouchSummary(data);
      calculateMovementSummary(data);
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  const fetchQCStock = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/qcstock`);
      const data = res.data;
      setQcItems(data);
      calculateQcSummary(data);
    } catch (err) {
      console.error("Error fetching QC stock:", err);
    }
  };

  // Gold Stock Report (touch-wise balance)
  const calculateTouchSummary = (items) => {
    const summary = {};
    items.forEach((item) => {
      const touch = item.touch?.touch || item.touch_id;
      const weight = parseFloat(item.weight) || 0;
      if (touch) {
        summary[touch] = (summary[touch] || 0) + weight;
      }
    });
    setTouchSummary(summary);
  };

  // Stock Movement Report
  const calculateMovementSummary = (items) => {
    let inflow = 0;
    let outflow = 0;

    items.forEach((item) => {
      const weight = parseFloat(item.weight) || 0;
      if (item.purchaseId || item.type === "ScrapItems") {
        inflow += weight;
      } else {
        outflow += weight;
      }
    });

    setMovementSummary({ inflow, outflow });
  };

  // QC Stock Report
  const calculateQcSummary = (items) => {
    let pending = 0,
      passed = 0,
      failed = 0;

    items.forEach((i) => {
      if (i.status === "Pending") pending++;
      if (i.status === "Passed") passed++;
      if (i.status === "Failed") failed++;
    });

    setQcSummary({ pending, passed, failed });
  };

  // Filter stock by date
  const applyFilters = () => {
    if (!fromDate || !toDate) return;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = stockItems.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= from && itemDate <= to;
    });

    calculateTouchSummary(filtered);
    calculateMovementSummary(filtered);
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    calculateTouchSummary(stockItems);
    calculateMovementSummary(stockItems);
  };

  // ---------- EXPORT FUNCTIONS ----------

  const exportExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportPDF = (title, columns, rows, fileName) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
      startY: 20,
      head: [columns],
      body: rows,
    });
    doc.save(`${fileName}.pdf`);
  };

  // ---------- REPORT DATA PREP ----------

  const goldStockData = Object.entries(touchSummary).map(([touch, weight]) => ({
    Touch: touch,
    Weight: weight.toFixed(2),
  }));

  const movementData = [
    { Type: "Inflow (Purchase, Scrap)", Weight: movementSummary.inflow.toFixed(2) },
    { Type: "Outflow (Allocations, Billing)", Weight: movementSummary.outflow.toFixed(2) },
  ];

  const qcData = [
    { Status: "Pending", Count: qcSummary.pending },
    { Status: "Passed", Count: qcSummary.passed },
    { Status: "Failed", Count: qcSummary.failed },
  ];

  return (
    <>
      <Navbar />
      <div className={styles.reportContainer}>
        <h3 className={styles.reportTitle}>Stock Reports</h3>

        {/* Filters */}
        <div className={styles.dateFilter}>
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={applyFilters}>
            Filter
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {/* Gold Stock Report */}
        <div className={styles.summarySection}>
          <div className={styles.sectionHeader}>
            <h4>Gold Stock Report – Touch-wise Balance</h4>
            <div>
              <Button
                size="small"
                onClick={() => exportExcel(goldStockData, "GoldStockReport")}
              >
                Excel
              </Button>
              <Button
                size="small"
                onClick={() =>
                  exportPDF(
                    "Gold Stock Report",
                    ["Touch", "Weight"],
                    goldStockData.map((r) => [r.Touch, r.Weight]),
                    "GoldStockReport"
                  )
                }
              >
                PDF
              </Button>
            </div>
          </div>
          <div className={styles.summaryGrid}>
            {goldStockData.map((row) => (
              <div key={row.Touch} className={styles.summaryItem}>
                <span>Touch {row.Touch}</span>
                <span>{row.Weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement Report */}
        <div className={styles.summarySection}>
          <div className={styles.sectionHeader}>
            <h4>Stock Movement Report – Inflow vs Outflow</h4>
            <div>
              <Button
                size="small"
                onClick={() => exportExcel(movementData, "StockMovementReport")}
              >
                Excel
              </Button>
              <Button
                size="small"
                onClick={() =>
                  exportPDF(
                    "Stock Movement Report",
                    ["Type", "Weight"],
                    movementData.map((r) => [r.Type, r.Weight]),
                    "StockMovementReport"
                  )
                }
              >
                PDF
              </Button>
            </div>
          </div>
          <div className={styles.summaryGrid}>
            {movementData.map((row) => (
              <div key={row.Type} className={styles.summaryItem}>
                <span>{row.Type}</span>
                <span>{row.Weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QC Stock Report */}
        <div className={styles.summarySection}>
          <div className={styles.sectionHeader}>
            <h4>QC Stock Report – Status</h4>
            <div>
              <Button
                size="small"
                onClick={() => exportExcel(qcData, "QCStockReport")}
              >
                Excel
              </Button>
              <Button
                size="small"
                onClick={() =>
                  exportPDF(
                    "QC Stock Report",
                    ["Status", "Count"],
                    qcData.map((r) => [r.Status, r.Count]),
                    "QCStockReport"
                  )
                }
              >
                PDF
              </Button>
            </div>
          </div>
          <div className={styles.summaryGrid}>
            {qcData.map((row) => (
              <div key={row.Status} className={styles.summaryItem}>
                <span>{row.Status}</span>
                <span>{row.Count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockReport;
