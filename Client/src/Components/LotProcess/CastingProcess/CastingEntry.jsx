import React, { useState, useEffect } from 'react';
import {Button, TextField, Stack } from '@mui/material';
import axios from 'axios';
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import CastingEntryViewModal from './CastingEntryViewModel';
import Navbar from '../../Navbar/Navbar';
import { FaEye } from "react-icons/fa";
import { RiDeleteBin2Fill } from "react-icons/ri";
import styles from './CastingEntry.module.css'

const CastingEntry = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [touchOptions, setTouchOptions] = useState([]);
  const [mode, setMode] = useState('add');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    nameId: '',
    givenGold: '',
    touch: '',
    touchId: '',
    finalTouch: '',
    purity: 0,
    pureValue: 0,
    beforeWeight: 0,
    copper: 0,
  });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [allEntries, setAllEntries] = useState([]); 
  const [openModal, setOpenModal] = useState(false); 
  const [updatedCastingItems, setUpdatedCastingItems] = useState({});


  const handleCastingItemsSaved = (entryId, summaryData) => {
    setUpdatedCastingItems(prev => ({
      ...prev,
      [entryId]: summaryData
    }));

    fetchAllData();
  };
  

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      name: '',
      nameId: '',
      givenGold: '',
      touch: '',
      touchId: '',
      finalTouch: '',
      purity: 0,
      pureValue: 0,
      beforeWeight: 0,
      copper: 0,
    });
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const fetchAllData = async () => {
    try {
      const [touchRes, nameRes, entryRes] = await Promise.all([
        axios.get(`${BACKEND_SERVER_URL}/api/addtouch`),
        axios.get(`${BACKEND_SERVER_URL}/api/casting`),
        axios.get(`${BACKEND_SERVER_URL}/api/castingentry`)
      ]);
      setTouchOptions(touchRes.data);
      setNameOptions(nameRes.data);
      setEntries(entryRes.data);
      setAllEntries(entryRes.data);
    } catch (err) {
      console.error('Error fetching dropdown data', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

 
  useEffect(() => {
    const givenGold = parseFloat(form.givenGold) || 0;
    const touch = parseFloat(form.touch) || 0;
    const finalTouch = parseFloat(form.finalTouch) || 0;
    const purity = (givenGold * touch) / 100;
    const pureValue = finalTouch / 100;
    const beforeWeight = pureValue ? purity / pureValue : 0;
    const copper = givenGold - beforeWeight;

    setForm((prev) => ({
      ...prev,
      purity: purity.toFixed(3),
      pureValue: pureValue.toFixed(3),
      beforeWeight: beforeWeight.toFixed(3),
      copper: copper.toFixed(3),
    }));
  }, [form.givenGold, form.touch, form.finalTouch]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    if (field === 'name') {
      const selected = nameOptions.find(n => n.name === value);
      setForm(prev => ({ ...prev, name: value, nameId: selected?.id || '' }));
    } else if (field === 'touch') {
      const selected = touchOptions.find(t => t.touch === value);
      setForm(prev => ({ ...prev, touch: value, touchId: selected?.id || '' }));
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        date: form.date,
        given_gold: parseFloat(form.givenGold),
        casting_customer_id: form.nameId,
        touch_id: form.touchId,
        final_touch: parseFloat(form.finalTouch),
        purity: parseFloat(form.purity),
        pure_value: parseFloat(form.pureValue),
        final_weight: parseFloat(form.beforeWeight),
        copper: parseFloat(form.copper)
      };

      const response = await axios.post(`${BACKEND_SERVER_URL}/api/castingentry`, payload);
      const savedEntry = response.data; 
      console.log("Saved Entry:", savedEntry);
      console.log("Casting Entry ID:", savedEntry.id);
  
      setForm(prev => ({
        ...prev,
        id: savedEntry.id 
      }));
  
      setEntries(prev => [...prev, savedEntry]);
      setAllEntries(prev => [...prev, savedEntry]);

      await fetchAllData();

      setMode("view");    
      setOpenModal(true);   
  
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Error saving entry");
    }
  };
  
  const handleOpen = () => {
    setMode('add');
    resetForm();
    setOpen(true);
   

  };

  const handleView = (entry) => {
    const nameObj = nameOptions.find(obj => obj.id === entry.casting_customer_id);
    const touchObj = touchOptions.find(t => t.id === entry.touch_id);

    setForm({
      id: entry.id,
      date: entry.date?.split('T')[0] || '',
      name: nameObj?.name || '',
      nameId: nameObj?.id || '',
      givenGold: entry.given_gold || '',
      touch: touchObj?.touch || '',
      touchId: touchObj?.id || '',
      finalTouch: entry.final_touch || '',
      purity: entry.purity || '',
      pureValue: entry.pure_value || '',
      beforeWeight: entry.final_weight || '',
      copper: entry.copper || ''
    });

    setMode('view');
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${BACKEND_SERVER_URL}/api/castingentry/${id}`);
        setEntries(prev => prev.filter(entry => entry.id !== id));
        setAllEntries(prev => prev.filter(entry => entry.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete entry.");
      }
    }
  };

  const handleDateFilter = () => {
    if (!fromDate || !toDate) return;

    const filtered = allEntries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0];
      return entryDate >= fromDate && entryDate <= toDate;
    });

    setEntries(filtered);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setEntries(allEntries);
  };

  return (
    <>
    <Navbar/>
   
    <h5 className={styles.heading}>Casting/Melting Process</h5>
      <Stack direction="row" spacing={2} alignItems="center" mb={2} ml={6} mt={1}>
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
        <Button variant="outlined" onClick={handleDateFilter}>Filter</Button>
        <Button variant="outlined" onClick={handleReset}>Reset</Button>
     
       
        <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft:"42rem"
            }}
            variant="contained"
            onClick={handleOpen}
          >
            Add Casting / Melting
          </Button>
      </Stack>

        <div className={styles.itemList}> 
<table className={styles.customerTable} >
  <thead>
    <tr>
      <th>S.No</th>
      <th>Date</th>
      <th>Time</th>
      <th>Name</th>
      <th>Before Wt</th>
      <th>Product Item(s)</th>
      <th>Product Qty</th>
      <th>Scrap Item(s)</th>
      <th>Scrap Qty</th>
      <th style={{width:'8rem'}}>Total Item Wt</th>
      <th>Balance Wt</th>
      <th>Scrap Wt</th>
      <th>Wastage</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {entries.map((entry, index) => (
      <tr key={entry.id}>
        <td>{index + 1}</td>
        <td>{entry.date ? new Date(entry.date).toLocaleDateString() : "-"}</td>
        <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : "-"}</td>
        <td>{entry.customer?.name || "-"}</td>
        <td>{entry.final_weight ?? "-"}</td>
        <td>{Array.isArray(entry.productItems) ? entry.productItems.join(", ") : "-"}</td>
        <td>{entry.productQty || "-"}</td>
        <td>{Array.isArray(entry.scrapItems) ? entry.scrapItems.join(", ") : "-"}</td>
        <td>{entry.scrapQty || "-"}</td>
        <td>{entry.totalItemWeight ? entry.totalItemWeight.toFixed(2) : '-'}</td>
        <td>{entry.currentBalanceWeight ? entry.currentBalanceWeight.toFixed(2) : '-'}</td>
        <td>{entry.totalScrapWeight ? entry.totalScrapWeight.toFixed(2) : '-'}</td>
        <td>{entry.totalWastage ? entry.totalWastage.toFixed(2) : '-'}</td>
        <td>
          <FaEye onClick={() => handleView(entry)} style={{ cursor: "pointer", marginRight: "0.5rem" }} />
          <RiDeleteBin2Fill onClick={() => handleDelete(entry.id)} style={{ cursor: "pointer" }} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>

      <CastingEntryViewModal
        open={open}
        handleClose={handleClose}
        form={form}
        mode={mode}
        nameOptions={nameOptions}
        touchOptions={touchOptions}
        handleChange={handleChange}
        handleSave={handleSave}
        castingEntryId={form.id}
        openModal={openModal}             
        setOpenModal={setOpenModal} 
        handleCastingItemsSaved={handleCastingItemsSaved}
       
      />
    </>
  );
};

export default CastingEntry;
