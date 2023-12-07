"use client"
import React, { useState, useContext, useEffect} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { GameIdContext } from '@/app/context/GameIdContext';
import { UserContext } from '@/app/context/UserContext';
import { TextField, Button, Container, Typography, Box, createTheme, ThemeProvider, Alert } from '@mui/material';


axios.defaults.baseURL = 'http://159.223.192.58:5000';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A shade of blue
    },
    secondary: {
      main: '#d32f2f', // A shade of red
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
        containedPrimary: {
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#115293',
          },
        },
        containedSecondary: {
          backgroundColor: '#d32f2f',
          '&:hover': {
            backgroundColor: '#9a0007',
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


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {wins, setWins} = useContext(UserContext);
  const [isWaitingForGameStart, setIsWaitingForGameStart] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { setGameId: setGlobalGameId } = useContext(GameIdContext);
  const router = useRouter();


  useEffect(() => {
    if (isLoggedIn && gameId) {
      initializeWebSocket();
    }
  }, [isLoggedIn, gameId]);
  const initializeWebSocket = () => {
    const socket = new WebSocket('ws://159.223.192.58:5000/ws/game');

    socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from WebSocket:', data);
      if (data.action === 'start_game' && data.gameId == gameId) {
        setIsWaitingForGameStart(false);
        router.push('/game');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
    };
  };
  const handleLogin = async () => {
    try {
      console.log("User Logging in", username)
      const response = await axios.post('/user/login', { username });
      console.log (response.data);
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
      let game_Id = parseInt(gameId);
      console.log('Entering the game ', gameId);
      const gameEntryResponse = await axios.post('/game/enter', { user: user, gameId: game_Id });
      if (gameEntryResponse.status === 200) {
        setGlobalGameId(gameId);
        setIsWaitingForGameStart(true);
      }
    } catch (error) {
      console.error('Error during game entry:', error);
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {user === null && (
            <Typography component="h1" variant="h5">
              Sign in or Register
            </Typography>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {errorMessage}
            </Alert>
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
              onChange={(e) => setUsername(e.target.value)}
              disabled={isWaitingForGameStart}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
              disabled={isWaitingForGameStart}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleRegister}
              disabled={isWaitingForGameStart}
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
              disabled={!isLoggedIn || isWaitingForGameStart}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleEnterGame}
              disabled={!isLoggedIn || isWaitingForGameStart}
            >
              Enter Game
            </Button>

            {isWaitingForGameStart && (
              <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
                You are entered into the game. Please wait for the admin to start the game.
              </Alert>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
