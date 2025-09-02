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
import './Customer.css';
import Navbar from "../Navbar/Navbar";
import { BACKEND_SERVER_URL } from "../../../Config/config";


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
    const phoneMatch = customer.phoneNumber && customer.phoneNumber.includes(searchTerm);
    const addressMatch =
      customer.address &&
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());

    return nameMatch || phoneMatch || addressMatch;
  });

  return (
    <> 
    <Navbar/>
    <Container maxWidth="lg">
      <Paper className="customer-table-container" elevation={3} sx={{ p: 3 }}>
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }} >
                    <strong>Customer Name</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>
                    <strong>Phone Number</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#38383e', color:'white', textAlign:'center'  }}>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={index} hover>
                    <TableCell align="center">{customer.name}</TableCell>
                    <TableCell align="center">{customer.phoneNumber}</TableCell>
                    <TableCell align="center">{customer.address}</TableCell>
                    <TableCell align="center">
                      {/* <IconButton onClick={() => navigate("/customertranscation")}> */}
                      <IconButton
                        onClick={() =>
                          navigate(
                            `/customertranscation?id=${
                              customer.id
                            }&name=${encodeURIComponent(customer.name)}`
                          )
                          
                        }
                        
                      >
                        <PreviewIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
