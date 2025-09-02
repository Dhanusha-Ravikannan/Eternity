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
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>S.No</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Date </strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Time </strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Setting Member Name</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Phone Number</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color: 'white', textAlign: 'center' }}>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
<TableBody>
  {filteredData.length > 0 ? (
    filteredData.map((row, index) => (
      <TableRow key={row.id}>
        <TableCell align="center">{index + 1}</TableCell>
        <TableCell align="center">
          {new Date(row.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell align="center">
          {new Date(row.createdAt).toLocaleTimeString()}
        </TableCell>
        <TableCell align="center">{row.name}</TableCell>
        <TableCell align="center">{row.phoneNumber || "-"}</TableCell>
        <TableCell align="center">{row.address || "-"}</TableCell>
        <TableCell align="center">
          <Link to={`/settinglot/${row.id}/${encodeURIComponent(row.name)}/${row.lotInfo?.[0]?.lotNumber || 0}`}>
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

export default Setting;


