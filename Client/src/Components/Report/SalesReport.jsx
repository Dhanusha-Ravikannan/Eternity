import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import {
  TextField,
  Button,
  MenuItem,
  Dialog,
} from "@mui/material";
import styles from "./SalesReport.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BillDetailsNo from "../Billing/BillDetailsNo";
import { formatNumber } from "../../Utils/formatNumber";

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("all");
  const [viewInvoice, setViewInvoice] = useState(null);

useEffect(() => {
  const fetchBills = async () => {
    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/bills`);
      const data = await res.json();
      setInvoices(data);
      setAllInvoices(data);

      const uniqueCustomers = [];
      const seen = new Set();
      data.forEach((inv) => {
        if (inv.customer && !seen.has(inv.customer.id)) {
          seen.add(inv.customer.id);
          uniqueCustomers.push(inv.customer);
        }
      });
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };
  fetchBills();
}, []);

  const totalWeight = invoices.reduce((sum, inv) => sum + (inv.gold_rate || 0), 0);
  const totalPurity = ( invoices.reduce((sum, inv)=> sum + (inv.total_pure || 0),0))
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalAmountReceived = invoices.reduce(
    (sum, inv) => sum + (inv.amount_received || 0),
    0
  );
 
  const totalPureReceived = invoices.reduce((sum, inv) => {
    const invTotal = inv.receivedItems?.reduce(
      (s, row) => s + (Number(row.purity_weight) || 0),
      0
    ) ?? 0;
    return sum + invTotal;
  }, 0);
  
  const totalCashBalance = invoices.reduce(
    (sum, inv) => sum + (inv.cash_balance || 0),
    0
  );
  const totalPureBalance = invoices.reduce(
    (sum, inv) => sum + (inv.pure_balance || 0),
    0
  );

  const handleViewInvoice = (id) => {
    const invoice = invoices.find((inv) => inv.id === id);
    setViewInvoice(invoice);
  };

  const applyFilters = () => {
    let filtered = [...allInvoices];
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999); 
  
    if (from || to) {
      filtered = filtered.filter((inv) => {
        const invDate = new Date(inv.updatedAt);
        if (from && to) return invDate >= from && invDate <= to;
        if (from) return invDate >= from;
        if (to) return invDate <= to;
        return true;
      });
    }

    if (customerId !== "all") {
      filtered = filtered.filter(
        (inv) => inv.customer?.id === Number(customerId) 
      );
    }
  
    setInvoices(filtered);
  };
  
const resetFilters = () => {
  setFromDate("");
  setToDate("");
  setCustomerId("all");
  setInvoices(allInvoices);
};

const handleDownloadPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Daily Sales Report", 75, 15);

  // Summary Section
  doc.setFontSize(12);
  doc.text("Summary:", 14, 27);
  doc.setFontSize(10);

  // Define consistent X positions for each "column"
  const col1 = 14;   
  const col2 = 80;   
  const col3 = 140;  

  // Line 1 (Top row)
  doc.text(`Total Purity: ${totalPurity}`, col1, 37);
  doc.text(`Total Amount: ${totalAmount.toFixed(3)}`, col2, 37);
  doc.text(`Total Amount Received: ${totalAmountReceived}`, col3, 37);

  // Line 2 (Second row, same X alignment)
  doc.text(`Total Pure Received: ${totalPureReceived.toFixed(3)}`, col1, 43);
  doc.text(`Total Cash Balance: ${totalCashBalance}`, col2, 43);
  doc.text(`Total Pure Balance: ${totalPureBalance.toFixed(3)}`, col3, 43);

  // Table Data
  const tableData = invoices.map((inv, index) => [
    index + 1,
    inv.bill_no,
    new Date(inv.updatedAt).toLocaleDateString("en-GB"),
    inv.time || "-",
    inv.customer?.name || "-",
    inv.total_pure?.toFixed(3) || "-",
    inv.total_amount?.toFixed(3) || "-",
    inv.amount_received?.toFixed(3) || "-",
    (
      inv.receivedItems?.reduce(
        (sum, row) => sum + (Number(row.purity_weight) || 0),
        0
      ) || 0
    ).toFixed(3),
    inv.cash_balance?.toFixed(3) || "-",
    inv.pure_balance?.toFixed(3) || "-",
  ]);


  autoTable(doc, {
    startY: 52,
    head: [
      [
        "S.No",
        "Invoice No",
        "Date",
        "Time",
        "Customer Name",
        "Total Purity",
        "Total Amount",
        "Amount Received",
        "Pure Received",
        "Cash Balance",
        "Pure Balance",
      ],
    ],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 80, 132] },
    theme: "grid",
  });

  doc.save("Sales_Report.pdf");
};


  return (
    <>
      <Navbar />
      <div className={styles.reportContainer}>
        <div className={styles.reportTitle}>Daily Sales Reports</div>

        <div className={styles.filterSection}>
  <TextField
    type="date"
    label="From Date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
    sx={{ marginRight: "1rem" }}
  />
  <TextField
    type="date"
    label="To Date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
    sx={{ marginRight: "1rem" }}
  />
  <TextField
    select
    label="Customer"
    value={customerId}
    onChange={(e) => setCustomerId(e.target.value)}
    size="small"
    sx={{ marginRight: "1rem", minWidth: "200px" }}
  >
    <MenuItem value="all">All Customers</MenuItem>
    {customers.map((cust) => (
      <MenuItem key={cust.id} value={cust.id}>
        {cust.name}
      </MenuItem>
    ))}
  </TextField>
  <Button
    variant="outlined" color="primary"
    onClick={applyFilters}
    sx={{ marginRight: "0.5rem" }}
  >
    Filter
  </Button>
  <Button variant="outlined" color="primary" onClick={resetFilters}>
    Reset
  </Button>

<Button
  variant="contained"
  color="primary"
  onClick={handleDownloadPDF}
  sx={{ marginLeft:'34.7rem'}}
>
  Download PDF
</Button>


</div>

        <div className={styles.summarySection}>
          <h4>Summary</h4>
          <div className={styles.summaryGrid}>

            <div className={styles.summaryItem}>
              <span>Total Purity:</span>
              <span>{formatNumber(totalPurity.toFixed(3))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount:</span>
              <span>{formatNumber(totalAmount.toFixed(3))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount Received:</span>
              <span>{formatNumber(totalAmountReceived)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Pure Received:</span>
              <span>{formatNumber(totalPureReceived.toFixed(3))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Cash Balance:</span>
              <span>{formatNumber(totalCashBalance)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Pure Balance:</span>
              <span>{formatNumber(totalPureBalance .toFixed(3))}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Invoice Details: </h4>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Time</th>
                <th>Customer Name</th>
                <th>Total Purity</th>
                <th>Total Amount</th>
                <th>Amount Received</th>
                <th>Pure Received</th>
                <th>Cash Balance</th>
                <th>Pure Balance</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, index) => (
                <tr key={inv.id}>
                  <td>{index + 1}</td>
                  <td>{inv.bill_no}</td>
                  <td> {new Date(inv.updatedAt).toLocaleDateString("en-GB")} </td>
                  <td>{inv.time}</td>
                  <td>{inv.customer?.name}</td>
                  <td>{inv.total_pure}</td>
                  <td>{inv.total_amount}</td>
                  <td>{inv.amount_received || "-"}</td>
                 
                  <td>
  {(
    inv.receivedItems?.reduce(
      (sum, row) => sum + (Number(row.purity_weight) || 0),
      0
    ) || 0
  ).toFixed(3)}
</td>

                  <td>{inv.cash_balance}</td>
                  <td>{inv.pure_balance.toFixed(3)}</td>
                  <td>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewInvoice(inv.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

<Dialog
  open={!!viewInvoice}
  onClose={() => setViewInvoice(null)}
  maxWidth="md"
  fullWidth
>
<div style={{ padding: "1.3rem" }}> 
<center>
        <h4 style={{ padding: "0.5rem" }}>Invoice Details</h4>
      </center>
  {viewInvoice && (
    <BillDetailsNo
      viewBill={viewInvoice}
      setViewBill={setViewInvoice}
    />
  )}
  </div>
</Dialog>
    </>
  );
};

export default SalesReport;
