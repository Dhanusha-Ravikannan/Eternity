import React , {useState} from 'react';
import Navbar from '../Navbar/Navbar';
import { Button, TextField } from "@mui/material";
import Styles from './CastingMeltingReports.module.css';

const CastingMeltingReports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
  <> 
  <Navbar/>
  <div className={Styles.castingReport}>Casting / Melting Reports</div>

  <TextField
            id="from-date"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            sx={{mt:4, ml:6}}       
          />
          <TextField
            id="to-date"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}  
            sx={{ marginLeft: "1rem", mt:4 }}
          />
    </>
  )
}

export default CastingMeltingReports;