"use client"
import React, { useContext } from 'react';
import { useUser } from '../context/UserContext';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header = () => {
  const { user, currentScore, wins } = useUser();

  if (!user) return null; // Don't render if no user is logged in

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="inherit" component="div">
          Welcome, {user}
        </Typography>
        <Box flexGrow={1} /> {/* This pushes the score and wins to the right */}
        <Typography variant="subtitle1" color="inherit" sx={{ marginRight: 2 }}>
          Current Score: {currentScore}
        </Typography>
        <Typography variant="subtitle1" color="inherit">
          Wins: {wins}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
