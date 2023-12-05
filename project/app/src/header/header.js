"use client"
import React, { useContext } from 'react';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { user, currentScore, wins } = useUser();


  if (!user) return null; // Don't render if no user is logged in

  return (
    <header>
      <h1>Welcome, {user}</h1>
      <p>Current Score: {currentScore}</p>
      <p>Wins: {wins}</p>
    </header>
  );
};

export default Header;

