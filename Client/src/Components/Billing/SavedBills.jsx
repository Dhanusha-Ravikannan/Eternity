// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
// } from "@mui/material";
// import styles from "./Billing.module.css";

// const SavedBills = ({
//   openBillsPopup,
//   setOpenBillsPopup,
//   bills,
//   viewBill,
//   setViewBill,
//   printRef,
// }) => {
//   return (
//     <Dialog
//       open={openBillsPopup}
//       onClose={() => setOpenBillsPopup(false)}
//       maxWidth="md"
//       fullWidth
//     >
//       <br />
//       <div id="print-section" ref={printRef}>
//         <h4>
//           <center>Saved Bill Details</center>
//         </h4>

//         <DialogContent>
//           {/* ====== Bill List View ====== */}
//           {!viewBill ? (
//             <div className={styles.table}>
//               <div style={{ marginLeft: "1rem" }}>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th style={{ width: "5rem" }}>S.No</th>
//                       <th style={{ width: "10rem" }}>Bill No</th>
//                       <th style={{ width: "12rem" }}>Customer Name</th>
//                       <th style={{ width: "10rem" }}>Date</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bills.map((bill, idx) => (
//                       <tr key={bill.id}>
//                         <td>{idx + 1}</td>
//                         <td>{bill.bill_no || idx + 1}</td>
//                         <td>{bill.customer?.name || "-"}</td>
//                         <td>{bill.date}</td>
//                         <td>
//                           <Button
//                             size="small"
//                             variant="outlined"
//                             onClick={() => setViewBill(bill)}
//                           >
//                             View Bill
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* ====== Single Bill View ====== */}
//               <div className={styles.bill}>
//                 <div className={styles.leftSection}>
//                   <Typography>
//                     <b>Bill No:</b> {viewBill.bill_no}
//                   </Typography>
//                   <Typography>
//                     <b>Customer Name:</b> {viewBill.customer?.name}
//                   </Typography>
//                   <Typography>
//                     <b>Gold Rate:</b> {viewBill.gold_rate}
//                   </Typography>
//                 </div>

//                 <div className={styles.rightSection}>
//                   <Typography>
//                     <b>Date:</b> {viewBill.date}
//                   </Typography>
//                   <Typography>
//                     <b>Time:</b> {viewBill.time}
//                   </Typography>
//                 </div>
//               </div>

//               <div className={styles.billdetails}>Bill Details:</div>
//               <div className={styles.table}>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Item Name</th>
//                       <th>Weight</th>
//                       <th>Stone Weight</th>
//                       <th>Total Weight</th>
//                       <th style={{ width: "5rem" }}>%</th>
//                       <th>Pure</th>
//                       <th>Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {viewBill.billItems.map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.item_name}</td>
//                         <td>{item.weight}</td>
//                         <td>{item.stone_weight}</td>
//                         <td>{item.total_weight}</td>
//                         <td>{item.touch?.touch ?? item.touchId ?? "-"}</td>
//                         <td>{item.pure}</td>
//                         <td>{item.amount}</td>
//                       </tr>
//                     ))}
//                   </tbody>

//                   {/* ====== Footer Totals ====== */}
//                   <tfoot>
//                     <tr>
//                       <td colSpan={5}>
//                         <b>Excess Balance</b>
//                       </td>
//                       <td>{(viewBill.customer_balance).toFixed(3)}</td>
//                       <td>
//                         {(viewBill.customer_balance * viewBill.gold_rate).toFixed(3)}
//                       </td>
//                     </tr>

//                     <tr>
//                       <td colSpan={5}>
//                         <b>Final Bill Total</b>
//                       </td>
//                       <td>{viewBill.total_pure}</td>
//                       <td>{viewBill.total_amount}</td>
//                     </tr>

//                     <tr>
//                       <td colSpan={5} className={styles.trEven}>
//                         <b>Total</b>
//                       </td>
//                       <td className={styles.trEven}>
//                         {(viewBill.total_pure + viewBill.customer_balance).toFixed(3)}
//                       </td>
//                       <td className={styles.trEven}>
//                         {(
//                           viewBill.total_amount +
//                           viewBill.customer_balance * viewBill.gold_rate
//                         ).toFixed(2)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>

