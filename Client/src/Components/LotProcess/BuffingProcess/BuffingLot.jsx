import React, { useState, useEffect } from 'react';
import Navbar from '../../Navbar/Navbar';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './BuffingLot.module.css';
import { BACKEND_SERVER_URL } from '../../../../Config/config';

const BuffingLot = () => {
  
  const { id, name, lotNumber } = useParams();  
  console.log("Lot Name from URL:", name ,id ,"lotNumber:",lotNumber);
  const [userDetails, setUserDetails] = useState(null);
  const [lotList, setLotList] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_SERVER_URL}/api/buffing/${id}`);
        const data = response.data;
        setUserDetails(data);
        setLotList(data.lotInfo || []);
        console.log('Fetched Buffing Details:', data);
        console.log('lot Info:', data.lotInfo)
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchDetails();
  }, [id]);

  return (
    <>
      <Navbar />

      <div className={styles.pageWrapper}>
        <div className={styles.headingg}>Eternity Jewellery Details</div>
        <div className={styles.details}><strong>Name:</strong> <span>{name}</span></div>
        <div className={styles.details}><strong>Phone Number:</strong> <span>{userDetails?.phoneNumber || '-'}</span></div>
        <div className={styles.details}><strong>Address:</strong> <span>{userDetails?.address || '-'}</span></div>
        <hr />
      </div>

      <div className={styles.container}>
        {lotList.map((lot) => (
          <div key={lot.id} className={styles.card}>
            <div className={styles.header}>
              <label className={styles.lotLabel}>Lot No: {lot.lotNumber}</label>
              <div className={styles.actions}>
              <Link to={`/buffingLotDetails/${id}/${encodeURIComponent(name)}/${lot.lotNumber || 0}`}>
                  <button className={styles.button}>View</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BuffingLot;
