import React from 'react';
import Navbar from '../Navbar/Navbar';
import Styles from './Report.module.css';
import { Button } from "@mui/material";

const Report = () => {
  return (
    <> 
    < Navbar />
    <div className={Styles.report}>  
    <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            variant="contained"
          >
            Customer Report
          </Button>
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            variant="contained"
          >
            Stock Report
          </Button>
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            variant="contained"
          >
            Sales Report
          </Button>
          <Button
            style={{
              backgroundColor: "#F5F5F5",
              color: "black",
              borderColor: "#25274D",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            variant="contained"
          >
            Receipt Report
          </Button>
          </div>
    </>
  )
}

export default Report