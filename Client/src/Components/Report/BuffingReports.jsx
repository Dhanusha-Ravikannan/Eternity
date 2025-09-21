import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Button, TextField, Stack } from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./BuffingReports.module.css";

const BuffingReports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");

  // useEffect(() => {
  //   const fetchBuffing = async () => {
  //     try {
  //       const res = await axios.get( `${BACKEND_SERVER_URL}/api/buffingentry/get-report-entries` );
  //       const data = res.data || [];

  //       setEntries(data);
  //       setFiltered(data);

  //       const unique = [...new Set(data.map((e) => e.buffing_person_name).filter(Boolean))];
  //       setPersons(unique);
  //     } catch (err) {
  //       console.error("Error fetching buffing entries:", err);
  //     }
  //   };
  //   fetchBuffing();
  // }, []);


  useEffect(() => {
    const fetchBuffing = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_SERVER_URL}/api/buffingentry/get-report-entries`
        );
        const data = res.data || [];
  
        // 🔍 Filter out entries where buffingTotalBalance is not empty
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
  
    fetchBuffing();
  }, []);
  

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
    acc.balance += bal.balance || 0;
    return acc;
  }, { receipt: 0, scrap: 0, balance: 0 });

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
        </div>
      
      <div className={styles.summarySection}>
        <h4>Summary</h4>

        <div className={styles.summaryGrid}>

        <div className={styles.summaryItem}>
            <span>Total Receipt Weight :</span>
            <span>{totals.receipt.toFixed(2)}</span>
        </div>
    <div className={styles.summaryItem}>
            <span>Total Scrap Weight :</span>
            <span> {totals.scrap.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Total Balance :</span>
            <span>{totals.balance.toFixed(2)}</span>
    </div>
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
            <th rowSpan={2}>Balance</th>
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

            return items.length > 0 ? items.map((fi, i) => (
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
                  
                    <td rowSpan={items.length}>{balance.receipt_weight?.toFixed(2) ?? "-"}</td>
                    <td rowSpan={items.length}>{balance.total_scrap_weight?.toFixed(2) ?? "-"}</td>
                    <td rowSpan={items.length}>{balance.balance?.toFixed(2) ?? "-"}</td>
                    <td rowSpan={items.length}>
      {balance.wastage ? "Yes" : "No"}
    </td>
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
                <td>{balance.receipt_weight?.toFixed(2) ?? "-"}</td>
                <td>{balance.total_scrap_weight?.toFixed(2) ?? "-"}</td>
                <td>{balance.balance?.toFixed(2) ?? "-"}</td>
              </tr>
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
