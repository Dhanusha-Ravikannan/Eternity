import { useEffect, useState, useRef } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import styles from './CustomerReport.module.css'
import {Dialog, 
  DialogActions,
  Autocomplete,
  Button,
  TextField,
  TablePagination,
  IconButton,
} from "@mui/material";
import { BACKEND_SERVER_URL } from "../../../Config/config"
import axios from "axios";
import CustomerReportPrint from "./Customer_Report_Print/CustomerReportPrint";
import ReactDOMServer from "react-dom/server";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BillDetailsNo from "../Billing/BillDetailsNo";


const CustomerReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [billInfo, setBillInfo] = useState([]);
  const [overAllBalance, setOverAllBalance] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [viewBill, setViewBill] = useState(null);

  
  const paginatedData =billInfo.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePrint =  () => {
   const printContent = (
      < CustomerReportPrint
        fromDate={fromDate ? fromDate.format("DD/MM/YYYY") : ""}
        toDate={toDate ? toDate.format("DD/MM/YYYY") : ""}
        customerName={selectedCustomer?.name || ""}
        billInfo={paginatedData}
        billReceive={currentPageTotal.billReceive}
        billAmount={currentPageTotal.billAmount}
        overAllBalance={overAllBalance}
      />
    );

    const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Customer Report Print</title>
       
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

  const currentPageTotal = paginatedData.reduce(
    (acc, bill) => {
      if (bill.type === "Bill") {
        acc.billAmount += Number(bill.info.total_pure || 0);
      } else {
        acc.billReceive += Number(bill.info.purity_weight || 0);
      }
      return acc;
    },
    { billReceive: 0, billAmount: 0 }
  );
  


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateClear = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedCustomer({});
    setBillInfo([])

  };

  const handleCustomer = (newValue) => {
    if (!newValue || newValue === null) {
      return;
    }
    setSelectedCustomer(newValue);
    console.log(newValue);

    const fetchBillInfo = async () => {
      try {
        const from = fromDate ? fromDate.format("YYYY-MM-DD") : "";
        const to = toDate ? toDate.format("YYYY-MM-DD") : "";
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/customers/customerReportt/${newValue.id}`,
          { params: { fromDate: from, toDate: to } }
        );
        console.log("data", response.data.data);
        setBillInfo(response.data.data);
        setOverAllBalance(response.data.overallBalance);
        console.log("overall balance", response.data.overallBalance)
      } catch (error) {
        console.error("Error fetching goldsmith data:", error);
      }
    };
    fetchBillInfo();
  };



  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/customers`);
        const data = await response.json();
        console.log("customer data", data);
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching goldsmith data:", error);
      }
    };
    fetchCustomer();
    const today = dayjs();
    setFromDate(today);
    setToDate(today);
  }, []);

  return (
    <>
         <Navbar/>
         <h5 className={styles.heading}>Customer Report Details</h5>
      <div> 

<div className={styles.customerReportHeader}>
  <div className={styles.reportHorizontal}>
    {/* From Date */}
    <div className={styles.reportField}>
      <label>From Date</label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            value={fromDate}
            format="DD/MM/YYYY"
            onChange={(newValue) => setFromDate(newValue)}
          />
        </DemoContainer>
      </LocalizationProvider>
    </div>

    {/* To Date */}
    <div className={styles.reportField}>
      <label>To Date</label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            value={toDate}
            format="DD/MM/YYYY"
            onChange={(newValue) => setToDate(newValue)}
          />
        </DemoContainer>
      </LocalizationProvider>
    </div>

    {/* Customer Dropdown */}
    <div className={styles.reportField}>
      <Autocomplete
        disablePortal
        options={customers}
        getOptionLabel={(option) => option.name || ""}
        sx={{ width: 250 }}
        value={selectedCustomer}
        onChange={(event, newValue) => handleCustomer(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Customer" />
        )}
      />
    </div>

    {/* Buttons */}
    <div className={styles.reportButtons}>
      <Button
        id="clear"
        onClick={handleDateClear}
        className={styles.customerReportBtn}
      >
        Clear
      </Button>

      <Button
        id="print"
        onClick={handlePrint}
        className={styles.customerReportBtn}
      >
        Print
      </Button>
    </div>
  </div>
</div>

        <div className={styles.customerReportContainer}>
          {paginatedData.length >= 1 ? (
            <table  className={styles.customerReportTable}>
              <thead id={styles.customerReportHead}>
                <tr>
                  <th>S.No</th>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Bill&Receive</th>
                  <th>View bill</th>
                  <th>Received Amount</th>
                  <th>Bill Amount</th>
                </tr>
              </thead>
              <tbody className={styles.customerReportTbody}>
                {paginatedData.map((bill, index) => (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{bill.type==="Bill"?bill.info.bill_no:"-"}</td>
                    <td>
                      {new Date(bill.info.createdAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>

                    <td>                  
{bill.type === "Bill" ? (
  bill.info.billItems?.length >= 1 ? (
    <table className={styles.orderTable}>
      <thead className={styles.orderTableTr}>
        <tr>
          <th>Entry Type</th>
          <th>Date</th>
          <th>Item Name</th>
          <th>Weight</th>
          <th>Stone Wt</th>
          <th>Total Wt</th>
          <th>Touch</th>
          <th>Purity</th>
        </tr>
      </thead>
      <tbody className={styles.orderTableTbody}>
        {bill.info.billItems.map((item, index) => (
          <tr key={index + 1}>
            <td>{bill.type}</td>
            <td>{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
            <td>{item.item_name}</td>
            <td>{item.weight}</td>
            <td>{item.stone_weight}</td>
            <td>{item.total_weight}</td>
            <td>{item.touchId || "-"}</td>
            <td>{item.pure}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No items in this bill</p>
  )
                      ) : (
                        <table className={styles.receiveTable}>
                          <thead className={styles.receiveTableTr}>
                            <tr>
                              <th>Entry Type</th>
                              <th>Date</th>
                              <th>goldRate</th>
                              <th>gold</th>
                              <th>Touch</th>
                              <th>purity</th>
                              <th>amount</th>
                              <th>hallMark</th>
                            </tr>
                          </thead>
                          <tbody className={styles.receiveTableBody}>
                            <tr key={index+1}>
                              <td>{bill.type||""}</td>
                              <td>
                                {new Date(
                                  bill.info.createdAt
                                ).toLocaleDateString("en-GB")}
                              </td>
                              <td>{bill.info.gold_rate || bill.info.goldRate || "-" }</td>
                              <td>{bill.info.gold || bill.info.value || "-" }</td>
                              <td>{bill.info.touchId?.touch || bill.info.touch?.touch || "-"}</td>
                              <td>{bill.info.purity_weight || bill.info.purity || "-"}</td>
                              <td>{bill.info.amount || "-"}</td>
                              <td>{bill.info.hallmark_charge || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </td>
                    <td>
                      {bill.type === "Bill" ? (
                      <IconButton
  color="primary"
  onClick={() => setViewBill(bill.info)} 
>
  <VisibilityIcon />
</IconButton>):(<p>-</p>)
                      }
                    </td>
                    {bill.type === "Bill" ? (
                      <>
                        <td>-</td>
                        <td>{bill.info.total_pure ||"-"}</td>
                      </>
                    ) : (
                      <>
                        <td>{bill.info.purity_weight || bill.info.purity || "-"}</td>
                        <td>-</td>
                      </>
                    )}
                  </tr>
                ))}
               
                 <tr   className={styles.custRepTfoot} >
                  <td colSpan={5}></td>

                  <td className={styles.customerTotal}>
                    <strong>
                      Total bill Received :{(currentPageTotal.billReceive).toFixed(3)} gr
                    </strong>
                  </td>
                  <td className={styles.customerTotal}>
                    <strong> Total bill Amount:{(currentPageTotal.billAmount).toFixed(3)} gr</strong>
                  </td>
                </tr>
               
              </tbody>
            </table>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "red",
                fontSize: "20px",
                marginTop: "10px",
              }}
            >
              No Bills and Receive Information
            </p>
          )}

        </div>
         <TablePagination
               
                component="div"
                count={billInfo.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
      </div>
        <div className={styles.overAllBalance}>
    <div className={styles.balanceCard}> 
           <div className={styles.balancenegative }>
                 Excess Balance: {overAllBalance<0 ?(overAllBalance).toFixed(3):0.000} gr
           </div>

           <div className={styles.balancepositive}>
    
               Balance : {overAllBalance>=0 ?(overAllBalance).toFixed(3):0.000} gr
           </div>
           </div>
          </div> 


          <Dialog
  open={!!viewBill}
  onClose={() => setViewBill(null)}
  maxWidth="md"
  fullWidth
>
<div style={{ padding: "1.3rem" }}> 
  <center>
    <h4 style={{ padding: "0.5rem" }}>Bill Details</h4>
  </center>

  {viewBill && (
    <BillDetailsNo
      viewBill={viewBill}
      setViewBill={setViewBill}
    />
  )}

  {/* <DialogActions>
    <Button variant="outlined" onClick={() => setViewBill(null)}>
      Close
    </Button>
  </DialogActions> */}
  </div>
</Dialog>
   
    </>
  );
};

export default CustomerReport;