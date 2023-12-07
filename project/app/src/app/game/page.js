"use client";

import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '@/app/context/UserContext';
import { GameIdContext } from '@/app/context/GameIdContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

axios.defaults.baseURL = 'http://159.223.192.58:5000';

const GamePage = () => {
  const [timeLeft, setTimeLeft] = useState(15);
  const isSpaceBarPressed = useRef(false);
  const { user, currentScore, setCurrentScore } = useContext(UserContext);
  const { gameId } = useContext(GameIdContext);
  const router = useRouter(); // Use the useRouter hook

  useEffect(() => {
    const timer = timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (timeLeft > 0 && event.code === 'Space' && !isSpaceBarPressed.current) {
        setCurrentScore(currentScore => currentScore + 1);
        isSpaceBarPressed.current = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === 'Space') {
        isSpaceBarPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [timeLeft, setCurrentScore]);

  useEffect(() => {
    if (timeLeft === 0) {
      submitScore();
      console.log(gameId);
      // Redirect to the leaderboard page using Next.js router
      router.push(`/leaderboard`); // Adjust the path as per your routing setup
    }
  }, [timeLeft, router, gameId]);

  const submitScore = async () => {
    try {
      const response = await axios.post('/game/submit_score', {
        user: user,
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

export default GamePage;
