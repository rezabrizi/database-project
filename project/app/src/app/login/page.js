"use client"
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { GameIdContext } from '@/app/context/GameIdContext';
import { UserContext } from '@/app/context/UserContext';
import { TextField, Button, Container, Typography, Box } from '@mui/material';


axios.defaults.baseURL = 'http://159.223.192.58:5000';
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [wins, setWins] = useState(0);
  const [isWaitingForGameStart, setIsWaitingForGameStart] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { setGameId: setGlobalGameId } = useContext(GameIdContext);
  const router = useRouter();

  const initializeWebSocket = () => {
    const socket = new WebSocket('ws://159.223.192.58:5000/ws/game');
    socket.onopen = (data) => {
      console.log('WebSocket Connected');
      console.log('Message from WebSocket:', data);
      if (data.action === 'start_game' && data.gameId === gameId) {
        setIsWaitingForGameStart(false);
        router.push('/game-page');
      }
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from WebSocket:', data);
      // Handle incoming messages
    };
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      // Handle WebSocket disconnection
    };

  };

  const handleLogin = async () => {
    try {
      console.log("User Logging in", username)
      const response = await axios.post('/user/login', { username });
      setUser(response.data.username);
      setWins(response.data.wins);
      setIsLoggedIn(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response.data.detail);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('/user/register', { username });

      setUser(response.data.username);
      setWins(response.data.wins);
      setIsLoggedIn(true);
      setErrorMessage('');
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response.data.detail);
    }
  };

  const handleEnterGame = async () => {

    try {
      let game_Id = parseInt(gameId)
      console.log('Entering the game ', gameId);
      const gameEntryResponse = await axios.post('/game/enter', { user:user,  gameId:game_Id})
      if (gameEntryResponse.status === 200) {
        setGlobalGameId(gameId);
        setIsWaitingForGameStart(true);
        initializeWebSocket();
      }
    } catch (error) {
      console.error('Error during game entry:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {user === null && (<Typography component="h1" variant="h5">
          Sign in or Register
        </Typography> )}

        {errorMessage && (
        <Box mt={2} sx={{ width: '100%' }}>
          <Typography variant="body2" color="error" align="center">
            {errorMessage}
          </Typography>
        </Box>
        )}
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) =>{ setUsername(e.target.value);}}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            onClick={handleRegister}
          >
            Register
          </Button>
          <TextField
            margin="normal"
            fullWidth
            name="gameId"
            label="Game ID"
            type="text"
            id="game-id"
            autoComplete="game-id"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            disabled={!isLoggedIn}  // Disable if not logged in
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            onClick={handleEnterGame}
            disabled={!isLoggedIn}  // Disable if not logged in
          >
            Enter Game
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
