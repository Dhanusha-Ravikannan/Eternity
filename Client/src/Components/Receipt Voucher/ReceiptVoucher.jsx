
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import styles from "./ReceiptVoucher.module.css"
import ReactDOMServer from "react-dom/server";
import Navbar from "../Navbar/Navbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import { receiptValidation } from "./ReceiptValidation";
import PrintReceipt from "./PrintReceipt";
import { TextField, MenuItem, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { IoReceipt } from "react-icons/io5";

const ReceiptVoucher = () => {
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [receiptBalances, setReceiptBalances] = useState({
    oldbalance: 0,
    hallMark: 0,
  });
  const selectedType = ["Cash", "Gold"];
  const [masterTouch, setMasterTouch] = useState([]);
  const [receipt, setReceipt] = useState([
    {
      date: formattedToday,
      type: "",
      goldRate: "",
      gold: "",
      touch: "",
      purity: "",
      amount: "",
      hallMark: "",
    },
  ]);
  const [receiptErrors, setReceiptErrors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const inputRefs = useRef({});

  useEffect(() => {


    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers`);
        console.log("customer response", response.data);

        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    const fetchTouch = async () => {
      try {
        const res = await  axios.get(`${BACKEND_SERVER_URL}/api/addtouch`)
        setMasterTouch(res.data);
        console.log("res touch", res.data);
      } catch (err) {
        console.error("Failed to fetch touch values", err);
      }
    };
    fetchCustomers();
    fetchTouch();
  }, []);

  const handleAddRow = () => {
    const newRow = {
      date: formattedToday,
      type: "",
      goldRate: "",
      gold: "",
      touch: "",
      purity: "",
      amount: "",
      hallMark: "",
    };
    setReceipt((prev) => [...prev, newRow]);
  };
  const handleRemoveRow = (index) => {
    let isTrue = window.confirm("Are You Want to Remove Receipt Row");
    if (isTrue) {
      const filterRows = receipt.filter((_, i) => i !== index);
      console.log("filterRows and index", filterRows, index);
      setReceipt(filterRows);
    }
  };

  const handleChangeReceipt = (index, field, value) => {
    const updatedRows = [...receipt];
  
    // Store the raw value in state
    updatedRows[index][field] = value;
  
    // For purity calculation, fetch the numeric touch if field is touch
    let goldRate = parseFloat(updatedRows[index].goldRate) || 0;
    let gold = parseFloat(updatedRows[index].gold) || 0;
    let amount = parseFloat(updatedRows[index].amount) || 0;
  
    // Lookup numeric touch value from masterTouch if touch ID exists
    let touchValue = 0;
    if (updatedRows[index].touch) {
      const touchObj = masterTouch.find(
        (t) => t.id === parseInt(updatedRows[index].touch)
      );
      touchValue = touchObj ? parseFloat(touchObj.touch) : 0;
    }
  
    // Purity calculation
    let calculatedPurity = 0;
    if (goldRate > 0 && amount > 0) {
      calculatedPurity = amount / goldRate;
    } else if (gold > 0 && touchValue > 0) {
      calculatedPurity = gold * (touchValue / 100);
    }
  
    updatedRows[index].purity = calculatedPurity.toFixed(3);
  
    setReceipt(updatedRows);
    receiptValidation(receipt, setReceiptErrors);
  };
  

  const handleCustomerChange = async (event) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
  
    if (!customerId || customerId === "Select Customer") return; 
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/customers/${customerId}`);
  
      console.log("Customer + Hallmark response:", response.data);
  
      const dataArray = response.data;
      const data = Array.isArray(dataArray) && dataArray.length > 0 ? dataArray[0] : null;
  
      if (!data) {
        setReceiptBalances({ oldbalance: 0, hallMark: 0 });
        return;
      }

      setReceiptBalances({
        oldbalance: (data?.customer?.openingBalance ?? data?.customer?.balance) ?? 0,
        hallMark: data?.balance ?? 0, });
    } catch (error) {
      console.error("Error fetching customer balances:", error);
      toast.error("Failed to fetch customer balances");
    }
  };
  
  const totalReceivedPurity = receipt.reduce(
    (acc, row) => acc + (parseFloat(row.purity) || 0),  0  );
  const pureBalance = receiptBalances.oldbalance - totalReceivedPurity;
  const lastGoldRate = [...receipt]
    .reverse()
    .find((row) => parseFloat(row.goldRate))?.goldRate;

  const cashBalance = lastGoldRate
    ? (parseFloat(lastGoldRate) * pureBalance).toFixed(2)
    : "0.00";

  const totalBillHallmark = parseFloat(receiptBalances.hallMark) || 0;

  const totalReceivedHallmark = receipt.reduce(
    (total, row) => total + (parseFloat(row.hallMark) || 0),   0  );

  const hallmarkBalance = totalBillHallmark - totalReceivedHallmark;

  const handlePrint = (receipt, selectedCustomer) => {
    const customerName = customers.find(
      (item) => String(item.id) === String(selectedCustomer)
    );

    const printContent = (
      <PrintReceipt
        receipt={receipt}
        customerName={customerName.name}
        oldbalance={receiptBalances?.oldbalance}
        oldHallMark={receiptBalances?.hallMark}
        cashBalance={cashBalance}
        pureBalance={pureBalance}
        hallMark={hallmarkBalance}
      />
    );

    const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt Print</title>
       
      <body>
        ${ReactDOMServer.renderToString(printContent)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          };
        </script>
      </body>
    </html>
  `;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  const handleSaveReeceipt = () => {
    const payLoad = {
      customerId: selectedCustomer,
      received: receipt,
      pureBalance: pureBalance,
      hallmarkBalance: hallmarkBalance,
    };
    console.log("Receipt payLoad", payLoad);

    const saveReceipt = async () => {
      handlePrint(receipt, selectedCustomer);
      try {
        const response = await axios.post(
          `${BACKEND_SERVER_URL}/api/receiptvoucher/receipt`,
          payLoad
        );
        if (response.status === 201) {
          toast.success(response.data.message, { autoClose: 2000 });
          setSelectedCustomer("");
          setReceipt([
            {
              date: formattedToday,
              type: "",
              goldRate: "",
              gold: "",
              touch: "",
              purity: "",
              amount: "",
              hallMark: "",
            },
          ]);
          setReceiptBalances({ oldbalance: 0, hallMark: 0 });
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response.data.error, { autoClose: 2000 });
      }
    };
    if (!selectedCustomer) return toast.warn("Select Customer");
    receiptValidation(receipt, setReceiptErrors)
      ? saveReceipt()
      : toast.warn("Give Correct Information");
  };

  return (
    <>
    <Navbar/>
      <div>
        <div className={styles.receiptTitle}>
          <h4> <IoReceipt />  Receipt Voucher </h4>
        </div>

        <div>
          <div className={styles.receiptFlex}>
            <div>
              <p className={styles.receiptLabel}>Customer Name</p>
              <select
                value={selectedCustomer}
                onChange={handleCustomerChange}
                className={styles.receiptSelect}
              >
                <option value="Select Customer">Select Customer</option>
                {customers.map((option) => (
                  <option key={option.id} value={option?.id}>
                    {option?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={styles.receiptLabel}>Old Balance Purity</p>
              <input
                className={styles.receiptInput}
                readOnly
                value={Number(receiptBalances?.oldbalance ?? 0).toFixed(3)}  />
            </div>
            <div>
              <p className={styles.receiptLabel}>Hall Mark Balance</p>
              <input
                className={styles.receiptInput}
                readOnly
                value={Number(receiptBalances?.hallMark ?? 0).toFixed(3)}
              />
            </div>
            <div>

              <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft:'35.5rem'
            }}
            variant="contained"
            onClick={() => {
                handleAddRow();
              }}
        
          > Add Row </Button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.receiptTable}>
              <thead className={styles.receipthead}>
                <tr className={styles.receiptRow}>
                  <th>S.no</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>GoldRate</th>
                  <th>Gold</th>
                  <th>Touch</th>
                  <th>Purity</th>
                  <th>Amount</th>
                  <th>Hall Mark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className={styles.receiptbody}>
                {receipt.map((item, index) => (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="date"
                        className={styles.receiptTableDate}
                        value={item.date}
                        onChange={(e) =>
                          handleChangeReceipt(index, "date", e.target.value)
                        }
                      />

                      <br></br>
                      {receiptErrors[index]?.date && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.date}
                        </span>
                      )}
                    </td>
                    <td>
                      <select
                        value={item.type}
                        onChange={(e) => {
                          handleChangeReceipt(index, "type", e.target.value);
                        }}
                        className="receiptSelect"
                      >
                        <option value="">Select Type</option>
                        {selectedType.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <br></br>
                      {receiptErrors[index]?.type && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.type}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        disabled={item.type === "Cash" ? false : true}
                        className={styles.receiptTableInput}
                        value={item.goldRate}
                        onChange={(e) =>
                          handleChangeReceipt(index, "goldRate", e.target.value)
                        }
                      />
                      <br></br>
                      {receiptErrors[index]?.goldRate && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.goldRate}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        disabled={item.type === "Gold" ? false : true}
                        className={styles.receiptTableInput}
                        value={item.gold}
                        onChange={(e) =>
                          handleChangeReceipt(index, "gold", e.target.value)
                        }
                      />
                      <br></br>
                      {receiptErrors[index]?.gold && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.gold}
                        </span>
                      )}
                    </td>
                    <td>
                      <select
                        disabled={item.type === "Gold" ? false : true}
                        value={item.touch}
                        onChange={(e) => {
                          handleChangeReceipt(index, "touch", e.target.value);
                        }}
                        className={styles.receiptTableInput}
                      >
                        <option value="">touch</option>
                        {masterTouch.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.touch}
                          </option>
                        ))}
                      </select>

                      <br></br>
                      {receiptErrors[index]?.touch && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.touch}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        value={item.purity}
                        readOnly
                        className={styles.receiptTableInput}
                      />
                    </td>
                    <td>
                      <input
                        disabled={item.type === "Cash" ? false : true}
                        className={styles.receiptTableInput}
                        value={item.amount}
                        onChange={(e) =>
                          handleChangeReceipt(index, "amount", e.target.value)
                        }
                      />
                      <br></br>
                      {receiptErrors[index]?.amount && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.amount}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        className={styles.receiptTableInput}
                        value={item.hallMark}
                        onChange={(e) =>
                          handleChangeReceipt(index, "hallMark", e.target.value)
                        }
                      />
                      <br></br>
                      {receiptErrors[index]?.hallMark && (
                        <span className={styles.error}>
                          {receiptErrors[index]?.hallMark}
                        </span>
                      )}
                    </td>
                    <td className={styles.delIcon}>
                         <DeleteIcon 
                          onClick={() => {
                            handleRemoveRow(index);
                          }}
                          />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                 <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
              size:'sm',
              marginLeft:'6rem'
            
            }}
            variant="contained"
            disabled={receipt.length <= 0}
            onClick={() => {
              handleSaveReeceipt();
            }}
        
          > Save </Button>

          <div className={styles.receiptBalances}>
            <div>
              <p>
                CashBalance ₹
                {Number(cashBalance).toLocaleString("en-IN", {
                })}
              </p>
            </div>
<div>
  <p>
    {pureBalance < 0 ? "ExcessBalance" : "PureBalance"}
    <span
      style={{
        marginLeft: "1rem",
        color: pureBalance < 0 ? "red" : "green",
        fontWeight: "bold",
      }}
    >
      {pureBalance.toFixed(3)}
    </span>
  </p>
</div>

<div>
  <p>
    Hall Mark Balance
    <span
      style={{
        marginLeft: "1rem",
        color: hallmarkBalance < 0 ? "red" : "green",
        fontWeight: "bold",
      }}
    >
      {hallmarkBalance.toFixed(3)}
    </span>
  </p>
</div>

          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default ReceiptVoucher;