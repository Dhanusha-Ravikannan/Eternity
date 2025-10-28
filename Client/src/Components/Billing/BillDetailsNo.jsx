import React from "react";
import { Button } from "@mui/material";
import styles from "./Billing.module.css";

const BillDetailsNo = ({ viewBill, setViewBill, printRef }) => {
  if (!viewBill) return null;

const total = viewBill.total_pure + viewBill.customer_balance;
const isNegative = total < 0;

  return (
    <div id="print-section" ref={printRef}>
      {/* ====== Bill Header ====== */}
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

      {/* ====== Bill Details ====== */}
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
    <tr style={{ color: "green", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Balance</td>
      <td>{parseFloat(viewBill.customer_balance || 0).toFixed(3)}</td>
      <td>
        {(
          parseFloat(viewBill.customer_balance || 0) *
          parseFloat(viewBill.gold_rate || 0)
        ).toFixed(2)}
      </td>
    </tr>
  ) : (
    <tr style={{ color: "red", fontWeight: "bold" }}>
      <td colSpan={5}>Customer Excess Balance</td>
      <td>{parseFloat(viewBill.customer_balance || 0).toFixed(3)}</td>
      <td>
        {(
          parseFloat(viewBill.customer_balance || 0) *
          parseFloat(viewBill.gold_rate || 0)
        ).toFixed(2)}
      </td>
    </tr>
  )}

  <tr>
    <td colSpan={5}>
      <b>Final Bill Total</b>
    </td>
    <td>{parseFloat(viewBill.total_pure || 0).toFixed(3)}</td>
    <td>{parseFloat(viewBill.total_amount || 0).toFixed(2)}</td>
  </tr>

  <tr>
    <td colSpan={5} className={styles.trEven}>
      <b>
        Total{" "}
        {(() => {
          const total =
            parseFloat(viewBill.total_pure || 0) +
            parseFloat(viewBill.customer_balance || 0);

          if (total === 0) return "";
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
          parseFloat(viewBill.total_pure || 0) +
            parseFloat(viewBill.customer_balance || 0) >
          0
            ? "green"
            : parseFloat(viewBill.total_pure || 0) +
                parseFloat(viewBill.customer_balance || 0) <
              0
            ? "red"
            : "inherit",
        fontWeight: "bold",
      }}
    >
      {(() => {
        const total =
          parseFloat(viewBill.total_pure || 0) +
          parseFloat(viewBill.customer_balance || 0);
        return total === 0 ? "" : total.toFixed(3);
      })()}
    </td>

    <td
      colSpan={1}
      className={styles.trEven}
      style={{
        color:
          parseFloat(viewBill.total_amount || 0) +
            parseFloat(viewBill.customer_balance || 0) *
              parseFloat(viewBill.gold_rate || 0) >=
          0
            ? "green"
            : "red",
        fontWeight: "bold",
      }}
    >
      {(
        parseFloat(viewBill.total_amount || 0) +
        parseFloat(viewBill.customer_balance || 0) *
          parseFloat(viewBill.gold_rate || 0)
      ).toFixed(2)}
    </td>
  </tr>
</tfoot>
        </table>
      </div>
      
      {/* ====== Previous Hallmark Balance ====== */}
      <div className={styles.bal}>
        <p>
          <b>Prev Hallmark Balance:</b> {viewBill.prev_hallmark}
        </p>
      </div>

      {/* ====== Received Details ====== */}
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
                  {(
                    viewBill.receivedItems?.reduce(
                      (sum, row) => sum + (Number(row.purity_weight) || 0),
                      0
                    ) ?? 0
                  ).toFixed(3)}
                </b>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

<div className="balance-line" style={{marginTop:'1rem'}}>
  <span>
    <b>Cash Balance:</b> ₹
    {viewBill.cash_balance
      ? parseFloat(viewBill.cash_balance).toFixed(2)
      : 0}
  </span>

  <span style={{ color: "green", marginLeft:'4rem' }}>
    <b>Pure Balance:</b>
    {viewBill.pure_balance >= 0
      ? viewBill.pure_balance.toFixed(3)
      : "0.000"}
  </span>

  <span style={{ color: "red", marginLeft:'4rem' }}>
    <b>Excess Pure:</b>
    {viewBill.pure_balance < 0
      ? viewBill.pure_balance.toFixed(3)
      : "0.000"}
  </span>

  <span style={{  marginLeft:'4rem' }}>
    <b>Hallmark Balance:</b> {viewBill.hallmark_balance}
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
