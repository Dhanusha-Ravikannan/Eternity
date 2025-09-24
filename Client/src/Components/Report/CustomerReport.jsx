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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, []);

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

  // Calculate summary data by customer
  const calculateCustomerSummary = () => {
    const summary = {};

    bills.forEach((bill) => {
      const customerId = bill.customer_id;
      const customerName = bill.customer?.name || `Customer ${customerId}`;

      if (!summary[customerId]) {
        summary[customerId] = {
          name: customerName,
          totalBills: 0,
          totalAmount: 0,
          totalPure: 0,
          totalGold: 0,
        };
      }

      summary[customerId].totalBills += 1;
      summary[customerId].totalAmount += parseFloat(bill.total_amount) || 0;
      summary[customerId].totalPure += parseFloat(bill.total_pure) || 0;

      // Calculate total gold from bill items
      const billGold =
        bill.billItems?.reduce(
          (sum, item) => sum + (parseFloat(item.weight) || 0),
          0
        ) || 0;
      summary[customerId].totalGold += billGold;
    });

    return summary;
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    return bills.reduce(
      (totals, bill) => {
        totals.totalBills += 1;
        totals.totalAmount += parseFloat(bill.total_amount) || 0;
        totals.totalPure += parseFloat(bill.total_pure) || 0;

        const billGold =
          bill.billItems?.reduce(
            (sum, item) => sum + (parseFloat(item.weight) || 0),
            0
          ) || 0;
        totals.totalGold += billGold;

        return totals;
      },
      { totalBills: 0, totalAmount: 0, totalPure: 0, totalGold: 0 }
    );
  };

  const customerSummary = calculateCustomerSummary();
  const overallTotals = calculateOverallTotals();

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

    // Overall Summary
    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Total Bills",
          "Total Gold Weight",
          "Total Pure Weight",
          "Total Amount",
        ],
      ],
      body: [
        [
          overallTotals.totalBills,
          overallTotals.totalGold.toFixed(2),
          overallTotals.totalPure.toFixed(2),
          `₹${overallTotals.totalAmount.toFixed(2)}`,
        ],
      ],
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Customer-wise Summary
    if (Object.keys(customerSummary).length > 0) {
      const summaryRows = Object.entries(customerSummary).map(
        ([customerId, data]) => [
          data.name,
          data.totalBills,
          data.totalGold.toFixed(2),
          data.totalPure.toFixed(2),
          `₹${data.totalAmount.toFixed(2)}`,
        ]
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [
          ["Customer", "Bills", "Gold Weight", "Pure Weight", "Total Amount"],
        ],
        body: summaryRows,
        styles: { halign: "center" },
        headStyles: { fillColor: [39, 174, 96] },
      });
    }

    // Bills Table
    const tableColumn = [
      "S.No",
      "Bill No",
      "Date",
      "Customer",
      "Gold Rate",
      "Total Gold",
      "Total Pure",
      "Total Amount",
      "Grand Total",
      "Cash Balance",
    ];

    const tableRows = bills.map((bill, index) => [
      index + 1,
      bill.bill_no,
      new Date(bill.createdAt).toLocaleDateString(),
      bill.customer?.name || "-",
      bill.gold_rate ? `₹${bill.gold_rate}` : "-",
      overallTotals.totalGold.toFixed(2),
      bill.total_pure,
      `₹${bill.total_amount}`,
      `₹${bill.grand_total}`,
      `₹${bill.cash_balance}`,
    ]);

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

        {/* Summary Section */}
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
          </div>
        </div>

        {/* Customer-wise Summary */}
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
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Bills Table */}
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
                <TableCell rowSpan={2}>Total Amount</TableCell>
                <TableCell rowSpan={2}>Grand Total</TableCell>
                <TableCell rowSpan={2}>Cash Balance</TableCell>
                <TableCell rowSpan={2}>Actions</TableCell>
              </TableRow>
              <TableRow>
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

                  // Take max rows needed
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

                            {/* Bill Items */}
                            <TableCell>{item?.item_name || "-"}</TableCell>
                            <TableCell>{item?.weight || "-"}</TableCell>
                            <TableCell>{item?.stone_weight || "-"}</TableCell>
                            <TableCell>{item?.total_weight || "-"}</TableCell>
                            <TableCell>{item?.pure || "-"}</TableCell>
                            <TableCell>
                              {item?.amount != null ? `₹${item.amount}` : "-"}
                            </TableCell>

                            {/* Received Items */}
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
                                  ₹{bill.total_amount}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  ₹{bill.grand_total}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  ₹{bill.cash_balance}
                                </TableCell>
                                <TableCell rowSpan={maxRows}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewDetails(bill)}
                                  >
                                    View Details
                                  </Button>
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
                  <TableCell colSpan={18} align="center">
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