//               <div className={styles.bal}>
//                 <p>
//                   <b>Prev Hallmark Balance:</b> {viewBill.prev_hallmark}
//                 </p>
//               </div>

//               <div className={styles.billdetails}>Received Details:</div>
//               <div className={styles.table}>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>S.No</th>
//                       <th>Date</th>
//                       <th>Type</th>
//                       <th>Gold Rate</th>
//                       <th>Gold WT</th>
//                       <th>Touch</th>
//                       <th>Purity Weight</th>
//                       <th>Amount</th>
//                       <th>Hallmark Charge</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(viewBill.receivedItems || []).map((row, idx) => (
//                       <tr key={idx}>
//                         <td>{idx + 1}</td>
//                         <td>{row.date}</td>
//                         <td>{row.type}</td>
//                         <td>{row.goldRate || row.gold_rate || "-"}</td>
//                         <td>{row.gold || "-"}</td>
//                         <td>{row.touch?.touch ?? row.touchId ?? "-"}</td>
//                         <td>{row.purity_weight.toFixed(3) || "-"}</td>
//                         <td>{row.amount || "-"}</td>
//                         <td>{row.hallmark_charge || "-"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className={styles.trEven}>
//                     <tr>
//                       <td colSpan={6}>
//                         <b>Total Purity</b>
//                       </td>
//                       <td>
//                         <b>
//                           {(
//                             viewBill.receivedItems?.reduce(
//                               (sum, row) => sum + (Number(row.purity_weight) || 0),
//                               0
//                             ) ?? 0
//                           ).toFixed(3)}
//                         </b>
//                       </td>
//                       <td colSpan={2}></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>

            //   <div className={styles.balance} style={{ marginTop: "2rem" }}>
            //     <p>
            //       <b>Cash Balance:</b> ₹{viewBill.cash_balance}
            //     </p>

            //     {viewBill.pure_balance >= 0 ? (
            //       <>
            //         <p>
            //           <b>Pure Balance:</b> {viewBill.pure_balance.toFixed(3)}
            //         </p>
            //         <p>
            //           <b>Excess Pure:</b> 0.000
            //         </p>
            //       </>
            //     ) : (
            //       <>
            //         <p>
            //           <b>Pure Balance:</b> 0.000
            //         </p>
            //         <p>
            //           <b>Excess Pure:</b> {viewBill.pure_balance.toFixed(3)}
            //         </p>
            //       </>
            //     )}

            //     <p>
            //       <b>Hallmark Balance:</b> {viewBill.hallmark_balance}
            //     </p>
            //   </div>

//               <Button
//                 variant="outlined"
//                 style={{ marginTop: "1rem" }}
//                 onClick={() => setViewBill(null)}
//               >
//                 Back to Bills
//               </Button>
//             </>
//           )}
//         </DialogContent>
//       </div>

//       <DialogActions>
//         <Button variant="outlined" onClick={() => setOpenBillsPopup(false)}>
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default SavedBills;




import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import styles from "./Billing.module.css";

