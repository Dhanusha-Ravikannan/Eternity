import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import styles from './MasterNavbar.module.css';

const MasterNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.navbarr}>
      <div className={styles['navbar-leftt']}>
        <img src={logo} alt="Logo" className={styles['navbar-logoo']} />
      </div>

      <ul className={styles['nav-listt']}>
        <li className={styles['nav-itemm']}>
          <a
            href="/customer"
            className={`${styles['nav-link']} ${isActive('/customer') ? styles.active : ''}`}
          >
            <HomeIcon />
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/mastercustomer"
            className={`${styles['nav-link']} ${isActive('/mastercustomer') ? styles.active : ''}`}
          >
            Customer
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/mastercasting"
            className={`${styles['nav-link']} ${isActive('/mastercasting') ? styles.active : ''}`}
          >
            Casting/Melting
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/masterfiling"
            className={`${styles['nav-link']} ${isActive('/masterfiling') ? styles.active : ''}`}
          >
            Filing
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/mastersetting"
            className={`${styles['nav-link']} ${isActive('/mastersetting') ? styles.active : ''}`}
          >
            Setting
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/masterbuffing"
            className={`${styles['nav-link']} ${isActive('/masterbuffing') ? styles.active : ''}`}
          >
            Buffing
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/masteritems"
            className={`${styles['nav-link']} ${isActive('/masteritems') ? styles.active : ''}`}
          >
            Items
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/mastertouch"
            className={`${styles['nav-link']} ${isActive('/mastertouch') ? styles.active : ''}`}
          >
            Touch
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/mastersupplier"
            className={`${styles['nav-link']} ${isActive('/mastersupplier') ? styles.active : ''}`}
          >
            Supplier
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/masterpurchasestock"
            className={`${styles['nav-link']} ${isActive('/masterpurchasestock') ? styles.active : ''}`}
          >
            Purchase Stock
          </a>
        </li>
        <li className={styles['nav-itemm']}>
          <a
            href="/qcstock"
            className={`${styles['nav-link']} ${isActive('/qcstock') ? styles.active : ''}`}
          >
            QC Stock
          </a>
        </li>
      </ul>

      <div className={styles['navbar-rightt']}>
        <button
          onClick={handleLogout}
          className={styles['logout-button']}
          title="Logout"
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

export default MasterNavbar;
