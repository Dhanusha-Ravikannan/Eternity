import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MasterAddTouch.module.css';
import Master from './MasterNavbar';
import { BACKEND_SERVER_URL } from '../../../Config/config';
import { Delete, Edit } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      console.log("touch", response)
      setTouchItems(response.data);
    } catch (error) {
      console.error("Error fetching touch items:", error);
    }
  };


  const handleAddTouch = async () => {
    if (!touchValue.trim()) {
      toast.error("Please enter a touch value", { position: "top-right" });
      return;
    }
  
    const parsedValue = parseFloat(touchValue);
  
    if (isNaN(parsedValue) || parsedValue <= 0) {
      toast.error("Touch value must be a valid number greater than 0", { position: "top-right" });
      return;
    }
  
    // 🔹 Prevent duplicate touch values
    const isDuplicate = touchItems.some(
      (item) => parseFloat(item.touch) === parsedValue
    );
    if (isDuplicate) {
      toast.error("Touch value already exists!", { position: "top-right" });
      return;
    }
  
    try {
      const response = await axios.post(`${BACKEND_SERVER_URL}/api/addtouch`, {
        touch: parsedValue,
      });
      setTouchItems((prev) => [...prev, response.data]);
      setTouchValue("");
      toast.success("Touch added successfully!", { position: "top-right" });
    } catch (error) {
      console.error("Error adding touch:", error);
      toast.error("Failed to add touch", { position: "top-right" });
    }
  };
  
  const handleUpdate = async (id) => {
    if (!editValue.toString().trim()) {
      toast.error("Please enter a valid touch value", { position: "top-right" });
      return;
    }
  
    const parsedValue = parseFloat(editValue);
  
    if (isNaN(parsedValue) || parsedValue <= 0) {
      toast.error("Touch value must be a valid number greater than 0", { position: "top-right" });
      return;
    }
  
    // 🔹 Prevent duplicate touch values (excluding current one)
    const isDuplicate = touchItems.some(
      (item) => parseFloat(item.touch) === parsedValue && item.id !== id
    );
    if (isDuplicate) {
      toast.error("Touch value already exists!", { position: "top-right" });
      return;
    }
  
    try {
      const response = await axios.put(`${BACKEND_SERVER_URL}/api/addtouch/${id}`, {
        touch: parsedValue,
      });
      setTouchItems((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
      setEditId(null);
      setEditValue("");
      toast.success("Touch updated successfully!", { position: "top-right" });
    } catch (error) {
      console.error("Error updating touch:", error);
      toast.error("Failed to update touch", { position: "top-right" });
    }
  };
  

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditValue(item.touch);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this touch?")) return;

    try {
      await axios.delete(`${BACKEND_SERVER_URL}/api/addtouch/${id}`);
      setTouchItems(prev => prev.filter(item => item.id !== id));
      toast.success("Touch deleted successfully!", { position: "top-right" });
    } catch (error) {
      console.error("Error deleting touch:", error);
      toast.error("Failed to delete touch", { position: "top-right" });
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
                  <tr key={item.id} className={index % 2 === 0 ? styles.trEven : ""}>
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
                      <>
                        <Edit
                          onClick={() => handleEdit(item)}
                          className={styles.actionIcon}
                          style={{ cursor: "pointer" }}
                        />
                        <Delete 
                        color='error'
                        onClick={() => handleDelete(item.id)}
                        style={{ cursor: "pointer", marginLeft:'1rem' }} 
                         />
                        
                        </>
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
      <ToastContainer autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default MasterAddTouch;
