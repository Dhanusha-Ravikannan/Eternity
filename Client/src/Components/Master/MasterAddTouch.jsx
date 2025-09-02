import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MasterAddTouch.module.css';
import Master from './MasterNavbar';
import { BACKEND_SERVER_URL } from '../../../Config/config';
import { Edit } from "@mui/icons-material";

const MasterAddTouch = () => {
  const [touchValue, setTouchValue] = useState("");
  const [touchItems, setTouchItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchTouchItems();
  }, []);

  const fetchTouchItems = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
      setTouchItems(response.data);
    } catch (error) {
      console.error("Error fetching touch items:", error);
    }
  };

  const handleAddTouch = async () => {
    if (!touchValue.trim()) {
      alert("Please enter a touch value");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/addtouch`, {
        touch: parseFloat(touchValue),
      });
      setTouchItems(prev => [...prev, response.data]);
      setTouchValue("");
    } catch (error) {
      console.error("Error adding touch:", error);
      alert("Failed to add touch");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditValue(item.touch);
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) {
      alert("Please enter a valid touch value");
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_SERVER_URL}/api/addtouch/${id}`, {
        touch: parseFloat(editValue),
      });
      setTouchItems(prev =>
        prev.map(item => (item.id === id ? response.data : item))
      );
      setEditId(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating touch:", error);
      alert("Failed to update touch");
    }
  };

  return (
    <>
      <Master />
      <div className={styles.mastercontainer}>
        <div className={styles.additemform}>
          <h4 style={{ textAlign: "center" }}>Add Touch</h4>
          <label>Touch Value:</label>
          <input
            type="text"
            value={touchValue}
            onChange={(e) => setTouchValue(e.target.value)}
            placeholder="Enter Touch value"
          />
          <button onClick={handleAddTouch}>Add Touch</button>
        </div>

        <div className={styles.itemlist}>
          <h4 style={{ textAlign: "center" }}>Added Touch Items</h4>
          <table>
            <thead>
              <tr>
                <th>SI.No</th>
                <th>Touch Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {touchItems.length > 0 ? (
                touchItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editId === item.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        item.touch
                      )}
                    </td>
                    <td style={{ width: "6rem" }}>
                      {editId === item.id ? (
                        <>
                          <button onClick={() => handleUpdate(item.id)}>Save</button>
                          <button onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (  
                      
                        <Edit
                          onClick={() => handleEdit(item)}
                          className={styles.actionIcon}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No touch values added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MasterAddTouch;
