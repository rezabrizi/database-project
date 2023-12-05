"use client"

import React, { createContext, useState, useContext } from 'react';

export const GameIdContext = createContext(null);

export const useGameId = () => useContext(GameIdContext);

export const GameIdProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);

  return (
    <GameIdContext.Provider value={{ gameId, setGameId }}>
      {children}
    </GameIdContext.Provider>
  );
};
