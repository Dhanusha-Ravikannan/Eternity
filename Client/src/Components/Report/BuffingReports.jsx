import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Button, TextField, Stack } from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./BuffingReports.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BuffingReports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [personData, setPersonData] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(0); 


  const fetchPersonsWithBalance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buffing");
      setPersonData(res.data);
      console.log('Filing response:', res.data)
    } catch (err) {
      console.error("Error fetching persons:", err);
    }
  };


    const fetchBuffing = async () => {
      try {
        const res = await axios.get( `${BACKEND_SERVER_URL}/api/buffingentry/get-report-entries` );
        const data = res.data || [];
  
        const nonEmptyBalanceEntries = data.filter(
          (entry) =>
            Array.isArray(entry.buffingTotalBalance) &&
            entry.buffingTotalBalance.length > 0
        );
  
        setEntries(nonEmptyBalanceEntries);
        setFiltered(nonEmptyBalanceEntries);
  
        const unique = [
          ...new Set(
            nonEmptyBalanceEntries
              .map((e) => e.buffing_person_name)
              .filter(Boolean)
          ),
        ];
        setPersons(unique);
      } catch (err) {
        console.error("Error fetching buffing entries:", err);
      }
    };
  
    
  useEffect(() => {
    fetchBuffing();
    fetchPersonsWithBalance(); 
  }, []);

  useEffect(() => {
    if (selectedPerson) {
      const found = personData.find((p) => p.name === selectedPerson);
      setSelectedBalance(found ? found.balance || 0 : 0);
    } else {
      setSelectedBalance(0);
    }
  }, [selectedPerson, personData]);
  

  const handleFilter = () => {
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filteredList = entries.filter((e) => {
      const dt = new Date(e.createdAt);
      const dateMatch = (!start || dt >= start) && (!end || dt <= end);
      const personMatch = !selectedPerson || e.buffing_person_name === selectedPerson;
      return dateMatch && personMatch;
    });

    setFiltered(filteredList);
  };

  const reset = () => {
    setFromDate("");
    setToDate("");
    setSelectedPerson("");
    setFiltered(entries);
  };

  const totals = filtered.reduce((acc, e) => {
    const bal = e.buffingTotalBalance?.[0] || {};
    acc.receipt += bal.receipt_weight || 0;
    acc.scrap += bal.total_scrap_weight || 0;
    return acc;
  }, { receipt: 0, scrap: 0, balance: 0 });


