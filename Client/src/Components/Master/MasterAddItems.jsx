import React, { useState, useEffect } from "react";
import styles from './MasterAddItems.module.css';
import Master from "./MasterNavbar";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { Edit } from "@mui/icons-material";

const MasterAdditems = () => {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleAddItem = async () => {
    if (!itemName) {
      alert("Please enter an item name.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/additem`, {
        name: itemName,
      });

      setItems((prevItems) => [...prevItems, response.data]);
      setItemName("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditClick = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setEditItemName("");
  };

  const handleSaveEdit = async (id) => {
    if (!editItemName) {
      alert("Please enter item name.");
      return;
    }

    try {
      const response = await axios.put( `${BACKEND_SERVER_URL}/api/additem/${id}`,
      { name: editItemName } );
      
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, name: response.data.name } : item
        )
      );

      setEditItemId(null);
      setEditItemName("");
    } catch (error) {
      console.error("Error updating item:", error);
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
          {items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>SI.No</th>
                  <th>Item Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
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
                          <button onClick={() => handleSaveEdit(item.id)}>
                            Save
                          </button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <Edit onClick={() => handleEditClick(item)} />                       
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items added yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default MasterAdditems;
