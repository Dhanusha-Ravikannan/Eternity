import React, {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import styles from "./Billing.module.css";
import BillDetailsNo from "./BillDetailsNo";
import BillPrint from "./BillPrint";

const SavedBills = ({
  openBillsPopup,
  setOpenBillsPopup,
  bills,
  viewBill,
  setViewBill,
  printRef,
}) => {

  const [printData, setPrintData] = useState(null);

  const handlePrint = () => {
    const html = printRef.current.innerHTML;
    setPrintData(html);
  };

  return (
    <> 
    {printData && <BillPrint content={printData} />}
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
    </>
  );
};

export default SavedBills;
