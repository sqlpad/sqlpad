import React from 'react';
import { connect } from 'unistore/react';
import styles from './AppHeaderUser.module.css';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps)(React.memo(UserButton));

function UserButton({ currentUser }) {
  if (currentUser._id === "noauth") {
  	return null
  }
  return <div className={styles.style}> {currentUser.name || currentUser.email}</div>
  
}

export default Connected;