// Inside BuffingReports component, after totals calculation
const handleDownloadPDF = () => {
  const doc = new jsPDF();

  // --- Title ---
  doc.setFontSize(16);
  doc.text(
    "Buffing Report Details",
    doc.internal.pageSize.getWidth() / 2,
    15,
    { align: "center" }
  );

  // --- Summary Section ---
  const summaryY = 25;
  doc.setFontSize(10);
  doc.text(`Total Receipt Weight: ${totals.receipt.toFixed(3)}`, 14, summaryY);
  doc.text(`Total Scrap Weight: ${totals.scrap.toFixed(3)}`, 90, summaryY);

  // --- Table Columns ---
  const tableColumn = [
    "S.No",
    "Date",
    "Time",
    "Person",
    "Lot Number",
    "Item",
    "Weight",
    "Touch",
    "Purity",
    "Remarks",
    "Receipt Wt",
    "Total Scrap Wt",
    "Wastage",
  ];

  const tableRows = [];

  filtered.forEach((entry, idx) => {
    const items = entry.lotBuffingMapper || [];
    const balance = entry.buffingTotalBalance?.[0] || {};

    if (items.length > 0) {
      items.forEach((fi, i) => {
        tableRows.push([
          i === 0 ? idx + 1 : "",
          i === 0
            ? new Date(entry.createdAt).toLocaleDateString()
            : "",
          i === 0
            ? new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
          i === 0 ? entry.buffing_person_name : "",
          i === 0 ? fi.lot_number || "-" : "",
          fi.filing_item_name || "-",
          fi.weight || "-",
          fi.touch || "-",
          fi.item_purity || "-",
          fi.remarks || "-",
          i === 0 ? (balance.receipt_weight?.toFixed(3) ?? "-") : "",
          i === 0 ? (balance.total_scrap_weight?.toFixed(3) ?? "-") : "",
          i === 0 ? (balance.wastage ? "Yes" : "No") : "",
        ]);
      });
    } else {
      tableRows.push([
        idx + 1,
        new Date(entry.createdAt).toLocaleDateString(),
        new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        entry.buffing_person_name || "-",
        "-",
        "No Filing Items",
        "-", "-", "-", "-",
        balance.receipt_weight?.toFixed(3) ?? "-",
        balance.total_scrap_weight?.toFixed(3) ?? "-",
        balance.wastage ? "Yes" : "No",
      ]);
    }
  });

  // --- AutoTable for table ---
  autoTable(doc, {
    startY: summaryY + 10,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
    margin: { left: 5, right: 5 },
    tableWidth: "auto",
  });

  doc.save("Buffing_Report.pdf");
};


  return (
    <>
      <Navbar />
      <h5 className={styles.heading}>Buffing Report Details</h5>

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
            <TextField
          select
          label="Person"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          size="small"
        >
          <option value="">All</option>
          {persons.map((p, idx) => (
            <option key={idx} value={p}>{p}</option>
          ))}
        </TextField>
             <Button variant="outlined" onClick={handleFilter}>Filter</Button>
        <Button variant="outlined" onClick={reset}>Reset</Button>
        <Button
  style={{ marginLeft: "39rem" }}
  variant="contained"
  color="primary"
  onClick={handleDownloadPDF}
>
  Download as PDF
</Button>

        </div>
      
      <div className={styles.summarySection}>
        <h4>Summary</h4>

        <div className={styles.summaryGrid}>

        <div className={styles.summaryItem}>
            <span>Total Receipt Weight :</span>
            <span>{totals.receipt.toFixed(3)}</span>
        </div>
    <div className={styles.summaryItem}>
            <span>Total Scrap Weight :</span>
            <span> {totals.scrap.toFixed(3)}</span>
    </div>

    {selectedPerson && (
            <div className={styles.summaryItem}>
              <span>{selectedPerson}'s Balance:</span>
              <span>{selectedBalance.toFixed(3)}</span>
            </div>
          )}

        </div>
      </div>


      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2}>S.No</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>Time</th>
            <th rowSpan={2}>Person</th>
            <th rowSpan={2}>Lot Number</th>
            <th colSpan={5}>Filing / Setting Items</th>
            <th rowSpan={2}>Receipt Wt</th>
            <th rowSpan={2}>Total Scrap Wt</th>
            <th rowSpan={2}>Wastage</th>
          </tr>
          <tr>
            <th>Item</th>
            <th>Weight</th>
            <th>Touch</th>
            <th>Purity</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
  {filtered.length > 0 ? filtered.map((entry, idx) => {
    const items = entry.lotBuffingMapper || [];
    const balance = entry.buffingTotalBalance?.[0] || {};

    // Sum of weight for this entry
    const totalItemWeight = items.reduce((acc, fi) => acc + (fi.weight || 0), 0);

    return (
      <>
        {items.length > 0 ? items.map((fi, i) => (
          <tr key={`${entry.id}-${fi.filing_item_id}-${i}`}>
            {i === 0 && (
              <>
                <td rowSpan={items.length}>{idx + 1}</td>
                <td rowSpan={items.length}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
                <td rowSpan={items.length}>
                  {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td rowSpan={items.length}>{entry.buffing_person_name}</td>
                <td rowSpan={items.length}>{fi.lot_number}</td>
              </>
            )}

            <td>{fi.filing_item_name}</td>
            <td>{fi.weight}</td>
            <td>{fi.touch}</td>
            <td>{fi.item_purity}</td>
            <td>{fi.remarks}</td>

            {i === 0 && (
              <>
                <td rowSpan={items.length}>{balance.receipt_weight?.toFixed(3) ?? "-"}</td>
                <td rowSpan={items.length}>{balance.total_scrap_weight?.toFixed(3) ?? "-"}</td>
                <td rowSpan={items.length}>{balance.wastage ? "Yes" : "No"}</td>
              </>
            )}
          </tr>
        )) : (
          <tr key={entry.id}>
            <td>{idx + 1}</td>
            <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
            <td>{new Date(entry.createdAt).toLocaleTimeString()}</td>
            <td>{entry.buffing_person_name}</td>
            <td>-</td>
            <td colSpan={5} style={{ textAlign: "center" }}>No Filing Items</td>
            <td>{balance.receipt_weight?.toFixed(3) ?? "-"}</td>
            <td>{balance.total_scrap_weight?.toFixed(3) ?? "-"}</td>
            <td>{balance.wastage ? "Yes" : "No"}</td>
          </tr>
        )}

        {/* Add footer row for entries with more than 1 item */}
        {items.length > 1 && (
          <tr className={styles.entryFooter}>
            <td colSpan={6} style={{ textAlign: "right", fontWeight: "bold",  }}>Total Weight:</td>
            <td style={{ fontWeight: "bold" }}>{totalItemWeight}</td>
            <td colSpan={6}></td>
          </tr>
        )}
      </>
    );
  }) : (
    <tr>
      <td colSpan="13" align="center">No records found</td>
    </tr>
  )}
</tbody>
      </table>

    </>
  );
};

export default BuffingReports;
