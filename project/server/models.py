from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float

class User (Base):
    __tablename__ = 'User'
    username = Column(String, primary_key=True, index=True)
    wins = Column(Integer)

class Game (Base):
    __tablename__ = 'Game'
    gameId = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    winner = Column(String)
    maxScore = Column(Integer)

class Score (Base):
    __tablename__ = "Score"
    username = Column(String, primary_key=True)
    gameId = Column(Integer, primary_key=True)
    score = Column(Integer)