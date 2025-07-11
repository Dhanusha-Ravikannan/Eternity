import React, { useState, useEffect } from "react";
import "./Casting.css";
import Navbar from "../Navbar/Navbar";
import { Button, TextField } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import axios from "axios";
import CastingItemForm from "./CastingItemForm";
import Stock from "./Stock";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';


export default function Casting() {
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    givenGold: "",
    givenTouch: "",
    copperTouch: "",
    finalTouch: "",
  });

  const [savedCastings, setSavedCastings] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [castingNames, setCastingNames] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredCastings, setFilteredCastings] = useState([]);
  const [items, setItems] = useState([]);
  const [scrapItems, setScrapItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [castingEntryId, setCastingEntryId] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/additem");
        setAvailableItems(res.data);
      } catch (err) {
        console.error("Failed to fetch available items:", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [castingNamesRes, castingEntriesRes] = await Promise.all([
          axios.get(`${BACKEND_SERVER_URL}/api/casting`),
          axios.get(`${BACKEND_SERVER_URL}/api/castingentry`)
        ]);
  
        //  Log casting names
        console.log("Casting Names Response:", castingNamesRes.data);
        setCastingNames(castingNamesRes.data.map(c => c.name));
  
        const castingEntries = castingEntriesRes.data;
        console.log("Casting Entries Response:", castingEntries);

        //  Fetch all castingitems
        const castingItemsRes = await axios.get(`${BACKEND_SERVER_URL}/api/castingitems`);
        const allCastingItems = castingItemsRes.data;
        console.log("All Casting Itemsss:", allCastingItems);
  
        //  Map and attach afterWeight
        const enrichedEntries = castingEntries.map(entry => {
          const entryItems = allCastingItems.filter(item => item.castingEntryId === entry.id);
          const afterWeightItem = entryItems.find(item => item.after_weight > 0);
  
          console.log(`Entry ID: ${entry.id}, After Weight Found:`, afterWeightItem?.after_weight);
  
          return {
            ...entry,
            afterWeight: afterWeightItem ? afterWeightItem.after_weight : 0,
          };
        });
  
        console.log("Final Enriched Entries:", enrichedEntries);
  
        setSavedCastings(enrichedEntries);
        setFilteredCastings(enrichedEntries);
      } catch (error) {
        console.error("Error fetching casting data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const filtered = savedCastings.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= from && entryDate <= to;
      });
      setFilteredCastings(filtered);
    } else if (fromDate || toDate) {
      toast.warning("Please select both From Date and To Date to filter.");
      setFilteredCastings([]);
    } else {
      setFilteredCastings(savedCastings);
    }
  }, [fromDate, toDate, savedCastings]);

  const purity = (parseFloat(form.givenGold || 0) * parseFloat(form.givenTouch || 0)) / 100;
  const pureValue = parseFloat(form.finalTouch || 0) / 100;
  const finalWeight = pureValue ? purity / pureValue : 0;
  const copper = parseFloat(form.givenGold || 0) - finalWeight;
  const afterWeight = items.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const totalItemWeight = finalWeight - afterWeight;
  const totalScrapWeight = scrapItems.reduce((sum, item) => sum + parseFloat(item.weight || 0),0 );
  const totalWastage = totalItemWeight - totalScrapWeight;

  const handleDelete = async (id) => {
    console.log('Delete casting id:', id)
    const confirm = window.confirm("Are you sure you want to delete this casting entry?");
    if (!confirm) return;

    try {
     const response = await axios.delete(`${BACKEND_SERVER_URL}/api/castingentry/${id}`);
     console.log("Delete response from backend:", response);
      toast.success("Casting entry deleted successfully");
      const updatedList = savedCastings.filter(entry => entry.id !== id);
      setSavedCastings(updatedList);
      setFilteredCastings(updatedList);
      console.log("Updated casting list:", updatedList); 
    } catch (err) {
      console.error("Error deleting casting entry:", err);
      toast.error("Failed to delete casting entry");
    }
  };
  
  const handleSave = async () => {
    try {
      const payload = {
        date: form.date,
        given_gold: form.givenGold,
        given_touch: form.givenTouch,
        purity: purity.toFixed(2),
        final_touch: form.finalTouch,
        pure_value: pureValue.toFixed(2),
        copper: copper.toFixed(2),
        final_weight: finalWeight.toFixed(2),
        casting_customer_id: castingNames.indexOf(form.name) + 1,
      };
  
      let newCastingId = null;
  
      if (editIndex !== null) {
        const idToUpdate = savedCastings[editIndex]?.id;
        const response = await axios.put(`${BACKEND_SERVER_URL}/api/castingentry/${idToUpdate}`, payload);
        console.log('Edit casting entry',response)
        toast.success("Casting entry updated!");
        newCastingId = idToUpdate;

        const updatedEntry = {
          ...savedCastings[editIndex],
          ...payload,
          id: idToUpdate,
          items: items,
          scrapItems: scrapItems,
          beforeWeight: finalWeight.toFixed(2),
          afterWeight: afterWeight.toFixed(2),
        };
        
        const updatedList = [...savedCastings];
        updatedList[editIndex] = updatedEntry;
        setSavedCastings(updatedList);
        setFilteredCastings(updatedList);
        console.log(updatedList)
      } else {
        const response = await axios.post(`${BACKEND_SERVER_URL}/api/castingentry`, payload);
        newCastingId = response.data?.data?.id;
        toast.success("Casting entry saved!");

        const newEntry = {
          ...payload,
          id: newCastingId,
          items: items, // add this
          scrapItems: scrapItems, // add this
          beforeWeight: finalWeight.toFixed(2),
          afterWeight: afterWeight.toFixed(2),
        };
        
        const updatedList = [...savedCastings, newEntry];
        setSavedCastings(updatedList);
        setFilteredCastings(updatedList);
      }
      console.log(setSavedCastings)
      console.log(setFilteredCastings)
  
      setCastingEntryId(newCastingId);
  
      await saveCastingItems(newCastingId);
  
      if (editIndex === null) {
        resetForm();
        setShowPopup(false);
      } else {
        toast.info("Updated! You can now edit items or close the form.");
      } 
    } catch (error) {
      // console.error("Error saving/updating casting entry:", error);
    }
  };
  
  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      name: "",
      givenGold: "",
      givenTouch: "",
      copperTouch: "",
      finalTouch: "",
    });
    setItems([]);
    setScrapItems([]);
    setEditIndex(null);
    setCastingEntryId(null); 
  };

  const handleEdit = async (index) => {
    const data = filteredCastings[index];
  
    setForm({
      date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      name: castingNames[data.casting_customer_id - 1] || "",
      givenGold: data.given_gold,
      givenTouch: data.given_touch,
      finalTouch: data.final_touch,
    });
  
    setEditIndex(index);
    setCastingEntryId(data.id);
    setShowPopup(true);
  
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/castingitems`, {
        params: { casting_entry_id: data.id },
      }); 
      const fetchedItems = response.data; 
      const itemList = fetchedItems.filter(item => item.type === "Items");
      const scrapList = fetchedItems.filter(item => item.type === "ScrapItems");

      setItems(itemList);
      setScrapItems(scrapList);
    } catch (error) {
      console.error("Failed to fetch items during edit:", error);
      toast.error("Failed to load casting items.");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="casting-container">
        <div className="date-fields">
        <TextField
            id="from-date"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            id="to-date"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ marginLeft: "1rem" }}
          />
          <Button
            onClick={() => {
              resetForm();
              setShowPopup(true);
            }}
            sx={{
              m: 2,
              marginLeft: 115,
              backgroundColor: "#5f4917",
              color: "white",
            }}
          >
            Add Casting Items
          </Button>
        </div>

        {showPopup && (
          <div className="casting-popup-overlay">
            <div className="casting-popup">
              <div className="casting-popup-header">
                Casting / Melting
                <button onClick={() => {
                  setShowPopup(false);
                  resetForm();
                }} className="close-btnn">X</button>
              </div>
              <hr />
              <br />
<div className="form-grid">
  {/* Row 1 */}
  <div className="form-row">
    <div className="form-field">
      <label>Date</label>
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
    </div>
    <div className="form-field">
      <label>Name</label>
      <select
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      >
        <option value="">Select Name</option>
        {castingNames.map((name, index) => (
          <option key={index} value={name}>{name}</option>
        ))}
      </select>
    </div>
    <div className="form-field">
      <label>Given Gold</label>
      <input
        type="number"
        value={form.givenGold}
        onChange={(e) => setForm({ ...form, givenGold: e.target.value })}
      />
    </div>
    <div className="form-field">
      <label>Given Touch</label>
      <input
        type="number"
        value={form.givenTouch}
        onChange={(e) => setForm({ ...form, givenTouch: e.target.value })}
      />
    </div>
  </div>

  {/* Row 2 */}
  <div className="form-row">
    <div className="form-field">
      <label>Purity</label>
      <input type="text" value={purity.toFixed(3)} readOnly />
    </div>
    <div className="form-field">
      <label>Final Touch</label>
      <input
        type="number"
        value={form.finalTouch}
        onChange={(e) => setForm({ ...form, finalTouch: e.target.value })}
      />
    </div>
    <div className="form-field">
      <label>Copper</label>
      <input type="text" value={copper.toFixed(3)} readOnly />
    </div>
    <div className="form-field">
      <label>Before Weight</label>
      <input type="text" value={finalWeight.toFixed(3)} readOnly />
    </div>
  </div>
    <button     
     className="save-btn" onClick={handleSave}>
      {editIndex !== null ? "Update" : "Save"}
    </button>
</div>
             <hr />
              <CastingItemForm
  castingEntryId={castingEntryId}
  items={items}
  setItems={setItems}
  scrapItems={scrapItems}
  setScrapItems={setScrapItems}
  afterWeight={afterWeight}
  totalScrapWeight={totalScrapWeight}
  totalWastage={totalWastage}
  totalItemWeight= {totalItemWeight}
  onStockUpdate={triggerRefresh} 
/>
 <div style={{marginTop:'20rem'}}> </div>
{/* <Stock refreshFlag ={refreshFlag}/> */}

            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: "center", color: "#d40b4e", fontSize: "1.3rem", fontWeight: "bold", fontFamily:'sans-serif'}}>
              Casting / Melting
            </h3>
            <div className="tableheaderstyle"> 
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "95%", margin: "1rem auto", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "black", fontFamily:'sans-serif' }}
           
              >
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Item Name</th>
                  <th>Items Qty</th>
                  <th>Scrap Name</th>
                  <th>Scrap Items Qty</th>
                  <th>Before Weight</th>
                  <th>After Weight</th>
                  
                  <th>Action</th>
                 
 

                </tr>
              </thead>
              <tbody>
  {filteredCastings.length > 0 ? (
    filteredCastings.map((entry, index) => {
      const addItems = (entry.items || []).filter(i => i.type === "Items");
      const scrapItems = (entry.items || []).filter(i => i.type === "ScrapItems");

      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{entry.date ? new Date(entry.date).toLocaleDateString() : "-"}</td>
          <td>{castingNames[entry.casting_customer_id - 1] || "-"}</td>

          {/* Add Item Names */}
          <td>
            {addItems.map(item => {
              const found = availableItems.find(i => i.id === item.item_id);
              return found?.name || "Unknown";
            }).join(", ") || "-"}
          </td>

          {/* Add Items Qty */}
          <td>{addItems.length}</td>

          {/* Scrap Item Names */}
          <td>
            {scrapItems.map(item => {
              const found = availableItems.find(i => i.id === item.item_id);
              return found?.name || "Unknown";
            }).join(", ") || "-"}
          </td>

          {/* Scrap Items Qty */}
          <td>{scrapItems.length}</td>

          <td>{entry.beforeWeight || entry.final_weight}</td>

          {/* After Weight of Add Items only */}
          <td>
            {addItems.reduce((sum, item) => sum + (item.after_weight || 0), 0).toFixed(3)}
          </td>

          <td>
            <button onClick={() => handleEdit(index)} style={{ color: 'blue', fontWeight: 'bold' }}>
              <EditIcon color="primary" />
            </button>
            <button onClick={() => handleDelete(entry.id)} style={{ marginLeft: 8, color: "red", fontWeight: 'bold' }}>
              <DeleteIcon color="error" />
            </button>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="10" style={{ textAlign: "center", color: "gray" }}>
        No items found for selected date range.
      </td>
    </tr>
  )}
</tbody>
      
            </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


