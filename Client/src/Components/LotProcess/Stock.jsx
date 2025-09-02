import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import Navbar from "../Navbar/Navbar";
import { Button, TextField} from '@mui/material';

const Stock = () => {
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/stock`);
        const allItems = response.data;
        console.log("Available stock Items:", allItems);
        setStockItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error("Error fetching stock items:", error);
      }
    };

    fetchStockItems();
  }, []);


  const applyFilters = () => {
    let filtered = [...stockItems];
  
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); 
  
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
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
  
        return (
          castingName.includes(nameLower) ||
          filingName.includes(nameLower) ||
          settingName.includes(nameLower)
        );
      });
    }
  
    setFilteredItems(filtered);
  };
  
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCustomerName("");
    setFilteredItems(stockItems);
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "2rem" }}>
        <h4 style={{ color: "#5f4917", textAlign: "center" , color:'black' }}>
          Scrap Items (Stock)
        </h4>
        <br />

        <div  style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop:'0.5rem' }}>
        <TextField
    label="From Datee"
    type="date"
    size="small"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    sx={{ml:'2rem'}}
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

  <Button variant="outlined" onClick={applyFilters}> Filter </Button>
  <Button variant="outlined" onClick={resetFilters}>Reset</Button> 
  </div>

        {/* Table */}
        {filteredItems.length > 0 ? (
          <table 
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{ width: "100%", borderCollapse: "collapse" ,marginTop:'1rem'}}
          >
            <thead style={{ backgroundColor: "#38383e" }}>
              <tr>
                <th style={{ backgroundColor: "#38383e" }}>S.No</th>
                <th style={{ backgroundColor: "#38383e" }}>Date</th>
                <th style={{ backgroundColor: "#38383e" }}>Time</th>
                <th style={{ backgroundColor: "#38383e" }}>Customer Name</th>
                <th style={{ backgroundColor: "#38383e" }}>Item</th>
                <th style={{ backgroundColor: "#38383e" }}>Weight</th>
                <th style={{ backgroundColor: "#38383e" }}>Touch</th>
                <th style={{ backgroundColor: "#38383e" }}>Purity</th>
                <th style={{ backgroundColor: "#38383e" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const createdDate = new Date(item.createdAt);
                const dateString = createdDate.toLocaleDateString();
                const timeString = createdDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const customerName =
                  item.castingItem?.castingEntry?.casting_customer?.name ||
                  item.filingItem?.filing_entry?.filing_person?.name ||
                  item.settingItem?.settingEntryId?.setting_person?.name ||
                  item.buffingItem?.buffingEntryId?.buffing_person?.name ||
                  "-";

                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{dateString}</td>
                    <td>{timeString}</td>
                    <td>{customerName}</td>
                    <td>{item.item?.name || "-"}</td>
                    <td>{item.weight ?? "-"}</td>
                    <td>{item.touch?.touch ?? item.touch_id ?? "-"}</td>
                    <td>{item.item_purity ?? "-"}</td>
                    <td>{item.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
