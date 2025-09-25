import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import {
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import styles from "./SalesReport.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("all");
  const [viewInvoice, setViewInvoice] = useState(null);

  // Fetch all bills (with customer info)
useEffect(() => {
  const fetchBills = async () => {
    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/bills`);
      const data = await res.json();
      setInvoices(data);
      setAllInvoices(data);

      // Extract unique customers from bills
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


  // Totals
  const totalWeight = invoices.reduce((sum, inv) => sum + (inv.gold_rate || 0), 0);
  const totalPurity = (
    invoices.reduce((sum, inv) => sum + (inv.total_pure || 0), 0) /
    (invoices.length || 1)
  ).toFixed(2);
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

  // Apply filters
  
  const applyFilters = () => {
    let filtered = [...allInvoices];
  
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999); 
  
    // Date filter
    if (from || to) {
      filtered = filtered.filter((inv) => {
        const invDate = new Date(inv.updatedAt);
        if (from && to) return invDate >= from && invDate <= to;
        if (from) return invDate >= from;
        if (to) return invDate <= to;
        return true;
      });
    }
  
    // Customer filter
    if (customerId !== "all") {
      filtered = filtered.filter(
        (inv) => inv.customer?.id === Number(customerId) //  ensure number
      );
    }
  
    setInvoices(filtered);
  };
  
// Reset filters
const resetFilters = () => {
  setFromDate("");
  setToDate("");
  setCustomerId("all");
  setInvoices(allInvoices);
};

  


// Inside your SalesReport component
const downloadPDF = () => {
  const doc = new jsPDF();
  
  // doc.setFontSize(14);
  // doc.text("Daily Sales Report", 14, 15);
  doc.setFontSize(16);
  doc.text("Daily Sales Report", doc.internal.pageSize.getWidth() / 2, 15, {
    align: "center",
  });

  // --- Summary Section ---
  const summaryY = 25;
  doc.setFontSize(10);
  doc.text(`Total Weight: ${totalWeight}`, 14, summaryY);
  doc.text(`Total Purity: ${totalPurity}`, 80, summaryY);
  doc.text(`Total Amount: ${totalAmount}`, 150, summaryY);
  doc.text(`Total Amount Received: ${totalAmountReceived}`, 14, summaryY + 6);
  doc.text(`Total Pure Received: ${totalPureReceived}`, 80, summaryY + 6);
  doc.text(`Total Cash Balance: ${totalCashBalance}`, 150, summaryY + 6);
  doc.text(`Total Pure Balance: ${totalPureBalance.toFixed(3)}`, 14, summaryY + 12);

  // --- Invoice Table ---
  const columns = [
    "S.No", "Invoice No", "Date", "Customer", "Total Weight", 
    "Total Purity", "Total Amount", "Amount Received", "Pure Received",
    "Cash Balance", "Pure Balance"
  ];

  const rows = invoices.map((inv, index) => [
    index + 1,
    inv.bill_no,
    new Date(inv.updatedAt).toLocaleDateString("en-GB"),
    inv.customer?.name || "-",
    inv.gold_rate,
    inv.total_pure,
    inv.total_amount,
    inv.amount_received || "-",
    inv.pure_received || "-",
    inv.cash_balance,
    inv.pure_balance.toFixed(3)
  ]);

  autoTable(doc, {
    startY: summaryY + 20, // start below summary
    head: [columns],
    body: rows,
    styles: { fontSize: 8 },
  
  });

  doc.save("SalesReport.pdf");
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
  onClick={downloadPDF}
  sx={{ marginLeft:'34.7rem'}}
>
  Download PDF
</Button>

</div>
        {/* Summary */}
        <div className={styles.summarySection}>
          <h4>Summary</h4>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span>Total Gold Rate:</span>
              <span>{totalWeight}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Purity:</span>
              <span>{totalPurity}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount:</span>
              <span>{totalAmount}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount Received:</span>
              <span>{totalAmountReceived}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Pure Received:</span>
              <span>{totalPureReceived}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Cash Balance:</span>
              <span>{totalCashBalance}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Pure Balance:</span>
              <span>{totalPureBalance .toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Table */}
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
                <th>Customer</th>
                <th> Gold Rate</th>
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
                  <td>{inv.gold_rate}</td>
                  <td>{inv.total_pure}</td>
                  <td>{inv.total_amount}</td>
                  <td>{inv.amount_received || "-"}</td>
                  {/* <td>{inv.pure_received || "-"} </td> */}
                  <td> {inv.receivedItems?.reduce(  (sum, row) => sum + (Number(row.purity_weight) || 0), 0 ) ?? 0} </td>

                  <td>{inv.cash_balance}</td>
                  <td>{inv.pure_balance.toFixed(3)}</td>
                  <td>
                    <Button
                      // variant="contained"
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
            {/* <tfoot className={styles.trEven}>
              <tr>
                <td colSpan={4} style={{ fontWeight: "bold" }}>Total</td>
                <td>{totalWeight}</td>
                <td>{totalPurity}</td>
                <td>{totalAmount}</td>
                <td>{totalAmountReceived}</td>
                <td>{totalPureReceived}</td>
                <td>{totalCashBalance}</td>
                <td>{totalPureBalance .toFixed(3)}</td>
                <td></td>
              </tr>
            </tfoot> */}
          </table>
        </div>
      </div>

      {/* View Modal */}
<Dialog
  open={!!viewInvoice}
  onClose={() => setViewInvoice(null)}
  maxWidth="md"
  fullWidth
>
  <center>
    <h4 style={{ padding: "0.5rem" }}>Invoice Details</h4>
  </center>

  <DialogContent dividers>
    {viewInvoice && (
      <>
        {/* Header Section */}
        <div className={styles.bill}>
          <div className={styles.leftSection}>
            <Typography><b>Invoice No: </b> {viewInvoice.bill_no}</Typography>
            <Typography><b>Customer Name: </b> {viewInvoice.customer?.name}</Typography>
            <Typography><b>Gold Rate: </b> {viewInvoice.gold_rate}</Typography>
          </div>
          <div className={styles.rightSection}>
            <Typography>
              <b>Date: </b>
              {new Date(viewInvoice.updatedAt).toLocaleDateString("en-GB")}
            </Typography>
            <Typography><b>Time: </b>{viewInvoice.time}</Typography>
          </div>
        </div>

        <div className={styles.billdetails}>Bill Details:</div>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Weight</th>
                <th>Stone Weight</th>
                <th>Total Weight</th>
                <th style={{ width: "5rem" }}>%</th>
                <th>Pure</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {viewInvoice.billItems?.length > 0 ? (
                viewInvoice.billItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.weight}</td>
                    <td>{item.stone_weight}</td>
                    <td>{item.total_weight}</td>
                    <td>{item.touch?.touch ?? item.touchId ?? "-"}</td>
                    <td>{item.pure}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}><b>Excess Balance</b></td>
                <td>{viewInvoice.customer_balance}</td>
                <td>{(viewInvoice.customer_balance * viewInvoice.gold_rate).toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={5}><b>Final Bill Total</b></td>
                <td>{viewInvoice.total_pure}</td>
                <td>{viewInvoice.total_amount}</td>
              </tr>
              <tr>
                <td colSpan={5} className={styles.trEven}><b>Total</b></td>
                <td className={styles.trEven}>
                  {(viewInvoice.total_pure - viewInvoice.customer_balance).toFixed(3)}
                </td>
                <td className={styles.trEven}>
                  {(viewInvoice.total_amount - viewInvoice.customer_balance * viewInvoice.gold_rate).toFixed(2)} <br />
                  {viewInvoice.total_amount - viewInvoice.customer_balance * viewInvoice.gold_rate >= 0
                    ? "Customer must give to Owner"
                    : "Owner must give to Customer"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={styles.bal}>
        <p><b>Prev Hallmark Balance:</b> {viewInvoice.prev_hallmark}</p>
      </div>

        <div className={styles.receivedHeader}>
          <div className={styles.billdetails}>Received Details:</div>
        </div>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Type</th>
                <th>Gold Rate</th>
                <th>Gold WT</th>
                <th>Touch</th>
                <th>Purity Weight</th>
                <th>Amount</th>
                <th>Hallmark Charge</th>
              </tr>
            </thead>
            <tbody>
              {viewInvoice.receivedItems?.length > 0 ? (
                viewInvoice.receivedItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{new Date(item.updatedAt).toLocaleDateString("en-GB")}</td>
                    <td>{item.type}</td>
                    <td>{item.gold_rate || "-"}</td>
                    <td>{item.gold || "-"}</td>
                    <td>{item.touch?.touch ?? "-"}</td>
                    <td>{item.purity_weight}</td>
                    <td>{item.amount || "-"}</td>
                    <td>{item.hallmark_charge || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No received items found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className={styles.trEven}>
              <tr>
                <td colSpan={6}>Total Purity</td>
                <td>

                    {viewInvoice.receivedItems?.reduce(
                      (sum, row) => sum + (Number(row.purity_weight) || 0),
                      0
                    ) ?? 0}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Balance Section */}
        <div className={styles.balance} style={{ marginTop: "2rem" }}>
          <p><b>Cash Balance:</b> ₹{viewInvoice.cash_balance}</p>
          <p><b>Excess Pure:</b> {viewInvoice.excessPure}</p>
          <p><b>Pure Balance:</b> {viewInvoice.pure_balance?.toFixed(3)}</p>
          <p><b>Hallmark Balance:</b> {viewInvoice.hallmark_balance}</p>
        </div>
      </>
    )}
  </DialogContent>

  <DialogActions>
    <Button variant="outlined" onClick={() => setViewInvoice(null)}>
      Close
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default SalesReport;
