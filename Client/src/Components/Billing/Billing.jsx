import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { TextField, IconButton, MenuItem, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./Billing.module.css";
import { BACKEND_SERVER_URL } from "../../../Config/config";

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
    const totalWeight = item.weight - (item.stoneWeight || 0);

    setBillItems((prev) => [
      ...prev,
      {
        ...item,
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

  const totalBillingPure = billItems.reduce(
    (sum, item) => sum + (item.pure || 0),
    0
  );

  const pureBalanceValue =
    customerBalance > 0
      ? customerBalance - totalBillingPure > 0
        ? 0
        :   parseFloat(totalPure) -
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

          <p className={styles.customerCard}>
            <span>Customer Name:</span> {selectedCustomer}
          </p>

          <div className={styles.billdetails}>Bill Details:</div>
          <div className={styles.tablehead}>
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
                    <td>{item.stone_weight}</td>
                    <td>{item.totalWeight}</td>

                    <td>
                      <TextField
                        select
                        size="small"
                        value={item.touchId || ""}
                        onChange={(e) => {
                          const selected = touchItems.find(
                            (t) => t.id === parseInt(e.target.value)
                          );
                          handleInputChange(index, "percent", selected.touch);
                          handleInputChange(index, "touchId", selected.id);
                        }}
                        style={{ width: "6rem" }}
                      >
                        {touchItems.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.touch}
                          </MenuItem>
                        ))}
                      </TextField>
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
                <tr>
                  <td colSpan={5}>
                    <b>Excess Balance</b>
                  </td>
                  <td>
                    {customerBalance
                      ? parseFloat(customerBalance).toFixed(3)
                      : 0}
                  </td>
                  <td> {customerBalance * goldRate}</td>
                  <td> </td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <b>Final Bill Total</b>
                  </td>
                  <td>{totalPure}</td>
                  <td>{totalAmount}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <b>Total</b>
                  </td>
                  <td>{(totalPure - customerBalance).toFixed(3)}</td>
                  <td colSpan={3}>
                    {(totalAmount - customerBalance * goldRate).toFixed(2)}{" "}
                    <br />
                    {totalAmount - customerBalance * goldRate >= 0
                      ? "Customer must give to Owner"
                      : "Owner must give to Customer"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <br />
          {/* <label><b>  Prev Hallmark : </b> 0 </label> */}

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
          <div className={styles.tablehead}>
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
                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={row.goldRate}
                        disabled={row.type === "Gold"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "goldRate", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={row.gold}
                        disabled={row.type === "Cash"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "gold", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <TextField
                        select
                        size="small"
                        value={row.touchId || ""}
                        disabled={row.type === "Cash"}
                        onChange={(e) => {
                          const selected = touchItems.find(
                            (t) => t.id === parseInt(e.target.value)
                          );
                          handleReceivedInput(idx, "touchId", selected.id);
                          handleReceivedInput(
                            idx,
                            "touchValue",
                            selected.touch
                          );
                        }}
                      >
                        {touchItems.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.touch}
                          </MenuItem>
                        ))}
                      </TextField>
                    </td>
                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={
                          row.purityWeight ? row.purityWeight.toFixed(3) : ""
                        }
                        InputProps={{ readOnly: true }}
                      />
                    </td>
                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={row.amount}
                        disabled={row.type === "Gold"}
                        onChange={(e) =>
                          handleReceivedInput(idx, "amount", e.target.value)
                        }
                      />
                    </td>
                    <td>
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

              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <b>Total Purity</b>
                  </td>
                  <td>
                    <b>{totalReceivedPurity.toFixed(3)}</b>
                  </td>
                  <td colSpan={2}></td>
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
            sx={{ mt: 5, backgroundColor: "rgb(139, 103, 14)" }}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
        <div className={styles.tablecard}>
          <h3>Available Product Weights</h3>
          <div className={styles.billdetails}>Product Details:</div>
          <div className={styles.tablehead}>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product Finish Weight</th>
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
