"use client"
import React, { createContext, useState, useContext } from 'react';


export const UserContext = createContext({
  user: null,
  setUser: () => {},
  currentScore: 0,
  setCurrentScore: () => {},
  wins: 0,
  setWins: () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [wins, setWins] = useState(0);

  return (
    <UserContext.Provider value={{ user, setUser, currentScore, setCurrentScore, wins, setWins }}>
      {children}
    </UserContext.Provider>
  );

};
