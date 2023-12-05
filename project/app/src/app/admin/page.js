"use client"
// AdminPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Typography, Box, TextField } from '@mui/material';

axios.defaults.baseURL = 'http://159.223.192.58:5000';

export default function AdminPage() {
  const [gameId, setGameId] = useState('');
  const [message, setMessage] = useState('');

  const startGameSession = async () => {
    try {
      const response = await axios.post('/game/create_session');
      setGameId(response.data.gameId);
      setMessage(`Game session created with ID: ${response.data.gameId}`);
    } catch (error) {
      console.error('Error in starting game session:', error);
      setMessage('Failed to start game session');
    }
  };

  const startGame = async () => {
    if (!gameId) {
      setMessage('Please create a game session first');
      return;
    }
    try {
      await axios.post('/game/start', { game_id: gameId });
      setMessage('Game started');
    } catch (error) {
      console.error('Error in starting game:', error);
      setMessage('Failed to start game');
    }
  };

  const finalizeGame = async () => {
    if (!gameId) {
      setMessage('Please create a game session first');
      return;
    }
    try {
      await axios.post('/game/finalize', { game_id: gameId });
      setMessage('Game finalized');
    } catch (error) {
      console.error('Error in finalizing game:', error);
      setMessage('Failed to finalize game');
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Admin Dashboard
        </Typography>

        <Box mt={3} sx={{ width: '100%' }}>
          {message && (
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            onClick={startGameSession}
          >
            Start Game Session
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            onClick={startGame}
            disabled={!gameId}
          >
            Start Game
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            onClick={finalizeGame}
            disabled={!gameId}
          >
            Finalize Game
          </Button>

          <TextField
            fullWidth
            margin="normal"
            id="game-id"
            label="Game ID"
            value={gameId}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
        </Box>
      </Box>
    </Container>
  );
}
