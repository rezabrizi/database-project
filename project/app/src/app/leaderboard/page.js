"use client";
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { GameIdContext } from '@/app/context/GameIdContext';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

export default function LeaderboardPage() {
  const { gameId } = useContext(GameIdContext);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (gameId) {
      fetchLeaderboard(gameId);
    }
  }, [gameId]);

  const fetchLeaderboard = async (gameId) => {
    try {
      const response = await axios.get(`http://159.223.192.58:5000/game/${gameId}/leaderboard`);
      // Sort the leaderboard by score in descending order
      const sortedLeaderboard = response.data.sort((a, b) => b.score - a.score);
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" style={{ margin: '20px 0' }}>Game Leaderboard</Typography>
      <TableContainer component={Paper} style={{ maxHeight: 440, overflow: 'auto' }}>
        <Table stickyHeader aria-label="leaderboard table">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">{row.username}</TableCell>
                <TableCell align="right">{row.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
