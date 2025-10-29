import React, { useState, useEffect } from "react";
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
import Navbar from "../../Navbar/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../../../Config/config";
import styles from "./Setting.module.css";

const Setting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [settingData, setSettingData] = useState([]);

  useEffect(() => {
    const fetchSettingData = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/setting`);
        setSettingData(response.data);
        console.log("Available setting Members:", response.data)
      } catch (error) {
        console.error("Error fetching setting data:", error);
      }
    };
  
    fetchSettingData();
  }, []);
  
  const filteredData = settingData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 3, mt:4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Setting Details
          </Typography>

          <TextField
            label="Search Setting Member"
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
                  Setting Member Name
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
    filteredData.map((row, index) => {
      const createdAt = new Date(row.createdAt);
      const dateString = createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeString = createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <TableRow key={row.id} className={index % 2 === 0 ? styles.trEven : ""}>
          <TableCell className={styles.tableCell}>{index + 1}</TableCell>
          <TableCell className={styles.tableCell}>{dateString}</TableCell>
          <TableCell className={styles.tableCell}>{timeString}</TableCell>
          <TableCell className={styles.tableCell}>{row.name}</TableCell>
          <TableCell className={styles.tableCell}>{row.phoneNumber || "-"}</TableCell>
          <TableCell className={styles.tableCell}>{row.address || "-"}</TableCell>
          <TableCell className={styles.tableCell}>{row.balance || "-"}</TableCell>

          <TableCell className={styles.tableCell}>
            <Link
              to={`/settinglot/${row.id}/${encodeURIComponent(row.name)}/${row.lotInfo?.[0]?.lotNumber || 0}`}
            >
              <IconButton>
                <PreviewIcon color="primary" />
              </IconButton>
            </Link>
          </TableCell>
        </TableRow>
      );
    })
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

export default Setting;


