import React from 'react';
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import logo from '../../assets/logo.jpg';
import backgroundImg from '../../assets/pink.jpg';
import './Login.css'
import { Link } from 'react-router-dom';
import backgroundIm from '../../assets/back.jpg'

const Login = () => {
  return (
    <>  
    <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor:"#d1c9c9",
          // background: "linear-gradient(to right, #f2a9a5, #ffffff)",
          // width:'100%',
          // height:'100vh',
          // backgroundImage: `url(${backgroundImg})`,
          backgroundImage:`url(${backgroundIm})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: '100%',
    height: '100vh',         
        }}
      >

<Card
  sx={{
    padding: 2,
    borderRadius: 2,
    minWidth: 350,
    boxShadow: 5,
    backgroundColor: 'white',
  }}
>


<CardContent sx={{ backgroundColor: 'white', color: 'black' }}>
  {/* Row: Logo + Texts */}
  <Box display="flex" alignItems="center" mb={2}>
    {/* Logo on the left */}
    <Box mr={2}>
      <img
        src={logo}
        alt="Company Logo"
        style={{
          maxWidth: '50px',
          height: 'auto',
          borderRadius: '50%',
        }}
      />
    </Box>

    {/* Text on the right */}
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'red', color:'black' , ml:5 ,
         fontFamily: 'Playfair Display, serif',
         textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
      }}>
        Eternity Jewellery
      </Typography>
      <Typography variant="body1">
        Welcome user, please login to continue
      </Typography>
    </Box>
  </Box>

  {/* Login button - Full width below */}
  <Link to={'/customer'}> 
  <Button
    fullWidth
    variant="contained"
    sx={{
      backgroundColor: '#d46d68',
      background:'#DAA520' ,
    background:'black',
    background: 'linear-gradient(to left, #674903, #DAA520)',
      fontWeight: 'bold',
      fontSize: '1rem',
      marginTop:'1rem',
      "&:hover": {  background: 'linear-gradient(to right, #674903, #DAA520)', },
      
    }}
  
  >
    Login
  </Button>
  </Link>
</CardContent>

</Card>

      </Box></>
  
  )
}

export default Login




