import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,IconButton,TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PreviewIcon from "@mui/icons-material/Preview";
import Navbar from "../../Navbar/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import styles from "./Buffing.module.css";

const Buffing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [buffingData, setBuffingData] = useState([]);

  useEffect(() => {
    const fetchBuffingData = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/buffing`);
        setBuffingData(response.data);
        console.log("Available buffing Members:", response.data)
      } catch (error) {
        console.error("Error fetching filing data:", error);
      }
    };
    fetchBuffingData();
  }, []);
  
  const filteredData = buffingData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Paper className="customer-table-container" elevation={3} sx={{ p: 3, mt:4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Buffing Details
          </Typography>

          <TextField
            label="Search Filing Member"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                width: "20rem",
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
          <TableContainer>
            <Table>
                  <TableHead>
                <TableRow>
                  <TableCell className={styles.tablehead}>
                  S.No
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                Date 
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                  Time 
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                  Buffing Member Name
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                    Phone Number
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                   Address
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                   Opening Balance
                  </TableCell>
                  <TableCell className={styles.tablehead}>
                  Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              
<TableBody>
  {filteredData.length > 0 ? (
    filteredData.map((row, index) => (
      <TableRow key={row.id} className={index % 2 === 0 ? styles.trEven : ""}>
        <TableCell className={styles.tableCell}>{index + 1}</TableCell>
        <TableCell className={styles.tableCell}>
          {new Date(row.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className={styles.tableCell}>
          {new Date(row.createdAt).toLocaleTimeString()}
        </TableCell>
        <TableCell className={styles.tableCell}>{row.name}</TableCell>
        <TableCell className={styles.tableCell}>{row.phoneNumber || "-"}</TableCell>
        <TableCell className={styles.tableCell}>{row.address || "-"}</TableCell>
        <TableCell className={styles.tableCell}>{row.balance || "-"}</TableCell>
        <TableCell className={styles.tableCell}>

          <Link to={`/buffinglot/${row.id}/${encodeURIComponent(row.name)}/${row.lotInfo?.[0]?.lotNumber || 0}`}>
  <IconButton>
    <PreviewIcon color="primary" />
  </IconButton>
</Link>
        </TableCell>       
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} align="center">
        No records found.
      </TableCell>
    </TableRow>
  )}
</TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
};

export default Buffing;