
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./ReceiptVoucherReport.module.css";
import { Button, TextField, Stack } from "@mui/material";

const ReceiptVoucherReport = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCustomerBalances, setSelectedCustomerBalances] = useState({
    openingBalance: 0,
    hallMarkBalance: 0,
  });

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_SERVER_URL}/api/receiptvoucher`);
        if (res.data && res.data.receipts) {
          setReceipts(res.data.receipts);
          setFilteredReceipts(res.data.receipts);
        }
      } catch (error) {
        console.error("Error fetching receipt vouchers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  useEffect(() => {
    let result = [...receipts];

    if (searchTerm) {
      result = result.filter((r) =>
        r.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (result.length > 0) {
        const firstCustomer = result[0].customerId;
        setSelectedCustomerBalances({
          openingBalance: firstCustomer?.openingBalance ?? 0,
          hallMarkBalance: result[0]?.hallMarkBalance ?? 0,
        });
      } else {
        setSelectedCustomerBalances({ openingBalance: 0, hallMarkBalance: 0 });
      }
    } else {
      setSelectedCustomerBalances({ openingBalance: 0, hallMarkBalance: 0 });
    }

    if (fromDate) {
      result = result.filter((r) => new Date(r.date) >= new Date(fromDate));
    }
    if (toDate) {
      result = result.filter((r) => new Date(r.date) <= new Date(toDate));
    }

    setFilteredReceipts(result);
  }, [searchTerm, fromDate, toDate, receipts]);

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setFilteredReceipts(receipts);
    setSelectedCustomerBalances({ openingBalance: 0, hallMarkBalance: 0 });
  };

  const handlePrintReport = () => {
    const printContent = document.getElementById("receiptReport").innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt Voucher Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #555; padding: 6px; text-align: center; }
            th { background: #f3f3f3; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Receipt Voucher Report</h2>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  return (
    <>
      <Navbar />
      <div className={styles.receiptContainer}>
        <div className={styles.receiptTitle}>
          <h4>Receipt Voucher Report</h4>
        </div>

        <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={2}
        ml={4}
        mt={1}
      >
         <TextField
            label="Search Customer"
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.filterInput}
          />
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.filterInput}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.filterInput}
          />
          <Button variant="outlined" color="error" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintReport}
            disabled={filteredReceipts.length === 0}
          >
            Print Report
          </Button>
      </Stack>

<div id="receiptReport">
  {searchTerm && (
    <div
      className={styles.balances}
      style={{ display: "flex", justifyContent: "start", gap: "2rem", marginBottom: "1rem" }}
    >
      <div style={{ color: selectedCustomerBalances.openingBalance >= 0 ? "green" : "red" }}>
        <b>Opening Balance: {Number(selectedCustomerBalances.openingBalance).toFixed(3)}</b>
      </div>
      <div style={{ color: selectedCustomerBalances.hallMarkBalance >= 0 ? "green" : "red" }}>
        <b>Hallmark Balance: {Number(selectedCustomerBalances.hallMarkBalance).toFixed(3)}</b>
      </div>
    </div>
  )}
  <div className={styles.tablecontainer}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Type</th>
          <th>Gold Rate</th>
          <th>Gold</th>
          <th>Touch</th>
          <th>Purity</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {filteredReceipts.length > 0 ? (
          filteredReceipts.map((r, index) => (
            <tr key={r.id}>
              <td>{index + 1}</td>
              <td>{r.date ? new Date (r.date). toLocaleDateString("en-GB") : "-"}</td>
              <td>{r.customerId?.name || "-"}</td>
              <td>{r.type || "-"}</td>
              <td>{r.gold_rate || "-"}</td>
              <td>{r.gold || "-"}</td>
              <td>{r.touchId?.touch || "-"}</td>
              <td>{r.purity || "-"}</td>
              <td>{r.amount || "-"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" style={{ textAlign: "center" }}>
              No receipts found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
    </>
  );
};

export default ReceiptVoucherReport;
