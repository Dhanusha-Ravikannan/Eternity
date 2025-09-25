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

const MasterCustomerReport = () => {
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchBills();
    fetchCustomers();
    fetchTransactions();
  }, []);

  const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (!isNaN(Date.parse(dateStr))) return new Date(dateStr);
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const fetchBills = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_SERVER_URL}/api/bills`);
      console.log("Fetched bills:", data);
      setBills(data);
      setAllBills(data);
    } catch (error) {
      console.error("Failed to fetch bills", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers`);
      setCustomers(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching customers:", error.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/transactions`
      );
      console.log("Fetched transactions:", response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };

  const calculateAdvanceUsed = () => {
    const sortedBills = [...bills].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const customerTransactions = {};
    transactions.forEach((t) => {
      const cid = t.customer_id || t.customerId;
      if (!cid || !(parseFloat(t.purity) > 0)) return;
      if (!customerTransactions[cid]) {
        customerTransactions[cid] = [];
      }
      customerTransactions[cid].push({
        ...t,
        purity: parseFloat(t.purity) || 0,
        date: parseDateSafe(t.date || t.createdAt),
      });
    });

    Object.keys(customerTransactions).forEach((cid) => {
      customerTransactions[cid].sort((a, b) => a.date - b.date);
    });

    const remainingPurityByTxn = {};
    Object.values(customerTransactions)
      .flat()
      .forEach((t) => {
        remainingPurityByTxn[t.id] = t.purity;
      });

    const advanceUsedMap = {};

    sortedBills.forEach((bill) => {
      const customerId = bill.customer_id || bill.customerId;

      const billDate = parseDateSafe(bill.date || bill.createdAt);
      let billPure = parseFloat(bill.total_pure) || 0;
      let advanceUsed = 0;

      const txns = customerTransactions[customerId] || [];

      const eligibleTxns = txns.filter((txn) => txn.date <= billDate);

      for (const txn of eligibleTxns) {
        if (billPure <= 0) break;

        let available = remainingPurityByTxn[txn.id] || 0;
        if (available > 0) {
          const toUse = Math.min(billPure, available);
          advanceUsed += toUse;
          billPure -= toUse;
          remainingPurityByTxn[txn.id] -= toUse; 
        }
      }

      advanceUsedMap[bill.id] = advanceUsed;
    });

    return advanceUsedMap;
  };

  const handleFilter = () => {
    let filtered = allBills;

    if (fromDate && toDate) {
      filtered = filtered.filter((bill) => {
        const billDate = new Date(bill.createdAt).toISOString().split("T")[0];
        return billDate >= fromDate && billDate <= toDate;
      });
    }

    if (customerFilter) {
      filtered = filtered.filter((bill) => bill.customer_id == customerFilter);
    }

    setBills(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setCustomerFilter("");
    setBills(allBills);
  };

  const calculateCustomerSummary = () => {
    const advanceUsedMap = calculateAdvanceUsed();
    const summary = {};

    bills.forEach((bill) => {
      const customerId = bill.customer_id;
      const customerName = bill.customer?.name || `Customer ${customerId}`;
      const advanceUsed = advanceUsedMap[bill.id] || 0;

      if (!summary[customerId]) {
        summary[customerId] = {
          name: customerName,
          totalBills: 0,
          totalAmount: 0,
          totalPure: 0,
          totalGold: 0,
          totalAdvanceUsed: 0,
        };
      }

      summary[customerId].totalBills += 1;
      summary[customerId].totalAmount += parseFloat(bill.total_amount) || 0;
      summary[customerId].totalPure += parseFloat(bill.total_pure) || 0;
      summary[customerId].totalAdvanceUsed += advanceUsed;

      const billGold =
        bill.billItems?.reduce(
          (sum, item) => sum + (parseFloat(item.weight) || 0),
          0
        ) || 0;
      summary[customerId].totalGold += billGold;
    });

    return summary;
  };

  const calculateOverallTotals = () => {
    const advanceUsedMap = calculateAdvanceUsed();

    return bills.reduce(
      (totals, bill) => {
        const advanceUsed = advanceUsedMap[bill.id] || 0;

        totals.totalBills += 1;
        totals.totalAmount += parseFloat(bill.total_amount) || 0;
        totals.totalPure += parseFloat(bill.total_pure) || 0;
        totals.totalAdvanceUsed += advanceUsed;

        const billGold =
          bill.billItems?.reduce(
            (sum, item) => sum + (parseFloat(item.weight) || 0),
            0
          ) || 0;
        totals.totalGold += billGold;

        return totals;
      },
      {
        totalBills: 0,
        totalAmount: 0,
        totalPure: 0,
        totalGold: 0,
        totalAdvanceUsed: 0,
      }
    );
  };

  const customerSummary = calculateCustomerSummary();
  const overallTotals = calculateOverallTotals();
  const advanceUsedMap = calculateAdvanceUsed();

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(
      "Customer Report Details",
      doc.internal.pageSize.getWidth() / 2,
      15,
      {
        align: "center",
      }
    );

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Total Bills",
          "Total Gold Weight",
          "Total Pure Weight",
          "Total Amount",
          "Total Advance Used",
        ],
      ],
      body: [
        [
          overallTotals.totalBills,
          overallTotals.totalGold.toFixed(2),
          overallTotals.totalPure.toFixed(2),
          `₹${overallTotals.totalAmount.toFixed(2)}`,
          overallTotals.totalAdvanceUsed.toFixed(2),
        ],
      ],
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185] },
    });

    if (Object.keys(customerSummary).length > 0) {
      const summaryRows = Object.entries(customerSummary).map(
        ([customerId, data]) => [
          data.name,
          data.totalBills,
          data.totalGold.toFixed(2),
          data.totalPure.toFixed(2),
          `₹${data.totalAmount.toFixed(2)}`,
          data.totalAdvanceUsed.toFixed(2),
        ]
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [
          [
            "Customer",
            "Bills",
            "Gold Weight",
            "Pure Weight",
            "Total Amount",
            "Advance Used",
          ],
        ],
        body: summaryRows,
        styles: { halign: "center" },
        headStyles: { fillColor: [39, 174, 96] },
      });
    }

    const tableColumn = [
      "S.No",
      "Bill No",
      "Date",
      "Customer",
      "Gold Rate",
      "Total Gold",
      "Total Pure",
      "Advance Used",
      "Net Pure",
      "Total Amount",
      "Grand Total",
      "Cash Balance",
    ];

    const tableRows = bills.map((bill, index) => {
      const advanceUsed = advanceUsedMap[bill.id] || 0;
      const netPure = Math.max(0, parseFloat(bill.total_pure) - advanceUsed);

      return [
        index + 1,
        bill.bill_no,
        new Date(bill.createdAt).toLocaleDateString(),
        bill.customer?.name || "-",
        bill.gold_rate ? `₹${bill.gold_rate}` : "-",
        overallTotals.totalGold.toFixed(2),
        bill.total_pure,
        advanceUsed.toFixed(2),
        netPure.toFixed(2),
        `₹${bill.total_amount}`,
        `₹${bill.grand_total}`,
        `₹${bill.cash_balance}`,
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: [52, 73, 94] },
    });

    doc.save("Customer_Report.pdf");
  };

  return (
    <>
      <Navbar />
      <Box>
        <center>
          <Typography variant="h5" gutterBottom sx={{ mb: 5, mt: 5 }}>
            Customer Report
          </Typography>
        </center>

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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={customerFilter}
              label="Customer"
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
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
            style={{ marginLeft: "28rem" }}
          >
            Download as PDF
          </Button>
        </Stack>

        <div className={styles.summarySection}>
          <h4>Overall Summary</h4>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span>Total Bills:</span>
              <span>{overallTotals.totalBills}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Gold Weight:</span>
              <span>{overallTotals.totalGold.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Pure Weight:</span>
              <span>{overallTotals.totalPure.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount:</span>
              <span>₹{overallTotals.totalAmount.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Advance Used:</span>
              <span>{overallTotals.totalAdvanceUsed.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {Object.keys(customerSummary).length > 0 && (
          <div className={styles.summarySection}>
            <h4>Customer-wise Summary</h4>
            <div className={styles.summaryGrid}>
              {Object.entries(customerSummary).map(([customerId, data]) => (
                <React.Fragment key={customerId}>
                  <div className={styles.summaryItem}>
                    <span>{data.name} Bills:</span>
                    <span>{data.totalBills}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{data.name} Gold Weight:</span>
                    <span>{data.totalGold.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{data.name} Pure Weight:</span>
                    <span>{data.totalPure.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{data.name} Total Amount:</span>
                    <span>₹{data.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{data.name} Advance Used:</span>
                    <span>{data.totalAdvanceUsed.toFixed(2)}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <TableContainer className={styles.itemList}>
          <Table className={styles.customerTable}>
            <TableHead>
              <TableRow className={styles.tableHeadRow}>
                <TableCell rowSpan={2}>S.No</TableCell>
                <TableCell rowSpan={2}>Bill No</TableCell>
                <TableCell rowSpan={2}>Date</TableCell>
                <TableCell rowSpan={2}>Customer</TableCell>
                <TableCell rowSpan={2}>Gold Rate</TableCell>
                <TableCell colSpan={6} align="center">
                  Bill Items
                </TableCell>
                <TableCell colSpan={5} align="center">
                  Received Items
                </TableCell>
                <TableCell rowSpan={2}>Total Pure</TableCell>
                <TableCell rowSpan={2}>Advance Used</TableCell>
                <TableCell rowSpan={2}>Net Pure</TableCell>
                <TableCell rowSpan={2}>Total Amount</TableCell>
                <TableCell rowSpan={2}>Grand Total</TableCell>
              </TableRow>
              <TableRow className={styles.itemname}>
                <TableCell>Item Name</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Stone Weight</TableCell>
                <TableCell>Total Weight</TableCell>
                <TableCell>Pure</TableCell>
                <TableCell>Amount</TableCell>

                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Gold</TableCell>
                <TableCell>Purity WT</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bills.length > 0 ? (
                bills.map((bill, billIndex) => {
                  const billItems = bill.billItems || [];
                  const receivedItems = bill.receivedItems || [];
                  const advanceUsed = advanceUsedMap[bill.id] || 0;
                  const netPure = Math.max(
                    0,
                    parseFloat(bill.total_pure) - advanceUsed
                  );

                  const maxRows =
                    Math.max(billItems.length, receivedItems.length) || 1;

                  return (
                    <>
                      {Array.from({ length: maxRows }).map((_, rowIndex) => {
                        const item = billItems[rowIndex];
                        const rItem = receivedItems[rowIndex];

                        return (
                          <TableRow key={`${bill.id}-${rowIndex}`}>
                            {rowIndex === 0 && (
                              <>
                                <TableCell rowSpan={maxRows}>
                                  {billIndex + 1}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {bill.bill_no}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {new Date(
                                    bill.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {bill.customer?.name || "-"}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {bill.gold_rate ? `₹${bill.gold_rate}` : "-"}
                                </TableCell>
                              </>
                            )}

                            <TableCell>{item?.item_name || "-"}</TableCell>
                            <TableCell>{item?.weight || "-"}</TableCell>
                            <TableCell>{item?.stone_weight || "-"}</TableCell>
                            <TableCell>{item?.total_weight || "-"}</TableCell>
                            <TableCell>{item?.pure || "-"}</TableCell>
                            <TableCell>
                              {item?.amount != null ? `₹${item.amount}` : "-"}
                            </TableCell>

                            <TableCell>{rItem?.type || "-"}</TableCell>
                            <TableCell>{rItem?.date || "-"}</TableCell>
                            <TableCell>{rItem?.gold || "-"}</TableCell>
                            <TableCell>
                              {rItem?.purity_weight?.toFixed(3) || "-"}
                            </TableCell>
                            <TableCell>
                              {rItem?.amount?.toFixed(2) || "-"}
                            </TableCell>

                            {rowIndex === 0 && (
                              <>
                                <TableCell rowSpan={maxRows}>
                                  {bill.total_pure}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {advanceUsed.toFixed(2)}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  {netPure.toFixed(2)}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  ₹{bill.total_amount}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  ₹{bill.grand_total}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={19} align="center">
                    No bills found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default MasterCustomerReport;
