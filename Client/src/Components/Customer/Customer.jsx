import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PreviewIcon from "@mui/icons-material/Preview";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "./Customer.module.css";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/customers`);
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const nameMatch =
      customer.name &&
      customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch =
      customer.phoneNumber && customer.phoneNumber.includes(searchTerm);
    const addressMatch =
      customer.address &&
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());

    return nameMatch || phoneMatch || addressMatch;
  });

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Paper
          className={styles.customerTableContainer}
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Customer Details
          </Typography>

          <TextField
            label="Search Customer"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                width: "22rem",
                backgroundColor: "#f8f9fa",
                "&.Mui-focused": {
                  backgroundColor: "#ffffff",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#777" }} />
                </InputAdornment>
              ),
            }}
          />

          {filteredCustomers.length > 0 ? (
            <TableContainer>
              <Table className={styles.table}>
              <TableHead>
  <TableRow>
    <TableCell className={styles.tablehead}>S.No</TableCell>
    <TableCell className={styles.tablehead}>Date</TableCell>
    <TableCell className={styles.tablehead}>Time</TableCell>
    <TableCell className={styles.tablehead}>Customer Name</TableCell>
    <TableCell className={styles.tablehead}>Phone Number</TableCell>
    <TableCell className={styles.tablehead}>Address</TableCell>
    <TableCell className={styles.tablehead}>Balance</TableCell>
    <TableCell className={styles.tablehead}>Actions</TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {filteredCustomers.map((customer, index) => {
    const updatedAt = new Date(customer.updatedAt);
    const dateString = updatedAt.toLocaleDateString();
    const timeString = updatedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TableRow
        key={index}
        className={index % 2 === 0 ? styles.trEven : ""}
      >
        <TableCell className={styles.tableCell}>{index + 1}</TableCell>
        <TableCell className={styles.tableCell}>{dateString}</TableCell>
        <TableCell className={styles.tableCell}>{timeString}</TableCell>
        <TableCell className={styles.tableCell}>{customer.name}</TableCell>
        <TableCell className={styles.tableCell}>{customer.phoneNumber}</TableCell>
        <TableCell className={styles.tableCell}>{customer.address}</TableCell>
        <TableCell className={styles.tableCell}>
          {/* {(( customer.balance) ?? 0).toFixed(3)} */}
        {((customer.openingBalance ?? customer.balance) ?? 0).toFixed(3)}
        </TableCell>
      
        <TableCell className={styles.tableCell}>
          <IconButton
            onClick={() =>
              navigate(
                `/customertranscation?id=${customer.id}&name=${encodeURIComponent( customer.name
                )}&balance=${((customer.openingBalance ?? customer.balance) ?? 0).toFixed(3)}`
                //  {(( customer.balance) ?? 0).toFixed(3)}`
              )            
            }
            className={styles.iconButton}
          >
            <PreviewIcon color="primary" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" align="center">
              No customer details available.
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Customer;
