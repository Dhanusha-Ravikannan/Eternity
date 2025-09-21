// import React, { useEffect, useState } from "react";
// import { BACKEND_SERVER_URL } from "../../../Config/config";
// import Navbar from "../Navbar/Navbar";
// import { TextField, Button, MenuItem } from "@mui/material";
// import styles from "./Sales.module.css";

// const SalesReport = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [customerId, setCustomerId] = useState("");

//   //  Fetch customers
//   const fetchCustomers = async () => {
//     try {
//       const response = await fetch(`${BACKEND_SERVER_URL}/api/customers`);
//       const data = await response.json();
//       setCustomers(data);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//     }
//   };


//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const applyFilters = () => {
//     const filters = {};
//     if (fromDate) filters.fromDate = fromDate;
//     if (toDate) filters.toDate = toDate;
//     if (customerId) filters.customerId = customerId;
//   };

//   const resetFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setCustomerId("");

//   };

//   return (
//     <>
//       <Navbar />
      
//       <div className={styles.reportContainer}>
//         <h3 className={styles.reportTitle}> Daily Sales Reports</h3>

//         <div className={styles.dateFilter}>
//           <TextField
//             type="date"
//             label="From Date"
//             size="small"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//           <TextField
//             type="date"
//             label="To Date"
//             size="small"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//           <TextField
//             select
//             label="Customer"
//             size="small"
//             sx={{ width: "10rem" }}
//             value={customerId}
//             onChange={(e) => setCustomerId(e.target.value)}
//           >
//             <MenuItem value="">All Customers</MenuItem>
//             {customers.map((c) => (
//               <MenuItem key={c.id} value={c.id}>
//                 {c.name}
//               </MenuItem>
//             ))}
//           </TextField>
//           <Button variant="outlined" onClick={applyFilters}>
//             Filter
//           </Button>
//           <Button variant="outlined" onClick={resetFilters}>
//             Reset
//           </Button>
//         </div>

//         <div className={styles.section}>
//           <div className={styles.sectionHeader}>
//             <h4>Invoice Register</h4>
//           </div>
//           <table className={styles.table}>
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Invoice No</th>
//                 <th>Date</th>
//                 <th>Customer</th>
//                 <th>Total Weight</th>
//                 <th>Total Purity</th>
//                 <th>Total Amount</th>
//                 <th>Amount Received</th>
//                 <th>Pure Received</th>
//                 <th>Cash Balance</th>
//                 <th>Pure Balance</th>
//                 <th>View </th>

//               </tr>
//             </thead>
//             <tbody>

//             </tbody>
//           </table>

//         </div>
//       </div>
//     </>
//   );
// };

// export default SalesReport;


import React, { useState } from "react";
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

const dummyCustomers = [
  { id: "all", name: "All Customers" },
  { id: "1", name: "Rajesh Jewellers" },
  { id: "2", name: "Anand Gold Works" },
  { id: "3", name: "Kiran Ornaments" },
];

const dummyInvoices = [
  {
    id: 1,
    invoiceNo: "INV001",
    date: "2025-09-10",
    customer: "Rajesh Jewellers",
    totalWeight: 120,
    totalPurity: "91.6",
    totalAmount: 500000,
    amountReceived: 300000,
    pureReceived: 90,
    cashBalance: 200000,
    pureBalance: 30,
  },
  {
    id: 2,
    invoiceNo: "INV002",
    date: "2025-09-12",
    customer: "Anand Gold Works",
    totalWeight: 200,
    totalPurity: "99.9",
    totalAmount: 850000,
    amountReceived: 500000,
    pureReceived: 150,
    cashBalance: 350000,
    pureBalance: 50,
  },
];

const SalesReport = () => {
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [allInvoices] = useState(dummyInvoices);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("all");
  const [viewInvoice, setViewInvoice] = useState(null);


  // Calculate Totals
  const totalWeight = invoices.reduce((sum, inv) => sum + inv.totalWeight, 0);
  const totalPurity = (
    invoices.reduce((sum, inv) => sum + parseFloat(inv.totalPurity), 0) /
    (invoices.length || 1)
  ).toFixed(2);
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalAmountReceived = invoices.reduce(
    (sum, inv) => sum + inv.amountReceived,
    0
  );
  const totalPureReceived = invoices.reduce(
    (sum, inv) => sum + inv.pureReceived,
    0
  );
  const totalCashBalance = invoices.reduce(
    (sum, inv) => sum + inv.cashBalance,
    0
  );
  const totalPureBalance = invoices.reduce(
    (sum, inv) => sum + inv.pureBalance,
    0
  );

  const applyFilters = () => {
    let filtered = allInvoices;

    if (fromDate && toDate) {
      filtered = filtered.filter((inv) => {
        const invDate = new Date(inv.date).toISOString().split("T")[0];
        return invDate >= fromDate && invDate <= toDate;
      });
    }

    if (customerId !== "all") {
      filtered = filtered.filter((inv) => inv.customer === customerId);
    }

    setInvoices(filtered);
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCustomerId("all");
    setInvoices(allInvoices);
  };

  return (
    <>
      <Navbar />
      <div className={styles.reportContainer}>
        <h2 className={styles.reportTitle}>Daily Sales Reports</h2>

        {/* Filters */}
        <div className={styles.dateFilter}>
          <TextField
            type="date"
            label="From Date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To Date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Customer"
            size="small"
            sx={{ width: "12rem" }}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {dummyCustomers.map((c) => (
              <MenuItem key={c.id} value={c.name || c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={applyFilters}>
            Filter
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        <div className={styles.summarySection}>
  <h4>Summary</h4>
  <div className={styles.summaryGrid}>
    <div className={styles.summaryItem}>
      <span>Total Weight:</span>
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
      <span>{totalPureBalance}</span>
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
                <th>Customer</th>
                <th>Total Weight</th>
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
                  <td>{inv.invoiceNo}</td>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.totalWeight}</td>
                  <td>{inv.totalPurity}</td>
                  <td>{inv.totalAmount}</td>
                  <td>{inv.amountReceived}</td>
                  <td>{inv.pureReceived}</td>
                  <td>{inv.cashBalance}</td>
                  <td>{inv.pureBalance}</td>
                  <td>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setViewInvoice(inv)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className={styles.trEven}>
  <tr>
    <td colSpan={4} style={{ fontWeight: "bold" }}>Total</td>
    <td>{totalWeight}</td>
    <td>{totalPurity}</td>
    <td>{totalAmount}</td>
    <td>{totalAmountReceived}</td>
    <td>{totalPureReceived}</td>
    <td>{totalCashBalance}</td>
    <td>{totalPureBalance}</td>
    <td></td>
  </tr>
</tfoot>

          </table>
        </div>
      </div>

      {/* View Modal */}
      <Dialog
        open={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent dividers>
          {viewInvoice && (
            <>
              <Typography>Invoice No: {viewInvoice.invoiceNo}</Typography>
              <Typography>Date: {new Date(viewInvoice.date).toLocaleDateString()}</Typography>
              <Typography>Customer: {viewInvoice.customer}</Typography>
              <Typography>Total Weight: {viewInvoice.totalWeight}</Typography>
              <Typography>Total Purity: {viewInvoice.totalPurity}</Typography>
              <Typography>Total Amount: {viewInvoice.totalAmount}</Typography>
              <Typography>Amount Received: {viewInvoice.amountReceived}</Typography>
              <Typography>Pure Received: {viewInvoice.pureReceived}</Typography>
              <Typography>Cash Balance: {viewInvoice.cashBalance}</Typography>
              <Typography>Pure Balance: {viewInvoice.pureBalance}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInvoice(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalesReport;
