import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import LogoutIcon from '@mui/icons-material/Logout';
import './MasterNavbar.css';
import HomeIcon from '@mui/icons-material/Home';

const MasterNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbarr">
      <div className="navbar-leftt">
        <img src={logo} alt="Logo" className="navbar-logoo" />
      </div>

      <ul className="nav-listt"> 
        <li className='nav-itemm'>
          <a href="/customer" className={`nav-link ${isActive('/customer') ? 'active' : ''}`}><HomeIcon/> </a>
        </li>
        <li className='nav-itemm'>
          <a href="/mastercustomer" className={`nav-link ${isActive('/mastercustomer') ? 'active' : ''}`}>Customer</a>
        </li>
        <li className='nav-itemm'>
          <a href="/mastercasting" className={`nav-link ${isActive('/mastercasting') ? 'active' : ''}`}>Casting/Melting</a>
        </li>
        <li className='nav-itemm'>
          <a href="/masterfiling" className={`nav-link ${isActive('/masterfiling') ? 'active' : ''}`}>Filing</a>
        </li>
        <li className='nav-itemm'>
          <a href="/mastersetting" className={`nav-link ${isActive('/mastersetting') ? 'active' : ''}`}>Setting</a>
        </li>
        <li className='nav-itemm'>
          <a href="/masterbuffing" className={`nav-link ${isActive('/masterbuffing') ? 'active' : ''}`}>Buffing</a>
        </li>
        <li className='nav-itemm'>
          <a href="/masteritems" className={`nav-link ${isActive('/masteritems') ? 'active' : ''}`}>Items</a>
        </li>
        <li className='nav-itemm'>
          <a href="/mastertouch" className={`nav-link ${isActive('/mastertouch') ? 'active' : ''}`}>Touch</a>
        </li>
        <li className='nav-itemm'>
          <a href="/masterpurchasestock" className={`nav-link ${isActive('/masterpurchasestock') ? 'active' : ''}`}>Purchase Stock</a>
        </li>
        <li className='nav-itemm'> 
          <a href='/mastersupplier' className={`nav-link ${isActive('/mastersupplier') ? 'active' : ''}`}> Supplier </a>
        </li>
        <li className='nav-itemm'> 
          <a href='/masterjewel' className={`nav-link ${isActive('/masterjewel') ? 'active' : ''}`}> QC Stock </a>
        </li>
      </ul>

      <div className="navbar-rightt">     
        <button
          onClick={handleLogout}
          className="logout-button"
          title="Logout"
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

export default MasterNavbar;
