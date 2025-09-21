import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Button, TextField , Stack } from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./SettingReports.module.css";

const SettingReports = () => {
  const [fromDatee, setFromDatee] = useState("");
  const [toDate, setToDate] = useState("");
  const [assignedItems, setAssignedItems] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [persons, setPersons] = useState([]);
  
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get(`${BACKEND_SERVER_URL}/api/settingentry/get-report-entries`);
        const nonEmptyEntries = res.data.filter(
          (entry) =>
            Array.isArray(entry.settingTotalBalance) &&
            entry.settingTotalBalance.length > 0
        );
  
        setAssignedItems(nonEmptyEntries);
        setFilteredEntries(nonEmptyEntries);
  
        const uniquePersons = [
          ...new Set(nonEmptyEntries.map((e) => e.setting_person_name).filter(Boolean)),
        ];
        setPersons(uniquePersons);
      } catch (err) {
        console.error("Error fetching setting entries:", err);
      }
    };
  
    fetchEntries();
  }, []);
  

  const applyDateFilter = () => {
    const from = fromDatee ? new Date(fromDatee) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);
  
    const filtered = assignedItems.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      const dateMatch =
        (!from || createdAt >= from) && (!to || createdAt <= to);
      const personMatch =
        !selectedPerson || entry.setting_person_name === selectedPerson;
      return dateMatch && personMatch;
    });
  
    setFilteredEntries(filtered);
  };


  const calculateTotals = () => {
    const totals = {
      stoneWeight: 0,
      stoneCount: 0,
      receiptWeight: 0,
      productWeight: 0,
      scrapWeight: 0,
      currentBalance: 0,
      balance: 0,
    };
  
    filteredEntries.forEach((entry) => {
      const balance = entry.settingTotalBalance?.[0];
      if (balance) {
        totals.stoneWeight += balance.stone_weight || 0;
        totals.stoneCount += balance.stone_count || 0;
        totals.receiptWeight += balance.receipt_weight || 0;
        totals.productWeight += balance.total_product_weight || 0;
        totals.scrapWeight += balance.total_scrap_weight || 0;
        totals.currentBalance += balance.current_balance_weight || 0;
        totals.balance += balance.balance || 0;
      }
    });
  
    return totals;
  };
  
  const totals = calculateTotals();
  
  const resetFilter = () => {
    setFromDatee("");
    setToDate("");
    setFilteredEntries(assignedItems);
    setSelectedPerson("");
  };


  return (
    <>
      <Navbar />
      <h5 className={styles.heading}>Setting Report Details</h5>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={2}
        ml={6}
        mt={3}
      >
        <TextField
          type="date"
          label="From Date"
          value={fromDatee}
          onChange={(e) => setFromDatee(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="To Date"
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
          style={{ width: 180 }}
        >
          <option value="">All</option>
          {persons.map((person, idx) => (
            <option key={idx} value={person}>
              {person}
            </option>
          ))}
        </TextField>
        <Button variant="outlined" onClick={applyDateFilter}>
          Filter
        </Button>
        <Button variant="outlined" onClick={resetFilter}>
          Reset
        </Button>
      </Stack>

      <div className={styles.summarySection}>
  <h4>Summary</h4>
  <div className={styles.summaryGrid}>
    <div className={styles.summaryItem}>
            <span>Stone Weight :</span>
            <span>{totals.stoneWeight.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Stone Count :</span>
            <span>{totals.stoneCount.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span> Receipt Weight  :</span>
            <span>{totals.receiptWeight.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span> Product Weight  :</span>
            <span>{totals.productWeight.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span> Scrap Weight:  :</span>
            <span>{totals.scrapWeight.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Current Balance Weight :</span>
            <span>{totals.currentBalance.toFixed(2)}</span>
    </div>
    <div className={styles.summaryItem}>
            <span>Balance: </span>
            <span>{totals.balance.toFixed(2)}</span>
    </div>
  </div>
</div>

      {/* Main Table */}

 
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2}>S.No</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>Time</th>
            <th rowSpan={2}>Person</th>
            <th rowSpan={2}>Lot Number</th>            
            <th colSpan={5}>Filing / Setting Items</th>
            <th rowSpan={2}>Stone Wt</th>
            <th rowSpan={2}>Stone Count</th>
            <th rowSpan={2}>Receipt Wt</th>
            <th rowSpan={2}>Wastage</th>
            <th rowSpan={2}>Scrap Item</th>
            <th rowSpan={2}>Scrap Item Qty</th>
            <th rowSpan={2}>Total Product Wt</th>
            <th rowSpan={2}>Current Balance Wt</th>
            <th rowSpan={2}>Total Scrap Wt</th>
            <th rowSpan={2}>Balance</th>
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
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => {
              const filingItems = entry.lotSettingMapper || [];
              const settingBalance = entry.settingTotalBalance?.[0] || {};

              return filingItems.length > 0 ? (
                filingItems.map((fi, i) => (
                  <tr key={`${entry.id}-${fi.filing_item_id}-${i}`}>
                    {i === 0 && (
                      <>
                        <td rowSpan={filingItems.length}>{index + 1}</td>
                        <td rowSpan={filingItems.length}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {new Date(entry.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {entry.setting_person_name}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {fi.lot_number}
                        </td>
                      </>
                    )}

                    <td>{fi.filing_item_name}</td>
                    <td>{fi.weight}</td>
                    <td>{fi.touch}</td>
                    <td>{fi.item_purity}</td>
                    <td>{fi.remarks}</td>

                    {i === 0 && (
                      <>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.stone_weight || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.stone_count || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.receipt_weight || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.wastage ? "Yes" : "No"}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {(entry.scrapItems || [])
                            .map((item) => item.itemName)
                            .join(", ") || "-"}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {(entry.scrapItems || []).length || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.total_product_weight?.toFixed(2) || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.current_balance_weight?.toFixed(2) || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.total_scrap_weight?.toFixed(2) || 0}
                        </td>
                        <td rowSpan={filingItems.length}>
                          {settingBalance.balance?.toFixed(2) || 0}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr key={`empty-${entry.id}`}>
                  <td>{index + 1}</td>
                  <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(entry.createdAt).toLocaleTimeString()}</td>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No Filing Items
                  </td>
                  <td>{settingBalance.stone_weight || 0}</td>
                  <td>{settingBalance.stone_count || 0}</td>
                  <td>{settingBalance.receipt_weight || 0}</td>
                  <td>{settingBalance.wastage ? "Yes" : "No"}</td>
                  <td colSpan={2}>-</td>
                  <td>{settingBalance.total_product_weight?.toFixed(2) || 0}</td>
                  <td>{settingBalance.current_balance_weight?.toFixed(2) || 0}</td>
                  <td>{settingBalance.total_scrap_weight?.toFixed(2) || 0}</td>
                  <td>{settingBalance.balance?.toFixed(2) || 0}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="18" style={{ textAlign: "center" }}>
                No assigned items yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </>
  );
};

export default SettingReports;

