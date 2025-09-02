import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import './Navbar.css';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.jpg';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/");
  };

  // Helper to check if route is active
  const isActive = (path) => location.pathname === path;

  return (
    <> 
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>

      <ul className="nav-list"> 
        <li className={`nav-item ${isActive("/master") ? "active" : ""}`}>
          <a href="/master" className="nav-link">Master</a>
        </li>
        <li className={`nav-item ${isActive("/customer") ? "active" : ""}`}>
          <a href="/customer" className="nav-link">Customer</a>
        </li>
        <li className={`nav-item ${isActive("/casting") ? "active" : ""}`}>
          <a href="/casting" className="nav-link">Casting/Melting</a>
        </li>
        <li className={`nav-item ${isActive("/filing") ? "active" : ""}`}>
          <a href="/filing" className="nav-link">Filing</a>
        </li>
        <li className={`nav-item ${isActive("/setting") ? "active" : ""}`}>
          <a href="/setting" className="nav-link">Setting</a>
        </li>
        <li className={`nav-item ${isActive("/buffing") ? "active" : ""}`}>
          <a href="/buffing" className="nav-link">Buffing</a>
        </li>
        <li className={`nav-item ${isActive("/billing") ? "active" : ""}`}>
          <a href="/billing" className="nav-link">Billing</a>
        </li>
        {/* <li className={`nav-item ${isActive("/report") ? "active" : ""}`}>
          <a href="/report" className="nav-link">Report</a>
        </li> */}

<li className="nav-item dropdown">
  <a
    href="#"
    className="nav-link dropdown-toggle"
    id="reportDropdown"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    Report
  </a>
  <ul className="dropdown-menu" aria-labelledby="reportDropdown">
    <li>
      <Link className="dropdown-item" to="/salesreport">Sales Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/customerreport">Customer Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/stockreport">Stock Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/receiptreport">Receipt Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/castingMeltingrreports">Casting/Melting Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/filingreports">Filing Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/settingreports">Setting Report</Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/buffingreports">Buffing Report</Link>
    </li>
  </ul>
</li>

        <li className={`nav-item ${isActive("/stock") ? "active" : ""}`}>
          <a href="/stock" className="nav-link">Stock</a>
        </li>
      </ul>

      <div className="navbar-right">     
        <button
  onClick={handleLogout}
  className="logout-button"
  title="Logout"
>
  <LogoutIcon />
</button>

      </div>
    </nav>
    </>
  );
}
export default Navbar;

