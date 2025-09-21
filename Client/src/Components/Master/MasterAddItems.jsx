import React, { useState, useEffect } from "react";
import styles from './MasterAddItems.module.css';
import Master from "./MasterNavbar";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { Edit, Delete } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const MasterAdditems = () => {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
        console.log("items", response)
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleEditClick = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setEditItemName("");
  };


  const handleAddItem = async () => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name.", { position: "top-right" });
      return;
    }
  
    // 🔹 Prevent duplicate item name (case-insensitive)
    const isDuplicate = items.some(
      (item) => item.name.toLowerCase() === itemName.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Item name already exists!", { position: "top-right" });
      return;
    }
  
    try {
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/additem`, {
        name: itemName.trim(),
      });
  
      setItems((prevItems) => [...prevItems, response.data]);
      setItemName("");
      toast.success("Item added successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Error adding item.", { position: "top-right" });
      console.error("Error adding item:", error);
    }
  };
  

  const handleSaveEdit = async (id) => {
    if (!editItemName.trim()) {
      toast.error("Please enter item name.", { position: "top-right" });
      return;
    }
  
    // 🔹 Prevent duplicate name except for current item
    const isDuplicate = items.some(
      (item) =>
        item.name.toLowerCase() === editItemName.trim().toLowerCase() &&
        item.id !== id
    );
    if (isDuplicate) {
      toast.error("Item name already exists!", { position: "top-right" });
      return;
    }
  
    try {
      const response = await axios.put(
        `${BACKEND_SERVER_URL}/api/additem/${id}`,
        { name: editItemName.trim() }
      );
  
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, name: response.data.name } : item
        )
      );
  
      setEditItemId(null);
      setEditItemName("");
      toast.success("Item updated successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Error updating item.", { position: "top-right" });
      console.error("Error updating item:", error);
    }
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/additem/${id}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item deleted successfully!", { position: "top-right" });
    } catch (error) {
      if (error.response?.data?.code === "P2003") {
        toast.error("Cannot delete: Item is in use.", { position: "top-right" });
      } else {
        toast.error("Error deleting item.", { position: "top-right" });
      }
      console.error("Error deleting item:", error);
    }
  };
  
  return (
    <>
      <Master />
      <div className={styles.mastercontainer}>
        <div className={styles.additemform}>
          <h4 style={{ textAlign: "center" }}>Add Item</h4>
          <label>Item Name:</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
          />
          <button onClick={handleAddItem}>Add Item</button>
        </div>

<div className={styles.itemlist}>
  <h4 style={{ textAlign: "center" }}>Added Items</h4>
  <table>
    <thead>
      <tr>
        <th>SI.No</th>
        <th>Item Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.length > 0 ? (
        items.map((item, index) => (
          <tr key={item.id} className={index % 2 === 0 ? styles.trEven : ""}>
            <td>{index + 1}</td>
            <td>
              {editItemId === item.id ? (
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                />
              ) : (
                item.name
              )}
            </td>
            <td style={{ width: "6rem" }}>
              {editItemId === item.id ? (
                <>
                  <button onClick={() => handleSaveEdit(item.id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <Edit onClick={() => handleEditClick(item)} />
                  <Delete
                    color="error"
                    onClick={() => handleDelete(item.id)}
                    style={{ cursor: "pointer", marginLeft: "1rem" }}
                  />
                </>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3} style={{ textAlign: "center" }}>
            No items added yet.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </div>
      <ToastContainer />
    </>
  );
};

export default MasterAdditems;