const SavedBills = ({
  openBillsPopup,
  setOpenBillsPopup,
  bills,
  viewBill,
  setViewBill,
  printRef,
}) => {


    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Saved Bill</title>
              <style>
                @page { size: A6; margin: 5mm; }
                body { font-family: Arial, sans-serif; font-size: 8pt; line-height: 1.1; padding: 2mm; color: #000; }
                h4 { text-align: center; margin: 0 0 5px 0; font-size: 10pt; }
                
                /* Bill Header: left + right sections */
                .bill { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .bill div { display: flex; flex-direction: column; font-size: 8pt; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 8pt; }
                th, td { border: 1px solid #555; padding: 2px 4px; text-align: center; }
                th { background: #f0f0f0; }
                tfoot td { font-weight: bold; }
      
                /* Section headings */
                .billdetails, .balance, .bal { font-size: 7pt; margin-top: 4px; }
      
                /* Balance line: all values in same row */
                .balance-line { display: flex; justify-content: space-between; font-size: 7pt; margin-top: 1rem; }
      
                @media print { button { display: none; } }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    
  

  return (
    <Dialog
      open={openBillsPopup}
      onClose={() => setOpenBillsPopup(false)}
      maxWidth="md"
      fullWidth
    >
      <br />
      <div id="print-section" ref={printRef}>
        <h4>
          <center>Saved Bill Details</center>
        </h4>

        <DialogContent>
          {/* ====== Bill List View ====== */}
          {!viewBill ? (
            <div className={styles.table}>
              <div style={{ marginLeft: "1rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "5rem" }}>S.No</th>
                      <th style={{ width: "10rem" }}>Bill No</th>
                      <th style={{ width: "12rem" }}>Customer Name</th>
                      <th style={{ width: "10rem" }}>Date</th>
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
                            View Bill
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* ====== Single Bill View ====== */}
<div className={styles.bill}>
  <div className={styles.leftSection}>
    <Typography><b>Bill No:</b> {viewBill.bill_no}</Typography>
    <Typography><b>Customer Name:</b> {viewBill.customer?.name}</Typography>
    <Typography><b>Gold Rate:</b> {viewBill.gold_rate}</Typography>
  </div>
  <div className={styles.rightSection}>
    <Typography><b>Date:</b> {viewBill.date}</Typography>
    <Typography><b>Time:</b> {viewBill.time}</Typography>
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
                      <th style={{ width: "5rem" }}>%</th>
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
                        <td>{item.touch?.touch ?? item.touchId ?? "-"}</td>
                        <td>{item.pure}</td>
                        <td>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan={5}>
                        <b>Excess Balance</b>
                      </td>
                      <td>{viewBill.customer_balance.toFixed(3)}</td>
                      <td>
                        {(viewBill.customer_balance * viewBill.gold_rate).toFixed(3)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5}>
                        <b>Final Bill Total</b>
                      </td>
                      <td>{viewBill.total_pure}</td>
                      <td>{viewBill.total_amount}</td>
                    </tr>
                    <tr className={styles.trEven}>
                      <td colSpan={5}>
                        <b>Total</b>
                      </td>
                      <td>
                        {(viewBill.total_pure + viewBill.customer_balance).toFixed(3)}
                      </td>
                      <td>
                        {(
                          viewBill.total_amount +
                          viewBill.customer_balance * viewBill.gold_rate
                        ).toFixed(2)}
                      </td>
                    </tr>
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

              
              {/* <div className={styles.balance} style={{ marginTop: "2rem" }}>
                <p>
                  <b>Cash Balance:</b> ₹{viewBill.cash_balance}
                </p>

                {viewBill.pure_balance >= 0 ? (
                  <>
                    <p>
                      <b>Pure Balance:</b> {viewBill.pure_balance.toFixed(3)}
                    </p>
                    <p>
                      <b>Excess Pure:</b> 0.000
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <b>Pure Balance:</b> 0.000
                    </p>
                    <p>
                      <b>Excess Pure:</b> {viewBill.pure_balance.toFixed(3)}
                    </p>
                  </>
                )}

                <p>
                  <b>Hallmark Balance:</b> {viewBill.hallmark_balance}
                </p>
              </div> */}

 <div className="balance-line">
  <span><b>Cash Balance:</b> ₹{viewBill.cash_balance}</span>
  <span>
    <b>Pure Balance:</b> {viewBill.pure_balance >= 0 
      ? viewBill.pure_balance.toFixed(3) 
      : '0.000'}
  </span>
  <span>
    <b>Excess Pure:</b> {viewBill.pure_balance < 0 
      ? viewBill.pure_balance.toFixed(3) 
      : '0.000'}
  </span>
  <span><b>Hallmark Balance:</b> {viewBill.hallmark_balance}</span>
</div> 



              <Button
                variant="outlined"
                style={{ marginTop: "1rem" }}
                onClick={() => setViewBill(null)}
              >
                Back to Bills
              </Button>
            </>
          )}
        </DialogContent>
      </div>

      <DialogActions>
        {viewBill && (
          <Button variant="contained" color="primary" onClick={handlePrint}>
            Print
          </Button>
        )}
        <Button variant="outlined" onClick={() => setOpenBillsPopup(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavedBills;
