import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { TextField, IconButton, MenuItem, Button,Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./Billing.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import SavedBills from "./SavedBills";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [qcStock, setQcStock] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [goldRate, setGoldRate] = useState("");
  const [receivedRows, setReceivedRows] = useState([]);
  const [totalReceivedPurity, setTotalReceivedPurity] = useState(0);
  const [prevHallmark, setPrevHallmark] = useState(0);
  const [hallmarkBalance, setHallmarkBalance] = useState(0);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [hallmarkForThisBill, setHallmarkForThisBill] = useState(0);
  const [touchItems, setTouchItems] = useState([]);
  const [bills, setBills] = useState([]);
const [viewBill, setViewBill] = useState(null);
const [openBillsPopup, setOpenBillsPopup] = useState(false);
const [openViewBillPopup, setOpenViewBillPopup] = useState(false);
const printRef = useRef();


const fetchBills = async () => {
  try {
    const res = await fetch(`${BACKEND_SERVER_URL}/api/bills`);
    const data = await res.json();
    setBills(data);
  } catch (error) {
    console.error("Error fetching bills:", error);
  }
};

useEffect(() => {
  fetchBills();
}, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error.message);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/additem`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchQcStock = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/qcstock/filtered-qc-stock`
      );
      setQcStock(response.data);
    } catch (error) {
      console.error("Error fetching QC stock:", error);
    }
  };

  const fetchCustomerBalance = async () => {
    try {
      if (selectedCustomerId) {
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/customers/${selectedCustomerId}`
        );
        console.log("Customer Transaction Response:", response.data);
  
        if (response.data.length > 0) {
          const customerInfo = response.data[0]?.customer || {};
        const balanceValue =
          customerInfo.openingBalance !== null && customerInfo.openingBalance !== undefined
            ? parseFloat(customerInfo.openingBalance) || 0
            : parseFloat(customerInfo.balance) || 0;

        setCustomerBalance(balanceValue);
      } else {
        setCustomerBalance(0);
      }
      }
    } catch (error) {
      console.error("Error fetching customer balance:", error);
      setCustomerBalance(0);
    }
  };
  
 
  const fetchHallmarkBalance = async () => {
    try {
      if (selectedCustomerId) {
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/customers/${selectedCustomerId}`
        );
        setPrevHallmark(response.data[0]?.balance || 0);
        setHallmarkBalance(response.data[0]?.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching hallmark balance:", error);
      setPrevHallmark(0);
      setHallmarkBalance(0);
    }
  };

  const fetchTouchItems = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/addtouch`);
      setTouchItems(response.data);
    } catch (error) {
      console.error("Error fetching touch items:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchItems();
    fetchQcStock();
    fetchTouchItems();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerBalance();
      fetchHallmarkBalance();
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (selectedProductId) {
      const filteredItems = qcStock.filter(
        (item) => item.item_id === selectedProductId
      );
      setAvailableItems(filteredItems);
    } else {
      setAvailableItems([]);
    }
  }, [selectedProductId, qcStock]);

  useEffect(() => {
    const total = receivedRows.reduce((sum, row) => {
      return sum + (parseFloat(row.purityWeight) || 0);
    }, 0);
    setTotalReceivedPurity(total);
  }, [receivedRows]);

  const addReceivedRow = () => {
    setReceivedRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: currentDate,
        goldRate: "",
        gold: "",
        touchId: null,
        touchValue: "",
        purityWeight: "",
        amount: "",
        type: "Gold",
      },
    ]);
  };

  useEffect(() => {
    if (!goldRate) return;
    const updated = billItems.map((item) => {
      const totalWeight = parseFloat(item.totalWeight || 0);
      const percent = parseFloat(item.percent || 0);
      const rate = parseFloat(goldRate);

      if (!isNaN(totalWeight) && !isNaN(percent)) {
        const pure = (totalWeight * percent) / 100;
        const amount = rate * pure;

        return {
          ...item,
          pure: parseFloat(pure.toFixed(3)),
          amount: parseFloat(amount.toFixed(2)),
        };
      }

      return item;
    });

    setBillItems(updated);
  }, [goldRate]);

  const getBillTotal = () => {
    let totalPure = 0;
    let totalAmount = 0;
    billItems.forEach((item) => {
      totalPure += item.pure || 0;
      totalAmount += item.amount || 0;
    });
    return {
      totalPure: totalPure.toFixed(3),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const deleteReceivedRow = (id) => {
    if (window.confirm("Delete row?")) {
      setReceivedRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const deleteBillItem = (index) => {
    const updatedBill = [...billItems];
    const removedItem = updatedBill.splice(index, 1)[0];

    setBillItems(updatedBill);

    setAvailableItems((prev) => [
      ...prev,
      { weight: removedItem.weight, touch: removedItem.touch },
    ]);
  };

  const now = new Date();
  const currentDate = now.toLocaleDateString("en-GB");
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const addToBill = (item, index) => {
    const stoneWeight = parseFloat(item.stoneWeight || item.stone_weight || 0);
    const totalWeight = parseFloat(item.weight || 0) - stoneWeight;
  
    setBillItems((prev) => [
      ...prev,
      {
        ...item,
        stoneWeight,     
        totalWeight,     
        percent: "",
        pure: 0,
        amount: 0,
      },
    ]);
  
    const updatedAvailable = [...availableItems];
    updatedAvailable.splice(index, 1);
    setAvailableItems(updatedAvailable);
  };
  

  const handleInputChange = (index, field, value) => {
    const newBill = [...billItems];
    newBill[index][field] = value;

    console.log("field", field, value);

    const totalWeight = parseFloat(newBill[index].totalWeight || 0);
    const percent = parseFloat(newBill[index].percent || 0);
    const rate = parseFloat(goldRate || 0);

    if (!isNaN(totalWeight) && !isNaN(percent)) {
      const pure = (totalWeight * percent) / 100;
      const amount = rate ? pure * rate : 0;

      newBill[index].pure = parseFloat(pure.toFixed(3));
      newBill[index].amount = parseFloat(amount.toFixed(2));
    }
    console.log(newBill);
    setBillItems(newBill);
  };

  const { totalPure, totalAmount } = getBillTotal();
  const grandTotal = totalAmount - customerBalance * goldRate;

  console.log(
    "customerBalance",
    totalPure,
    totalReceivedPurity,
    customerBalance
  );

  console.log("billin", billItems);

  const totalBillingPure = billItems.reduce( (sum, item) => sum + (item.pure || 0), 0 );
  // Total pure from the footer "Total" row
const totalFinalPure = parseFloat(totalPure || 0) + parseFloat(customerBalance || 0);
// Pure balance calculation (directly from Total)
const pureBalanceValue = totalFinalPure - parseFloat(totalReceivedPurity || 0);
// Keep both positive and negative separately for display
const pureBalance = pureBalanceValue >= 0 ? pureBalanceValue.toFixed(3) : "0.000";
const excessPure = pureBalanceValue < 0 ? Math.abs(pureBalanceValue).toFixed(3) : "0.000";

  const handleReceivedInput = (index, field, value) => {
    const updated = [...receivedRows];
    updated[index][field] = value;

    const row = updated[index];
    const gold = parseFloat(row.gold);
    const touch = parseFloat(row.touchValue);
    const goldRate = parseFloat(row.goldRate);
    const amount = parseFloat(row.amount);

    if (!isNaN(gold) && !isNaN(touch)) {
      row.purityWeight = (gold * touch) / 100;
    } else if (!isNaN(goldRate) && !isNaN(amount)) {
      row.purityWeight = amount / goldRate;
    } else {
      row.purityWeight = "";
    }
    const totalHallmark = updated.reduce(
      (sum, r) => sum + (parseFloat(r.hallmarkCharge) || 0),
      0
    );

    console.log("total", totalHallmark);
    setHallmarkBalance((parseFloat(hallmarkForThisBill) || 0) - totalHallmark);

    setReceivedRows(updated);
  };

  const validGoldRates = receivedRows
    .map((row) => parseFloat(row.goldRate))
    .filter((rate) => !isNaN(rate));
  const lastGoldRate = validGoldRates.length
    ? validGoldRates[validGoldRates.length - 1]
    : 0;


      let cashBalance = 0;

if (pureBalanceValue > 0) {
  // Customer owes gold → convert to cash
  cashBalance = pureBalanceValue * lastGoldRate;
} else if (pureBalanceValue < 0) {
  // Owner owes gold → convert to cash (negative)
  cashBalance = pureBalanceValue * lastGoldRate;
} else {
  cashBalance = 0;
}

cashBalance = parseFloat(cashBalance.toFixed(2));

  const handleSave = async () => {
    try {
      const billData = {
        customerId: selectedCustomerId,
        date: currentDate,
        time: time,
        goldRate: goldRate,
        totalPure: totalPure,
        totalAmount: totalAmount,
        customerBalance: customerBalance,
        grandTotal: grandTotal,
        cashBalance: parseFloat(cashBalance).toFixed(2),
        pureBalance: pureBalanceValue,
        prevHallmark: prevHallmark,
        hallmarkBalance: hallmarkBalance,
        billItems: billItems,
        receivedItems: receivedRows,
        excessPure: Math.abs(pureBalance),
      };

      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/bills`,
        billData
      );

      console.log("Bill saved successfully:", response.data);
      alert("Bill data saved successfully!");
      const responsee = await axios.get(`${BACKEND_SERVER_URL}/api/bills`);
      setBills(responsee.data);

      fetchQcStock();
      setSelectedCustomer("");
      setSelectedCustomerId(null);
      setSelectedProduct("");
      setSelectedProductId(null);
      setBillItems([]);
      setReceivedRows([]);
      setGoldRate("");
      setHallmarkForThisBill(0);
      setHallmarkBalance(0);
      // pureBalance = 0;
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Error saving bill data");
    }
  };

  console.log("touch", touchItems);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <h3>Estimate Only</h3>

          <p className={styles.billNo}>Bill No: 01</p>
          <div className={styles.datetime}>
            <p>Date: {currentDate}</p>
            <p>Time: {time}</p>
          </div>

          <div className={styles.label}>
            <TextField
              select
              label="Select Customer"
              size="small"
              value={selectedCustomer}
              onChange={(e) => {
                const selected = customers.find(
                  (c) => c.name === e.target.value
                );
                setSelectedCustomer(e.target.value);
                setSelectedCustomerId(selected?.id || null);
              }}
              style={{ marginRight: 10, width: "12rem" }}
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Item Name"
              size="small"
              value={selectedProduct}
              onChange={(e) => {
                const selected = items.find((i) => i.name === e.target.value);
                setSelectedProduct(e.target.value);
                setSelectedProductId(selected?.id || null);
              }}
              style={{ width: "12rem" }}
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Enter Gold Rate"
              size="small"
              type="number"
              value={goldRate}
              onChange={(e) => setGoldRate(e.target.value)}
            />
          </div>

          <p className={styles.customerCardd}>
            <span>Customer Name:</span> {selectedCustomer}
          </p>

          <div className={styles.billdetails}>Bill Details:</div>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Weight</th>
                  <th>Stone Weight</th>
                  <th>Total Weight</th>
                  <th style={{ width: "7rem" }}>%</th>
                  <th style={{ width: "7rem" }}>Pure</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, index) => (
                  <tr key={index}>
                    <td>{selectedProduct}</td>
                    <td>{item.weight}</td>
                    <td>{item.stoneWeight || item.stone_weight}</td>
                    <td>{item.totalWeight || item.total_weight}</td>               
<td>
<TextField
  type="number"
  size="small"
  value={item.percent || ""}
  onChange={(e) => handleInputChange(index, "percent", e.target.value)}
  style={{ width: "6rem" }}
  autoComplete="off"
  onWheel={(e) => e.target.blur()} 
/>
</td>

                    <td>{item.pure}</td>
                    <td>{item.amount}</td>
                    <td>
                      <IconButton
                        onClick={() => deleteBillItem(index)}
                        size="small"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            
<tfoot>
  {customerBalance >= 0 ? (
    <tr style={{ color: "green", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Balance</td>
      <td>{parseFloat(customerBalance || 0).toFixed(3)}</td>
      <td>{(parseFloat(customerBalance || 0) * parseFloat(goldRate || 0)).toFixed(2)}</td>
      <td></td>
    </tr>
  ) : (
    <tr style={{ color: "red", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Excess Balance</td>
      <td>{parseFloat(customerBalance || 0).toFixed(3)}</td>
      <td>{(parseFloat(customerBalance || 0) * parseFloat(goldRate || 0)).toFixed(2)}</td>
      <td></td>
    </tr>
  )}

  <tr>
    <td colSpan={5}>
      <b>Final Bill Total</b>
    </td>
    <td>{parseFloat(totalPure || 0).toFixed(3)}</td>
    <td>{parseFloat(totalAmount || 0).toFixed(2)}</td>
    <td></td>
  </tr>
<tr>
  <td colSpan={5} className={styles.trEven}>
    <b>
      Total{" "}
      {(() => {
        const total = (
          parseFloat(totalPure || 0) + parseFloat(customerBalance || 0)
        ).toFixed(3);

        if (total === "0.000") return ""; 
        return (
          <span
            style={{
              color: total > 0 ? "green" : "red",
              marginLeft: "8px",
              fontWeight: "bold",
            }}
          >
            ({total > 0
              ? "Customer must give to Owner"
              : "Owner must give to Customer"}
            )
          </span>
        );
      })()}
    </b>
  </td>

  <td
    className={styles.trEven}
    style={{
      color:
        (parseFloat(totalPure || 0) + parseFloat(customerBalance || 0)).toFixed(3) > 0
          ? "green"
          : (parseFloat(totalPure || 0) + parseFloat(customerBalance || 0)).toFixed(3) < 0
          ? "red"
          : "inherit",
      fontWeight: "bold",
    }}
  >
    {(() => {
      const total = (
        parseFloat(totalPure || 0) + parseFloat(customerBalance || 0)
      ).toFixed(3);
      return total === "0.000" ? "" : total;
    })()}
  </td>

  <td
    colSpan={1}  
    className={styles.trEven}
    style={{
      color:
        parseFloat(totalAmount || 0) +
          parseFloat(customerBalance || 0) * parseFloat(goldRate || 0) >=
        0
          ? "green"
          : "red",
      fontWeight: "bold",
    }}
  >
    {(
      parseFloat(totalAmount || 0) +
      parseFloat(customerBalance || 0) * parseFloat(goldRate || 0)
    ).toFixed(2)}
  </td>
  <td className={styles.trEven}> </td>
</tr>

</tfoot>
            </table>
          </div>
          <br />
          
          <div style={{ marginTop: "1rem" }}>
            <label>
              <b>Prev Hallmark Balance:</b> {prevHallmark}
            </label>
            <TextField
              label="Hallmark for this bill"
              type="number"
              size="small"
              value={hallmarkForThisBill === 0 ? "" : hallmarkForThisBill}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                setHallmarkForThisBill(value);
                setHallmarkBalance((parseFloat(prevHallmark) || 0) + value);
              }}
              style={{ marginLeft: "1rem" }}
              autoComplete="off"
              onWheel={(e) => e.target.blur()} 
            />
          </div>

          <div className={styles.receivedHeader}>
            <div className={styles.billdetails}>Received Details:</div>
            <IconButton
  onClick={addReceivedRow}
  disabled={(parseFloat(totalPure || 0) + parseFloat(customerBalance || 0)) < 0}
>
  <AddCircleOutlineIcon />
</IconButton>

          </div>
          <div >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th style={{width:'3rem'}} >Type</th>
                  <th style={{width:'22rem'}}>Gold Rate</th>
                  <th style={{width:'17rem'}}>Gold Weight</th>
                  <th style={{width:'17rem'}}>Touch</th>
                  <th style={{width:'17rem'}}>Purity </th>
                  <th style={{width:'17rem'}}>Amount</th>
                  <th>Hallmark Charge</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {receivedRows.map((row, idx) => (
                  <tr key={row.id}>
                    <td>{idx + 1}</td>
                    <td>{row.date}</td>
                    <td>
                      <TextField
                        select
                        size="small"
                        value={row.type}
                        onChange={(e) =>
                          handleReceivedInput(idx, "type", e.target.value)
                        }
                      >
                        <MenuItem value="Gold">Gold</MenuItem>
                        <MenuItem value="Cash">Cash</MenuItem>
                      </TextField>
                    </td>
                    <td style={{padding:'0.3rem'}}>
                      <TextField
                        type="number"
                        size="small"
                        value={row.goldRate}
                        disabled={row.type === "Gold"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "goldRate", e.target.value)
                        }
                        autoComplete="off"
                        onWheel={(e) => e.target.blur()}                      
                      />
                    </td>
                    <td style={{padding:'0.3rem'}} >
                      <TextField
                        type="number"
                        size="small"
                        value={row.gold}
                        disabled={row.type === "Cash"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "gold", e.target.value)
                        }
                        autoComplete="off"
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td style={{padding:'0.3rem'}}>
                      
<TextField
  type="number"
  size="small"
  value={row.touchValue || ""}
  disabled={row.type === "Cash"}
  onChange={(e) => handleReceivedInput(idx, "touchValue", e.target.value)}
  autoComplete="off"
  onWheel={(e) => e.target.blur()} 
/>
                    </td>
                    <td style={{padding:'0.3rem'}}>
                      <TextField
                        type="number"
                        size="small"
                        value={
                          row.purityWeight ? row.purityWeight.toFixed(3) : ""
                        }
                        InputProps={{ readOnly: true }}
                      />
                    </td>
                    <td style={{padding:'0.3rem'}}>
                      <TextField
                        type="number"
                        size="small"
                        value={row.amount}
                        disabled={row.type === "Gold"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "amount", e.target.value)
                        }
                        autoComplete="off"
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td style={{padding:'0.3rem'}}>
                      <TextField
                        type="number"
                        size="small"
                        value={row.hallmarkCharge}
                        onChange={(e) =>
                          handleReceivedInput(
                            idx,
                            "hallmarkCharge",
                            e.target.value
                          )
                        }
                        autoComplete="off"
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td>
                      <IconButton
                        onClick={() => deleteReceivedRow(row.id)}
                        size="small"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className={styles.trEven}>
                <tr>
                  <td colSpan={6}>
                    <b>Total Purity</b>
                  </td>
                  <td>
                    <b>{totalReceivedPurity.toFixed(3)}</b>
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <br />

          <div className={styles.balance}>
            <p>
              <b>Cash Balance:</b> ₹{" "}
              {cashBalance ? parseFloat(cashBalance).toFixed(2) : 0}
            </p>
            <p style={{color:'green'}}>
  <b>Pure Balance:</b> {pureBalance}
</p>
<p style={{color:'red'}}>
  <b>Excess Pure:</b> {excessPure}
</p>

            <p>
              <b>Hallmark Balance:</b> {hallmarkBalance}
            </p>
          </div>

          <Button
            variant="contained"
            sx={{ mt: 5}}
            onClick={handleSave}
          >
            Save
          </Button> 
 
          <Button
  variant="contained"
  sx={{ mt: 5, ml: 2 }}
  onClick={() => setOpenBillsPopup(true)}
>
  View All Bills
</Button> 

        </div>


        <div className={styles.tablecard}>
          <h3>Available Product Weights</h3>
          <div className={styles.billdetails}>Product Details:</div>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product Weight</th>
                  <th>Stone Weight</th>
                  <th>Touch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.weight}</td>
                    <td>{item.stone_weight ? item.stone_weight : "-"}</td>
                    <td>{item.touchId?.touch ? item.touchId.touch : "-"}</td>
                    <td>
                      <Button size="small" onClick={() => addToBill(item, idx)}>
                        Add
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
<SavedBills
  openBillsPopup={openBillsPopup}
  setOpenBillsPopup={setOpenBillsPopup}
  bills={bills}
  viewBill={viewBill}
  setViewBill={setViewBill}
  printRef={printRef}
/>
    </>
  );
};

export default Billing;