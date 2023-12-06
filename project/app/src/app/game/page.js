"use client"
// GamePage.js in /src/pages
import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { GameIdContext } from '../context/GameIdContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://159.223.192.58:5000';

const GamePage = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const { user, currentScore, setCurrentScore } = useContext(UserContext);
  const { gameId } = useContext(GameIdContext);

  useEffect(() => {
    // Start the countdown timer
    const timer = timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);

    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (timeLeft > 0 && event.code === 'Space') {
        setCurrentScore(currentScore + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentScore, timeLeft, setCurrentScore]);

  useEffect(() => {
    // Submit score when time is up
    if (timeLeft === 0) {
      submitScore();
    }
  }, [timeLeft]);

  const submitScore = async () => {
    try {
      const response = await axios.post('/game/submit_score', {
        user: user?.username,
        gameId,
        score: currentScore
      });
      console.log('Score submitted:', response.data.message);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  return (
    <div>
      <h1>Game Page</h1>
      <p>Time left: {timeLeft} seconds</p>
      <p>Score: {currentScore}</p>
      {timeLeft === 0 && <p>Time's up! Your final score is {currentScore}.</p>}
    </div>
  );
};

