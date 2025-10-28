import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import styles from "./Billing.module.css";
import BillDetailsNo from "./BillDetailsNo";

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
                .bill-header {
                  width: 100%;
                  margin-bottom: 6px;
                  font-size: 8pt;
                  line-height: 1.3;
                }
                
                .bill-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 2px;
                }
                
                .bill-row .left {
                  text-align: left;
                  flex: 1;
                }
                
                .bill-row .right {
                  text-align: right;
                  flex: 1;
                }
                
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
<BillDetailsNo
    viewBill={viewBill}
    setViewBill={setViewBill}
    printRef={printRef}
  /> 
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
