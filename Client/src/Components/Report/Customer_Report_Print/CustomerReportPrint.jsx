
import styles from '../CustomerReport.module.css';
const CustomerReportPrint=(props)=>{
   const { fromDate,toDate,customerName,billInfo,
    billReceive, billAmount,overAllBalance}=props
    return(
      <>
        <div>
          <h3 style={style.custHead}>Customer Report</h3>

          <div style={style.custReportPrintHead}> 
             <p>From Date: <strong>{fromDate}</strong></p>
             <p>To Date: <strong>{toDate}</strong></p>
             <p>customer Name: <strong>{customerName}</strong></p>
          </div>       
          <div >
          {billInfo.length >= 1 ? (
            <table  style={style.customerReportTable}>
              <thead >
                <tr>
                  <th style={style.customerReportBorder}>S.No</th>
                  <th style={style.customerReportBorder}>Bill No</th>
                  <th style={style.customerReportBorder}>Date</th>
                  <th style={style.customerReportBorder}>Bill & Receive</th>
                  <th style={style.customerReportBorder}>Receive Amount</th>
                  <th style={style.customerReportBorder}>Bill Amount</th>
                </tr>
              </thead>
              <tbody >
                {billInfo.map((bill, index) => (
                  <tr key={index + 1}>
                    <td style={style.customerReportBorder}>{index + 1}</td>
                    <td style={style.customerReportBorder}>{bill.type==="Bill"?bill.info.bill_no:"-"}</td>
                    <td style={style.customerReportBorder}>
                      {new Date(bill.info.createdAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>

                    <td style={style.customerReportBorder}>
                      {bill.type === "Bill" ? (
                        bill.info.billItems.length >= 1 ? (
                          <table style={style.customerReportTable}>
                            <thead >
                              <tr>
                                <th style={style.customerReportBorder}>Entry Type</th>
                                <th style={style.customerReportBorder}>Date</th>
                                <th style={style.customerReportBorder}>Item Name</th>
                                <th style={style.customerReportBorder}>Weight</th>
                                <th style={style.customerReportBorder}>StoneWt</th>
                                <th style={style.customerReportBorder}>Total Wt</th>
                                <th style={style.customerReportBorder}>Touch</th>
                                <th style={style.customerReportBorder}>Purity</th>
                              </tr>
                            </thead>
                            <tbody >
                              {bill.info.billItems.map((item, index) => (
                                <tr key={index + 1}>
                                  <td style={style.customerReportBorder}>{bill.type||""}</td>
                                  <td style={style.customerReportBorder}>{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
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
                        <table style={style.customerReportTable}>
                          <thead >
                            <tr>
                              <th style={style.customerReportBorder}>Entry Type</th>
                              <th style={style.customerReportBorder}>Date</th>
                              <th style={style.customerReportBorder}>Gold Rate</th>
                              <th style={style.customerReportBorder}>Gold</th>
                              <th style={style.customerReportBorder}>Touch</th>
                              <th style={style.customerReportBorder}>Purity</th>
                              <th style={style.customerReportBorder}>Amount</th>
                              <th style={style.customerReportBorder}>HallMark</th>
                            </tr>
                          </thead>
                          <tbody >
                            <tr key={index+1}>
                              <td style={style.customerReportBorder}>{bill.type||""}</td>
                              <td style={style.customerReportBorder}>{new Date( bill.info.createdAt).toLocaleDateString("en-GB")} </td>
                              <td style={style.customerReportBorder}>{bill.info.gold_rate || bill.info.goldRate || "-" }</td>
                              <td style={style.customerReportBorder}>{bill.info.gold || bill.info.value || "-" }</td>
                              <td style={style.customerReportBorder}>{bill.info.touchId?.touch || bill.info.touch?.touch || "-"}</td>
                              <td style={style.customerReportBorder}>{bill.info.purity_weight || bill.info.purity || "-"}</td>
                              <td style={style.customerReportBorder}>{bill.info.amount || "-"}</td>
                              <td style={style.customerReportBorder}>{bill.info.hallmark_charge || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </td>

                    {bill.type === "Bill" ? (
                      <>
                        <td style={style.customerReportBorder}>-</td>
                        <td style={style.customerReportBorder}>{bill.info.total_pure}</td>
                      </>
                    ) : (
                      <>
                        <td style={style.customerReportBorder}>{bill.info.purity_weight || bill.info.purity || "-"}</td>
                        <td style={style.customerReportBorder}>-</td>
                      </>
                    )}
                  </tr>
                ))}
               
                 <tr  >
                  <td colSpan={4} style={style.customerReportBorder}></td>

                  <td style={style.customerReportBorder}>
                    <strong>
                      Total Receive :{(billReceive).toFixed(3)} gr
                    </strong>{" "}
                  </td>
                  <td style={style.customerReportBorder}>
                    <strong> Total Bill :{(billAmount).toFixed(3)} gr</strong>
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
       

          <div style={style.custBal}>
             <p><strong>Excess Balance : {overAllBalance<0 ?(overAllBalance).toFixed(3):0.000} gr</strong></p>
             <p><strong>Balance: {overAllBalance>=0 ?(overAllBalance).toFixed(3):0.000} gr</strong></p>
          </div>
        </div>
      </>
    
  )
}
const style={
  custHead:{
    textAlign:"center",
    color:"red"
  },
  custReportPrintHead:{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center"
  },
  customerReportTable:{
    width:"100%",
    borderCollapse:"collapse",
    textAlign:"center",
  
  },
  customerReportBorder:{
    border:"1px solid black",
     padding:"8px"
  },
  custBal:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    gap:"30px"
  }

}
export default CustomerReportPrint
