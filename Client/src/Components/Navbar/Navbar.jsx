import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../assets/logo.jpg";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportOpen, setReportOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      {/* Left Logo */}
      <div className={styles.navbarLeft}>
        <img src={logo} alt="Logo" className={styles.navbarLogo} />
      </div>

      {/* Nav Links */}
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link
            to="/master"
            className={`${styles.navLink} ${
              isActive("/master") ? styles.active : ""
            }`}
          >
            Master
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/customer"
            className={`${styles.navLink} ${
              isActive("/customer") ? styles.active : ""
            }`}
          >
            Customer
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/casting"
            className={`${styles.navLink} ${
              isActive("/casting") ? styles.active : ""
            }`}
          >
            Casting/Melting
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/filing"
            className={`${styles.navLink} ${
              isActive("/filing") ? styles.active : ""
            }`}
          >
            Filing
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/setting"
            className={`${styles.navLink} ${
              isActive("/setting") ? styles.active : ""
            }`}
          >
            Setting
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/buffing"
            className={`${styles.navLink} ${
              isActive("/buffing") ? styles.active : ""
            }`}
          >
            Buffing
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/billing"
            className={`${styles.navLink} ${
              isActive("/billing") ? styles.active : ""
            }`}
          >
            Billing
          </Link>
        </li>

        {/* Dropdown */}
        <li
          className={`${styles.navItem} ${styles.dropdown}`}
          onMouseEnter={() => setReportOpen(true)}
          onMouseLeave={() => setReportOpen(false)}
        >
          <div className={styles.dropdownToggle}>Report▾</div>
          <ul
            className={`${styles.dropdownMenu} ${
              reportOpen ? styles.show : ""
            }`}
          >
               <li>
              <Link className={styles.dropdownItem} to="/castingMeltingrreports">
                Casting Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/filingreports">
                Filing Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/settingreports">
                Setting Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/buffingreports">
                Buffing Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/workerReport">
                Worker Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/purchasereport">
                Purchase Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/salesreport">
                Sales Report
              </Link>
            </li>
            <li>
              <Link className={styles.dropdownItem} to="/customerreport">
                Customer Report
              </Link>
            </li>      
            <li>
              <Link className={styles.dropdownItem} to="/receiptvoucherreport">
                Receipt Voucher Report 
              </Link>
            </li>    
          </ul>
        </li>

        <li className={styles.navItem}>
          <Link
            to="/stock"
            className={`${styles.navLink} ${
              isActive("/stock") ? styles.active : ""
            }`}
          >
            Stock
          </Link>
        </li> 
        <li className={styles.navItem}>
          <Link
            to="/receiptvoucher"
            className={`${styles.navLink} ${
              isActive("/receiptvoucher") ? styles.active : ""
            }`}
          >
            Receipt Voucher
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            to="/expensevoucher"
            className={`${styles.navLink} ${
              isActive("/expensevoucher") ? styles.active : ""
            }`}
          >
            Expense Tracker
          </Link>
        </li>
      </ul>

      {/* Right Logout */}
      <div className={styles.navbarRight}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          title="Logout"
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

