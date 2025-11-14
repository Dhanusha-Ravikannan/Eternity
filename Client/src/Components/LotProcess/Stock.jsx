import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import { Button, TextField } from "@mui/material";
import styles from "./Stock.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GiGoldBar } from "react-icons/gi";
import InventoryIcon from '@mui/icons-material/Inventory';

const Stock = () => {
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [touchSummary, setTouchSummary] = useState({});

  const fetchStockItems = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/stock`);
      setStockItems(response.data);
      setFilteredItems(response.data);
      calculateSummary(response.data);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };
  
  useEffect(() => {
    fetchStockItems();
  }, []);
  
  const calculateSummary = (items) => {
    const summary = {};

    items.forEach((item) => {
      const touch = item.touch?.touch ?? item.touch_id ?? item.touchValue ?? "Unknown";
      const weight = parseFloat(item.weight) || 0;
      
      if (touch) {
        if (!summary[touch]) {
          summary[touch] = 0;
        }
        summary[touch] += weight;
      }
    });

    setTouchSummary(summary);
  };

  
  const applyFilters = () => {
    let filtered = [...stockItems];
  
    if (fromDate && toDate) {
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T23:59:59");
  
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.purchaseId?.purchaseDate || item.createdAt);
        return itemDate >= from && itemDate <= to;
      });
    }
  
    if (customerName.trim()) {
      const nameLower = customerName.toLowerCase();
  
      filtered = filtered.filter((item) => {
  
        const castingName =
          item.castingItem?.castingEntry?.casting_customer?.name?.toLowerCase() || "";

        const filingName =
          item.filingItem?.filing_entry?.filing_person?.name?.toLowerCase() || "";
  
        const settingName =
          item.settingItem?.settingEntryId?.setting_person?.name?.toLowerCase() || "";

        const buffingName =
          item.buffingItem?.buffingEntryId?.buffing_person?.name?.toLowerCase() || "";
  
        const purchaseName =
          item.purchaseId?.SupplierId?.name?.toLowerCase() ||
          item.purchaseId?.supplier?.name?.toLowerCase() ||
          item.purchaseId?.supplierName?.toLowerCase() ||
          "";
  
        const transactionName =
          item.customer?.name?.toLowerCase() ||
          item.customer_transaction?.customer?.name?.toLowerCase() ||
          item.transactionCustomer?.name?.toLowerCase() ||
          "";
  
        return (
          castingName.includes(nameLower) ||
          filingName.includes(nameLower) ||
          settingName.includes(nameLower) ||
          buffingName.includes(nameLower) ||
          purchaseName.includes(nameLower) ||
          transactionName.includes(nameLower)
        );
      });
    }
  
    setFilteredItems(filtered);
    calculateSummary(filtered);
  };
  

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCustomerName("");
    setFilteredItems(stockItems);
    calculateSummary(stockItems);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Stock Report", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });

    if (Object.keys(touchSummary).length > 0) {
      doc.setFontSize(12);
      doc.text("Summary", 14, 25);

      const summaryData = Object.entries(touchSummary).map(([touch, weight]) => [
        `Touch ${touch}`,
        weight.toFixed(2),
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["Touch", "Total Weight"]],
        body: summaryData,
        theme: "grid",
        styles: { halign: "center" },
        headStyles: { fillColor: [56, 56, 62] },
      });
    }

    const tableColumn = [
      "S.No",
      "Date",
      "Time",
      "Name",
      "Item",
      "Weight",
      "Touch",
      "Purity",
      "Remarks",
      "Process",
    ];

const tableRows = filteredItems.map((item, index) => {
const displayDate = item.purchaseId?.purchaseDate || item.createdAt;
const dateObj = new Date(displayDate);
const dateString = dateObj.toLocaleDateString("en-GB");
const timeString = dateObj.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});


      const customerName =
        item.castingItem?.castingEntry?.casting_customer?.name ||
        item.filingItem?.filing_entry?.filing_person?.name ||
        item.settingItem?.settingEntryId?.setting_person?.name ||
        item.buffingItem?.buffingEntryId?.buffing_person?.name ||
        item.purchaseId?.SupplierId?.name ||
        item.customer?.name ||
        item.transactionCustomer?.name ||
        "-";

      const itemName =
        item.item?.name || item.purchaseId?.item || item.item_type || "-";

      const processName = item.castingItem
        ? "Casting"
        : item.filingItem
        ? "Filing"
        : item.settingItem
        ? "Setting"
        : item.buffingItem
        ? "Buffing"
        : item.purchaseId
        ? "Purchase"
        : "Customer Transaction";

      return [
        index + 1,
        dateString,
        timeString,
        customerName,
        itemName,
        item.weight ?? "-",
        item.touch?.touch ?? item.touch_id ?? "-",
        (item.item_purity).toFixed(3) ?? "-",
        item.remarks || "-",
        processName,
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 50,
      theme: "grid",
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [56, 56, 62] },
    });

    doc.save("Stock_Report.pdf");
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "2rem" }}>
        <h4 style={{ textAlign: "center", color: "black" }}>
        <GiGoldBar />  Scrap Items Stock  
        </h4>
        <br />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "0.5rem",
          }}
        >
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ ml: "2rem" }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Customer Name"
            type="text"
            sx={{ width: 200 }}
            margin="dense"
            size="small"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Button variant="outlined" onClick={applyFilters}>
            Filter
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            Reset
          </Button>
          <Button variant="contained" color="primary" onClick={downloadPDF} style={{marginLeft:'31rem'}}>
            Download PDF
          </Button>
        </div>

        {Object.keys(touchSummary).length > 0 && (
          <div className={styles.summarySection}>
            <h4>Summary</h4>
            <div className={styles.summaryGrid}>
              {Object.entries(touchSummary).map(([touch, weight]) => (
                <div key={touch} className={styles.summaryItem}>
                  <span>Touch {touch} Total Weight:</span>
                  <span>{weight.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredItems.length > 0 ? (
                    <div className={styles.tablecontainer} > 
        <table className={styles.table} style={{marginTop:'2rem'}}>
            <thead style={{ backgroundColor: "#38383e", color: "white" }}>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Time</th>
                <th>Name</th>
                <th>Item</th>
                <th>Weight</th>
                <th>Touch</th>
                <th>Purity</th>
                <th>Remarks</th>
                <th>Process</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const displayDate = item.purchaseId?.purchaseDate || item.createdAt;
const dateObj = new Date(displayDate);
const dateString = dateObj.toLocaleDateString("en-GB");
const timeString = dateObj.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});


                const customerName =
                  item.castingItem?.castingEntry?.casting_customer?.name ||
                  item.filingItem?.filing_entry?.filing_person?.name ||
                  item.settingItem?.settingEntryId?.setting_person?.name ||
                  item.buffingItem?.buffingEntryId?.buffing_person?.name ||
                  item.purchaseId?.SupplierId?.name ||
                  item.customer?.name ||
                  item.customer_transaction?.customer?.name ||
                  item.transactionCustomer?.name || 
                  "-";

                const itemName =
                  item.item?.name || item.purchaseId?.item || item.item_type  || "-";

                const processName = item.castingItem
                  ? "Casting"
                  : item.filingItem
                    ? "Filing"
                    : item.settingItem
                      ? "Setting"
                      : item.buffingItem
                        ? "Buffing"
                        :item.customer
                        ? "Receipt Voucher"
                        : item.purchaseId
                          ? "Purchase"
                          : "Customer Transaction";

                return (
                  <tr key={item.id} className={styles.trEven}  >
                    <td>{index + 1}</td>
                    <td>{dateString}</td>
                    <td>{timeString}</td>
                    <td>{customerName}</td>
                    <td>{itemName}</td>
                    <td>{item.weight ?? "-"}</td>
                    <td>{item.touch?.touch ?? item.touch_id ?? item.touchValue ?? "-"}</td>
                    <td>{(item.item_purity).toFixed(3) ?? "-"}</td>
                    <td>{item.remarks || "-"}</td>
                    <td>{processName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "gray" }}>
            No matching stock data found.
          </p>
        )}
      </div>
    </>
  );
};

export default Stock;