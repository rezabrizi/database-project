"use client"
// AdminPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Typography, Box, TextField, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

axios.defaults.baseURL = 'http://159.223.192.58:5000';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A nice shade of blue
    },
    secondary: {
      main: '#d32f2f', // A contrasting red for important actions
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: '20px 0',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff', // Ensuring text color is white
          margin: '10px 0',
          '&:hover': {
            // Define hover styles if needed
          },
        },
        containedPrimary: { // Explicitly defining styles for primary button
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#115293', // Darker shade of blue for hover (optional)
          },
        },
        containedSecondary: {
          backgroundColor: '#d32f2f', // Secondary color for secondary buttons
          '&:hover': {
            backgroundColor: '#9a0007', // Darker shade of red for hover (optional)
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: '10px 0',
        },
      },
    },
  },
});

const buttonStyle = {
    backgroundColor: theme.palette.primary.main, // Blue color for primary buttons
    color: '#fff', // White text color
    '&:hover': {
      backgroundColor: theme.palette.primary.dark, // Slightly darker blue on hover
    },
  };

const secondaryButtonStyle = {
    backgroundColor: theme.palette.secondary.main, // Red color for secondary buttons
    color: '#fff', // White text color
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark, // Slightly darker red on hover
    },
  };



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
      await axios.post('/game/start', { gameId: gameId });
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
    // Sending request to the server to finalize the game
    const response = await axios.post('/game/finalize', { game_id: gameId });

    // Handling the response to get the winner's details
    if (response.data && response.data.winner) {
      setMessage(`Game finalized. Winner: ${response.data.winner}, Score: ${response.data.score}`);
    } else {
      setMessage('Game finalized, but no winner information available.');
    }
  } catch (error) {
    console.error('Error in finalizing game:', error);
    setMessage('Failed to finalize game');
  }
};

  const clearDatabase = async () => {
    try {
      await axios.post('/clear_database');
      setMessage('Database cleared successfully');
    } catch (error) {
      console.error('Error in clearing database:', error);
      setMessage('Failed to clear database');
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
              <Alert severity="info" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={startGameSession}
            >
              Start Game Session
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={startGame}
              disabled={!gameId}
            >
              Start Game
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={finalizeGame}
              disabled={!gameId}
            >
              Finalize Game
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={clearDatabase}
            >
              Clear Database
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
    </ThemeProvider>
  );
}
