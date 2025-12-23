import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import NavbarAuth from '../../../components/NavbarAuth';
import styles from './styles.module.css';

export default function NavbarContentWrapper(props) {
  return (
    <div className={styles.navbarContentWrapper}>
      <NavbarContent {...props} />
      <div className={styles.navbarAuth}>
        <NavbarAuth />
      </div>
    </div>
  );
}
