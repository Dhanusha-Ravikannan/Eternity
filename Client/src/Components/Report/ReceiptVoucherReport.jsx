import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./ReceiptVoucherReport.module.css"; 
import { Button } from "@mui/material";


const ReceiptVoucherReport = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BACKEND_SERVER_URL}/api/receiptvoucher`
        );
        if (res.data && res.data.receipts) {
          setReceipts(res.data.receipts);
        }
      } catch (error) {
        console.error("Error fetching receipt vouchers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const handlePrintReport = () => {
    const printContent = document.getElementById("receiptReport").innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt Voucher Report</title>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <Navbar />
      <div className={styles.receiptTitle}>
        <h4>Receipt Voucher Report</h4>
      </div>

      <Button
        variant="contained"
        style={{ marginBottom: "1rem", marginLeft:'2rem' }}
        onClick={handlePrintReport}
        disabled={receipts.length === 0}
      >
        Print Report
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div id="receiptReport" className={styles.tableWrapper}>

          <table className={styles.receiptTable}>
            <thead className={styles.receipthead}>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Gold Rate</th>
                <th>Gold</th>
                <th>Touch</th>
                <th>Purity</th>
                <th>Amount</th>
                <th>Opening Balance</th>
                <th>Hallmark Balance</th>
              </tr>
            </thead>
            <tbody className={styles.receiptbody}>
              {receipts.map((r, index) => (
                <tr key={r.id}>
                  <td>{index + 1}</td>
                  <td>{r.date}</td>
                  <td>{r.customerId?.name || "-"}</td>
                  <td>{r.type}</td>
                  <td>{r.gold_rate}</td>
                  <td>{r.gold}</td>
                  <td>{r.touchId?.touch || "-"}</td>
                  <td>{r.purity}</td>
                  <td>{r.amount}</td>
                  <td>{r.customerId?.openingBalance?.toFixed(3) ?? "0.000"}</td>
                  <td>{r.hallMarkBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

      )}
    </>
  );
};

export default ReceiptVoucherReport;
