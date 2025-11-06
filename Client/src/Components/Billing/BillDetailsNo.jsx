import React from "react";
import { Button } from "@mui/material";
import styles from "./Billing.module.css";
import { formatNumber } from "../../Utils/formatNumber";

const BillDetailsNo = ({ viewBill, setViewBill, printRef }) => {
  if (!viewBill) return null;

const total = viewBill.total_pure + viewBill.customer_balance;
const isNegative = total < 0;

  return (
    <div id="print-section" ref={printRef}>
      <div className="bill-header">
        <div className="bill-row">
          <span className="left">
            <b>Bill No:</b> {viewBill.bill_no}
          </span>
          <span className="right" style={{marginLeft:'26rem'}}>
            <b>Date:</b> {viewBill.date}
          </span>
        </div>
        <div className="bill-row">
          <span className="left">
            <b>Customer Name:</b> {viewBill.customer?.name}
          </span>
          <span className="right" style={{marginLeft:'20rem'}}>
            <b>Time:</b> {viewBill.time}
          </span>
        </div>
        <div className="bill-row">
          <span className="left">
            <b>Gold Rate:</b> {viewBill.gold_rate}
          </span>
        </div>
      </div>

{/* <div className={styles.billHeader}>
  <div className={styles.billRow}>
 
    <div className={styles.leftSection}>
      <div><b>Bill No:</b> {viewBill.bill_no}</div>
      <div><b>Customer Name:</b> {viewBill.customer?.name}</div>
      <div><b>Gold Rate:</b> {viewBill.gold_rate}</div>
    </div>


    <div className={styles.rightSection}>
      <div><b>Date:</b> {viewBill.date}</div>
      <div><b>Time:</b> {viewBill.time}</div>
    </div>
  </div>
</div> */}


      <div className={styles.billdetails}>Bill Details:</div>
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Weight</th>
              <th>Stone Weight</th>
              <th>Total Weight</th>
              <th style={{ width: "5rem" }}>%</th>
              <th>Pure</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {viewBill.billItems?.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.weight}</td>
                <td>{item.stone_weight}</td>
                <td>{item.total_weight}</td>
                <td>{item.touch?.touch ?? item.touchId ?? "-"}</td>
                <td>{item.pure}</td>
                <td>{item.amount}</td>
              </tr>
            ))}
          </tbody>

<tfoot>

  {viewBill.customer_balance >= 0 ? (
    <tr style={{ color: "red", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Balance</td>
      <td>{formatNumber(viewBill.customer_balance || 0)}</td>
      <td>
        {formatNumber(
          (parseFloat(viewBill.customer_balance || 0) *
            parseFloat(viewBill.gold_rate || 0)) || 0
        )}
      </td>
    </tr>
  ) : (
    <tr style={{ color: "green", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Excess Balance</td>
      <td>{formatNumber(viewBill.customer_balance || 0)}</td>
      <td>
        {formatNumber(
          (parseFloat(viewBill.customer_balance || 0) *
            parseFloat(viewBill.gold_rate || 0)) || 0
        )}
      </td>
    </tr>
  )}

  <tr>
    <td colSpan={5}>
      <b>Final Bill Total</b>
    </td>
    <td>{formatNumber(viewBill.total_pure || 0)}</td>
    <td>{formatNumber(viewBill.total_amount || 0)}</td>
  </tr>


  {(() => {
    const totalPure = parseFloat(viewBill.total_pure || 0);
    const totalAmount = parseFloat(viewBill.total_amount || 0);
    const custBal = parseFloat(viewBill.customer_balance || 0);
    const goldRate = parseFloat(viewBill.gold_rate || 0);

    const total = totalPure + custBal;
    const totalAmt = totalAmount + custBal * goldRate;

    const color =
      total > 0
        ? "red" // Customer owes Owner
        : total < 0
        ? "green" // Owner owes Customer
        : "inherit"; // Balanced

    return (
      <tr style={{ color, fontWeight: "bold" }}>
        <td colSpan={5} className={styles.trEven}>
          <b>
            Total
            {total !== 0 && (
              <span
                style={{
                  color,
                  marginLeft: "8px",
                  fontWeight: "bold",
                }}
              >
                ({total > 0
                  ? "Customer must give to Owner"
                  : "Owner must give to Customer"}
                )
              </span>
            )}
          </b>
        </td>

        <td className={styles.trEven}>
          {total === 0 ? "" : formatNumber(total)}
        </td>

        <td className={styles.trEven}>{formatNumber(totalAmt)}</td>
      </tr>
    );
  })()}
</tfoot>


        </table>
      </div>
      
      <div className={styles.bal}>
        <p>
          <b>Prev Hallmark Balance:</b> {viewBill.prev_hallmark}
        </p>
      </div>

      <div className={styles.billdetails}>Received Details:</div>
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
            {(viewBill.receivedItems || []).map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{row.date}</td>
                <td>{row.type}</td>
                <td>{row.goldRate || row.gold_rate || "-"}</td>
                <td>{row.gold || "-"}</td>
                <td>{row.touch?.touch ?? row.touchId ?? "-"}</td>
                <td>{row.purity_weight.toFixed(3) || "-"}</td>
                <td>{row.amount || "-"}</td>
                <td>{row.hallmark_charge || "-"}</td>
              </tr>
            ))}
          </tbody>
   
<tfoot className={styles.trEven}>
  <tr>
    <td colSpan={6}>
      <b>Total Purity</b>
    </td>
    <td>
      <b>
        {formatNumber(
          viewBill.receivedItems?.reduce(
            (sum, row) => sum + (Number(row.purity_weight) || 0),
            0
          ) ?? 0
        )}
      </b>
    </td>
    <td colSpan={2}></td>
  </tr>
</tfoot> 

        </table>
      </div>


<div className="balance-line" style={{ marginTop: "1rem" }}>
  <span>
    <b>Cash Balance:</b> ₹
    {formatNumber(viewBill.cash_balance)}
  </span>

  <span style={{ color: "green", marginLeft: "2rem" }}>
    <b>Pure Balance:</b> {formatNumber(
      viewBill.pure_balance >= 0 ? viewBill.pure_balance : 0
    )}
  </span>

  <span style={{ color: "red", marginLeft: "2rem" }}>
    <b>Excess Pure:</b> {formatNumber(
      viewBill.pure_balance < 0 ? viewBill.pure_balance : 0
    )}
  </span>

  <span style={{ marginLeft: "2rem" }}>
    <b>Hallmark Balance:</b> {formatNumber(viewBill.hallmark_balance)}
  </span>
</div>

      <Button
        variant="outlined"
        style={{ marginTop: "2rem",}}
        onClick={() => setViewBill(null)}
      >
        Back to Bills
      </Button>
    </div>
  );
};

export default BillDetailsNo;
