import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { TextField, IconButton, MenuItem, Button,Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./Billing.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { Dialog, DialogTitle, DialogContent, DialogActions,} from "@mui/material";

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
const [printSize, setPrintSize] = useState("A4");
const printRef = useRef();

const handlePrint = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    @page { size: ${printSize}; margin: 1mm; }
    @media print {
      body * {
        visibility: hidden;
      }
      #print-section, #print-section * {
        visibility: visible;
      }
      #print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
};


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
          `${BACKEND_SERVER_URL}/api/transactions/${selectedCustomerId}`
        );
        console.log("sdhiohf", response);

        let Usedbalance = response.data.reduce(
          (sum, item) => sum + (item.usedPurity || 0),
          0
        );
        let Availablebalance = response.data.reduce(
          (sum, item) => sum + (item.purity || 0),
          0
        );
        let balance = Availablebalance - Usedbalance;

        if (balance > 0) {
          setCustomerBalance(balance);
        }
      }
    } catch (error) {
      console.error("Error fetching customer balance:", error);
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
  

  // const addToBill = (item, index) => {
  //   const totalWeight = parseFloat(item.weight || 0) - parseFloat(item.stoneWeight || 0);

  //   setBillItems((prev) => [
  //     ...prev,
  //     {
  //       ...item,
  //       totalWeight,
  //       percent: "",
  //       pure: 0,
  //       amount: 0,
  //     },
  //   ]);

  //   const updatedAvailable = [...availableItems];
  //   updatedAvailable.splice(index, 1);
  //   setAvailableItems(updatedAvailable);
  // };

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

  const totalBillingPure = billItems.reduce(
    (sum, item) => sum + (item.pure || 0),
    0
  );

  const pureBalanceValue =
    customerBalance > 0
      ? customerBalance - totalBillingPure > 0
        ? 0
        : parseFloat(totalPure) -
          parseFloat(totalReceivedPurity) -
          parseFloat(customerBalance)
      : parseFloat(totalPure) - parseFloat(totalReceivedPurity);

  let pureBalance = pureBalanceValue.toFixed(3);
  let cashBalance = "0.00";

  if (receivedRows.length > 0) {
    const lastRow = receivedRows[receivedRows.length - 1];
    const lastRate = parseFloat(lastRow.goldRate);

    if (!isNaN(lastRate) && lastRate > 0) {
      const absPure = totalPure - customerBalance - totalReceivedPurity;
      console.log("absPure", absPure, "lastRate", lastRate);
      cashBalance = absPure * lastRate;
    }
  }

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
        cashBalance:
          parseFloat(cashBalance) > 0
            ? parseFloat(cashBalance).toFixed(2)
            : "0.00",
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
      pureBalance = 0;
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
  {customerBalance > 0 ? (
    <tr style={{ color: "green", fontWeight: "bold" }}>
      <td colSpan={5}>
        Customer Excess Balance
      </td>
      <td>{parseFloat(customerBalance).toFixed(3)}</td>
      <td>{(customerBalance * goldRate).toFixed(2)}</td>
      <td></td>
    </tr>
  ) : (
    <tr style={{ color: "red", fontWeight: "bold" }}>
      <td colSpan={5}>
        Customer Balance
      </td>
      <td>{parseFloat(Math.abs(customerBalance)).toFixed(3)}</td>
      <td>{(Math.abs(customerBalance) * goldRate).toFixed(2)}</td>
      <td></td>
    </tr>
  )}

  <tr>
    <td colSpan={5}>
      <b>Final Bill Total</b>
    </td>
    <td>{totalPure}</td>
    <td>{totalAmount}</td>
    <td></td>
  </tr>

  <tr>
    <td colSpan={5} className={styles.trEven}>
      <b>Total</b>
    </td>
    <td className={styles.trEven}>
      {(totalPure - customerBalance).toFixed(3)}
    </td>

     <td
      colSpan={3}
      className={styles.trEven}
      style={{
        color:
          totalAmount - customerBalance * goldRate >= 0 ? "green" : "red",
        fontWeight: "bold",
      }}
    >
      {(totalAmount - customerBalance * goldRate).toFixed(2)} <br />
      {totalAmount - customerBalance * goldRate >= 0
        ? "Customer must give to Owner"
        : "Owner must give to Customer"}
    </td>
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
              value={hallmarkForThisBill}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
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
              disabled={totalPure - customerBalance < 0}
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
            <p>
              <b>Excess Pure:</b>{" "}
              {pureBalanceValue < 0 ? Math.abs(pureBalance) : "0.00"}
            </p>
            <p>
              <b>Pure Balance:</b>{" "}
              {pureBalanceValue >= 0 ? pureBalance : "0.00"}
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

        <Dialog
  open={openBillsPopup}
  onClose={() => setOpenBillsPopup(false)}
  maxWidth="md"
  fullWidth
>

  <br/> 
  <div id="print-section" ref={printRef} > 
  <h4><center>  Saved Bill Details </center> </h4>
  <DialogContent>
    {!viewBill ? (
      <div className={styles.table}>
        <div style={{marginLeft:'3rem'}}> 
        <table>
          <thead>
            <tr>
              <th style={{width:'5rem'}} >S.No</th>
              <th style={{width:'10rem'}}>Bill No</th>
              <th style={{width:'12rem'}}>Customer Name</th>
              <th style={{width:'10rem'}}>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, idx) => (
              <tr key={bill.id}>
                <td>{idx + 1}</td>
                <td>{bill.bill_no || idx + 1}</td>
                <td>{bill.customer?.name || "-"}</td>
                <td>{bill.date}</td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setViewBill(bill)}
                  >
                    view bill details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    ) : (
      // Show bill details in view mode
<div> 
  
<div className={styles.bill}>
  <div className={styles.leftSection}>
    <Typography><b>Bill No: </b> {viewBill.bill_no}</Typography>
    <Typography><b>Customer Name: </b> {viewBill.customer?.name}</Typography>
    <Typography><b>Gold Rate: </b> {viewBill.gold_rate}</Typography>
  </div>

  <div className={styles.rightSection}>
    <Typography><b>Date: </b>{viewBill.date}</Typography>
    <Typography><b>Time: </b>{viewBill.time}</Typography>
  </div>
</div>
      <div className={styles.billdetails}>Bill Details:</div>
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Weight</th>
              <th>Stone Weight</th>
              <th>Total Weight</th>
              <th style={{width:'5rem'}}>%</th>
              <th>Pure</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {viewBill.billItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.weight}</td>
                <td>{item.stone_weight}</td>
                <td>{item.total_weight}</td>
                <td>{item.touch.touch || item.touchId}</td>
                <td>{item.pure}</td>
                <td>{item.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}><b>Excess Balance</b></td>
              <td>{viewBill.customer_balance}</td>
              <td>{(viewBill.customer_balance * viewBill.gold_rate).toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={5}><b>Final Bill Total</b></td>
              <td>{viewBill.total_pure}</td>
              <td>{viewBill.total_amount}</td>
            </tr>
            <tr>
              <td colSpan={5} className={styles.trEven}><b>Total</b></td>
              <td className={styles.trEven}>
                {(viewBill.total_pure - viewBill.customer_balance).toFixed(3)}
              </td>
              <td className={styles.trEven}>
                {(viewBill.total_amount - viewBill.customer_balance * viewBill.gold_rate).toFixed(2)} <br />
                {viewBill.total_amount - viewBill.customer_balance * viewBill.gold_rate >= 0
                  ? "Customer must give to Owner"
                  : "Owner must give to Customer"}
              </td>
            </tr>
          </tfoot>


        </table>
      </div>
  
      <div className={styles.bal}>
        <p><b>Prev Hallmark Balance:</b> {viewBill.prev_hallmark}</p>
      </div>
  
      <div className={styles.receivedHeader}>
        <div className={styles.billdetails}>Received Details:</div>
      </div>
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Type</th>
              <th>Gold Rate</th>
              <th>Gold WT</th>
              <th>Touch</th>
              <th>Purity Weight</th>
              <th>Amount</th>
              <th>Hallmark Charge</th>
            </tr>
          </thead>
          <tbody>
            {viewBill.receivedItems?.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{row.date}</td>
                <td>{row.type}</td>
                <td>{row.goldRate || "-" }</td>
                <td>{row.gold || "-"}</td>
                <td>{row.touch?.touch ?? "-"}</td> 
                <td>{row.purity_weight || "-"}</td>
                <td>{row.amount || "-"}</td>
                <td>{row.hallmark_charge || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className={styles.trEven}>
            <tr>
              <td colSpan={6}><b>Total Purity</b></td>
              <td> <b>
        {viewBill.receivedItems?.reduce(
          (sum, row) => sum + (Number(row.purity_weight) || 0),
          0
        ) ?? 0} </b> </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
  
      <div className={styles.balance} style={{marginTop:'2rem'}}>
    
        <p><b>Cash Balance:</b> ₹{viewBill.cash_balance}</p>
        <p><b>Excess Pure:</b> {viewBill.excessPure}</p>
        <p><b>Pure Balance:</b> {viewBill.pure_balance.toFixed(3)}</p>
        <p><b>Hallmark Balance:</b> {viewBill.hallmark_balance}</p>
      </div>

    {/* 🔹 Controls (hidden during print) */}
    <div className="no-print" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <select
          value={printSize}
          onChange={(e) => setPrintSize(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="A6">A6</option>
        </select>

        <button onClick={() => handlePrint()}>Print Bill</button>
        <button onClick={() => setViewBill(null)}>Back to Bills</button>
      </div>

      
    </div>
    )}
  </DialogContent>
  </div>
  <DialogActions>
    <Button   variant="outlined" onClick={() => setOpenBillsPopup(false)}>Close</Button>
  </DialogActions>
</Dialog>

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
    </>
  );
};

export default Billing;
