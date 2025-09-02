import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import { TextField, IconButton, MenuItem, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from './Billing.module.css';

const customerList = [
  { name: "Dhanusha", balance: 1000 },
  { name: "Selva", balance: -500 },
  { name: "Saranya", balance: 200 },
  { name: "Ashwin", balance: -300 },
  { name: "Amal", balance: 0 }
];

const productList = {
  Ring: [
    { weight: 5, touch: 91.5 },
    { weight: 4.5, touch: 92 },
    { weight: 6, touch: 90 }
  ],
  Chain: [
    { weight: 10, touch: 91 },
    { weight: 9.5, touch: 92.5 }
  ],
  Stud: [
    { weight: 3, touch: 91 },
    { weight: 3.5, touch: 90 }
  ],
  Bracelite: [
    { weight: 8, touch: 93 }
  ]
};

const Billing = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [goldRate, setGoldRate] = useState('');
  const [receivedRows, setReceivedRows] = useState([]);
  const [totalReceivedPurity, setTotalReceivedPurity] = useState(0);

// Recalculate total received purity whenever receivedRows changes
useEffect(() => {
  const total = receivedRows.reduce((sum, row) => {
    return sum + (parseFloat(row.purityWeight) || 0);
  }, 0);
  setTotalReceivedPurity(total.toFixed(2));
}, [receivedRows]);

// Add row in Received table
const addReceivedRow = () => {
  setReceivedRows(prev => [
    ...prev,
    {
      id: Date.now(),
      date: currentDate,
      goldRate: '',
      gold: '',
      touch: '',
      purityWeight: '',
      amount: ''
    }
  ]);
};

// Handle field changes
const handleReceivedInput = (index, field, value) => {
  const updated = [...receivedRows];
  updated[index][field] = value;

  const row = updated[index];
  const gold = parseFloat(row.gold);
  const touch = parseFloat(row.touch);
  const goldRate = parseFloat(row.goldRate);
  const amount = parseFloat(row.amount);

  if (!isNaN(gold) && !isNaN(touch)) {
    row.purityWeight = (gold * touch).toFixed(2);
  } else if (!isNaN(goldRate) && !isNaN(amount)) {
    row.purityWeight = (amount / goldRate).toFixed(2);
  } else {
    row.purityWeight = '';
  }

  setReceivedRows(updated);
};



useEffect(() => {
  if (!goldRate) return;
  const updated = billItems.map((item) => {
    const weight = parseFloat(item.weight);
    const touch = parseFloat(item.touch);
    const percent = parseFloat(item.percent || 0);
    const rate = parseFloat(goldRate);

    if (!isNaN(weight) && !isNaN(touch)) {
      const pure = ((percent + touch) * weight) / 100;
      const amount = rate * pure;

      return {
        ...item,
        pure: parseFloat(pure.toFixed(2)),
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
  billItems.forEach(item => {
    totalPure += item.pure || 0;
    totalAmount += item.amount || 0;
  });
  return { totalPure: totalPure.toFixed(2), totalAmount: totalAmount.toFixed(2) };
};



// Delete from Received Table
const deleteReceivedRow = (id) => {
  if (window.confirm("Delete row?")) {
    setReceivedRows(prev => prev.filter(row => row.id !== id));
  }
};


const deleteBillItem = (index) => {
  const updatedBill = [...billItems];
  const removedItem = updatedBill.splice(index, 1)[0];

  setBillItems(updatedBill);

  // Add the removed item back to available items
  setAvailableItems(prev => [...prev, { weight: removedItem.weight, touch: removedItem.touch }]);
};



  const now = new Date();
  const currentDate = now.toLocaleDateString('en-GB');
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Update available items when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setAvailableItems(productList[selectedProduct] || []);
    } else {
      setAvailableItems([]);
    }
  }, [selectedProduct]);

  const addToBill = (item, index) => {
    setBillItems(prev => [
      ...prev,
      {
        ...item,
        percent: '',
        pure: 0,
        amount: 0
      }
    ]);
  
    const updatedAvailable = [...availableItems];
    updatedAvailable.splice(index, 1);
    setAvailableItems(updatedAvailable);
  };
  



  const handleInputChange = (index, field, value) => {
    const newBill = [...billItems];
    newBill[index][field] = value;

    const weight = parseFloat(newBill[index].weight);
    const touch = parseFloat(newBill[index].touch);
    const percent = parseFloat(newBill[index].percent || 0);
    const rate = parseFloat(goldRate || 0);

    if (!isNaN(weight) && !isNaN(touch)) {
      const pure = ((percent + touch) * weight) / 100;
      const amount = rate ? pure * rate : 0;

      newBill[index].pure = parseFloat(pure.toFixed(2));
      newBill[index].amount = parseFloat(amount.toFixed(2));
    }

    setBillItems(newBill);
  };

  const getCustomerBalance = () => {
    const customer = customerList.find(c => c.name === selectedCustomer);
    return customer ? customer.balance : 0;
  };

  const { totalPure, totalAmount } = getBillTotal();
  const balance = getCustomerBalance();
  const grandTotal = totalAmount - balance;


  const pureBalanceValue = parseFloat(totalPure) - parseFloat(totalReceivedPurity);
  const pureBalance = pureBalanceValue.toFixed(2);
  
  // Get last valid entered gold rate
  const validGoldRates = receivedRows
    .map(row => parseFloat(row.goldRate))
    .filter(rate => !isNaN(rate));
  const lastGoldRate = validGoldRates.length
    ? validGoldRates[validGoldRates.length - 1] : 0;
  
  //  Final Cash Balance Logic
  const cashBalance = pureBalanceValue > 0
      ? (pureBalanceValue * lastGoldRate).toFixed(2) : '0.00';
  

      const handleSave = () => {
        const data = {
          customer: selectedCustomer,
          productType: selectedProduct,
          billItems,
          goldRate,
          totalBillPure: totalPure,
          totalBillAmount: totalAmount,
          customerBalance: balance,
          grandTotal,
          receivedItems: receivedRows,
          totalReceivedPurity,
          pureBalance: pureBalanceValue,
          cashBalance,
          date: currentDate,
          time,
        };
      
        // 🛠 You can post this to backend here
        console.log("Saving Bill Data:", data);
        alert("Bill data saved successfully!");
      };
      


  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 >Estimate Only</h3>
          
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
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={{ marginRight: 10, width:'12rem' }}
            >
              {customerList.map((c, idx) => (
                <MenuItem key={idx} value={c.name}>{c.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Item Name"
              size="small"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ marginRight: 10, width:'12rem' }}
            >
              {Object.keys(productList).map((name, idx) => (
                <MenuItem key={idx} value={name}>{name}</MenuItem>
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
                  <th>Touch</th>
                  <th>%</th>
                  <th>Pure</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, index) => (
                  <tr key={index}>
                    <td>{selectedProduct}</td>
                    <td>{item.weight}</td>
                    <td>{item.touch}</td>
                    <td>
                      <TextField
                        size="small"
                        type="number"
                        value={item.percent}
                        onChange={(e) => handleInputChange(index, 'percent', e.target.value)}
                      />
                    </td>
                    <td>{item.pure}</td>
                    <td>{item.amount}</td>
                    <td>
        <IconButton onClick={() => deleteBillItem(index)} size="small">
          <DeleteIcon color="error" />
        </IconButton>
      </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><b>Bill Total</b></td>
                  <td>{totalPure}</td>
                  <td>{totalAmount}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4}><b>Balance</b></td>
                  <td colSpan={3}>{balance}</td>
                </tr>
                <tr>
                  <td colSpan={4}><b>Total</b></td>
                  <td colSpan={3}>{grandTotal} <br />
                    {balance >= 0
                      ? "Customer must give to Owner"
                      : "Owner must give to Customer"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles.receivedHeader}>
            <div className={styles.billdetails}>Received Details:</div>
            <IconButton onClick={addReceivedRow}><AddCircleOutlineIcon /></IconButton>
          </div>
          <div className={styles.tablehead}>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Gold Rate</th>
                  <th>Gold</th>
                  <th>Touch</th>
                  <th>Purity Weight</th>
                  <th>Amount</th>
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
          type="number"
          size="small"
          value={row.goldRate}
          onChange={(e) => handleReceivedInput(idx, 'goldRate', e.target.value)}
        />
      </td>
      <td>
        <TextField
          type="number"
          size="small"
          value={row.gold}
          onChange={(e) => handleReceivedInput(idx, 'gold', e.target.value)}
        />
      </td>
      <td>
        <TextField
          type="number"
          size="small"
          value={row.touch}
          onChange={(e) => handleReceivedInput(idx, 'touch', e.target.value)}
        />
      </td>
      <td>
        <TextField
          type="number"
          size="small"
          value={row.purityWeight}
          InputProps={{ readOnly: true }}
        />
      </td>
      <td>
        <TextField
          type="number"
          size="small"
          value={row.amount}
          onChange={(e) => handleReceivedInput(idx, 'amount', e.target.value)}
        />
      </td>
      <td>
        <IconButton onClick={() => deleteReceivedRow(row.id)} size="small">
          <DeleteIcon color="error" />
        </IconButton>
      </td>
    </tr>
  ))}
</tbody>

              <tfoot>
  <tr>
    <td colSpan={5}><b>Total Purity</b></td>
    <td><b>{totalReceivedPurity}</b></td>
    <td colSpan={2}></td>
  </tr>
</tfoot>
            </table>
          </div>
<br/>

<div className={styles.balance}>
  <p><b>Cash Balance:</b> ₹ {cashBalance}</p>
  <p><b>Excess Pure:</b> {pureBalanceValue < 0 ? Math.abs(pureBalance) : '0.00'}</p>
  <p><b>Pure Balance:</b> {pureBalanceValue >= 0 ? pureBalance : '0.00'}</p>

</div>



<Button
  variant="contained"
  sx={{ mt: 5, backgroundColor: 'rgb(139, 103, 14)', }}
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
                  <th>Touch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.weight}</td>
                    <td>{item.touch}</td>
                    <td><Button size="small" onClick={() => addToBill(item,idx)}>Add</Button></td>
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






