from datetime import datetime
import json
from starlette.websockets import WebSocketDisconnect
from fastapi import FastAPI, HTTPException, Depends, APIRouter, WebSocket, Request
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import (SessionLocal, engine)
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
router = APIRouter()


connected_clients = {}
origins = [
"*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




class UserBase(BaseModel):
    username: str

class UserModel(UserBase):
    wins: int

    class Config:
        orm_mode = True


class GameBase(BaseModel):
    date: str
    winner: str
    maxScore: int


class GameModel(GameBase):
    gameId: int

    class Config:
        orm_mode = True


class UserScore(BaseModel):
    username: str
    score: int


class ScoreBase(BaseModel):
    username: str
    gameId: int
    score: int


class ScoreModel(ScoreBase):
    class Config:
        orm_mode = True


class LeaderboardEntry(BaseModel):
    username: str
    score: int

    class Config:
        orm_mode = True



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

def get_all_users_and_wins(db: Session):
    users = db.query(models.User.username, models.User.wins).all()
    return users


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/user/register", response_model=UserModel)
async def register(user: UserBase, db: Session = Depends(get_db)):
    print("hereeeee")
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=409, detail="User already exists")
    else:
        new_user = models.User(username=user.username, wins=0)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return UserModel(username=new_user.username, wins=new_user.wins)

@app.post("/user/login", response_model=UserModel)
async def login(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()

    if db_user:
        return UserModel(username=db_user.username, wins=db_user.wins)
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.get("/users", response_model=List[UserModel])
async def list_users(db: db_dependency):
    users_and_wins = get_all_users_and_wins(db)
    return users_and_wins

@app.get("/games", response_model=List[GameModel])
async def get_all_games(db: Session = Depends(get_db)):
    # Query all games from the Game table
    games = db.query(models.Game).all()
    for game in games:
        if game.winner is None:
            game.winner = "No Winner Yet"

    # Return the list of game details
    return games

@app.get("/game/users/{game_id}", response_model=List[UserScore])
async def get_users_in_game(game_id: int, db: Session = Depends(get_db)):
    # Query the Score table for all scores with the given gameId
    scores = db.query(models.Score).filter(models.Score.gameId == game_id).all()

    # Extract usernames and scores
    users_scores = [UserScore(username=score.username, score=score.score) for score in scores]

    return users_scores

@app.post("/game/enter", response_model=ScoreModel)
async def enter_game(request: Request, db: Session = Depends(get_db)):
    req = await request.json()
    user, gameId = req['user'], req['gameId']

    # Check if the user exists
    user_exists = db.query(models.User).filter(models.User.username == user).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the game exists
    game = db.query(models.Game).filter(models.Game.gameId == gameId).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Check if user has already entered the game
    existing_score = db.query(models.Score).filter(models.Score.username == user, models.Score.gameId == gameId).first()
    if existing_score:
        raise HTTPException(status_code=400, detail="User already entered this game")

    # Add the username with the game id to the score table with initial score 0
    new_score = models.Score(username=user, gameId=gameId, score=0)
    db.add(new_score)
    db.commit()
    return ScoreModel(username=new_score.username, gameId=new_score.gameId, score=new_score.score)


@router.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = id(websocket)  # Unique identifier for the websocket
    connected_clients[client_id] = websocket

    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        print(f"Error in WebSocket connection: {e}")
    finally:
        await safely_close_websocket(client_id)

async def safely_close_websocket(client_id):
    websocket = connected_clients.get(client_id)
    if websocket:
        try:
            await websocket.close()
            print(f"WebSocket connection closed: {client_id}")
        except WebSocketDisconnect:
            print(f"WebSocket already disconnected: {client_id}")
        except RuntimeError as e:
            print(f"RuntimeError occurred: {e}")
        finally:
            # Remove the client from the dictionary
            connected_clients.pop(client_id, None)

async def broadcast_start_game(gameId: int):
    for client_id, websocket in connected_clients.items():
        try:
            await websocket.send_text(json.dumps({"action": "start_game", "gameId": gameId}))
        except Exception as e:
            print(f"Error sending message to client {client_id}: {e}")
            await safely_close_websocket(client_id)


@app.post("/game/create_session")
async def create_game_session(db: Session = Depends(get_db)):
    # Create a new game session
    new_game = models.Game(date=str(datetime.now()), winner=None, maxScore=0)
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    # Return the gameId to the admin
    return {"gameId": new_game.gameId, "message": "New game session created"}

@app.post("/game/start")
async def start_game(request: Request):
    try:
        print ('trying to start the fing game')
        req = await request.json()
        game_id = req['gameId']
        db = SessionLocal()
        # Check if the game session exists
        game = db.query(models.Game).filter(models.Game.gameId == game_id).first()
        print(game)
        if not game:
            print ("exceptionnnnn")
            raise HTTPException(status_code=404, detail="Game session not found")

        # Broadcast start message with gameId to all connected clients
        await broadcast_start_game(game_id)
        print ("broadcased")
        return {"message": "Game started", "gameId": game_id}
    except Exception as e:
        print(e)

@app.post("/game/finalize")
async def finalize_game(request: Request, db: Session = Depends(get_db)):
    # Determine the winner based on the scores
    req = await request.json()
    game_id = req['game_id']
    winner_score = db.query(models.Score).filter(models.Score.gameId == game_id).order_by(models.Score.score.desc()).first()
    print (winner_score)
    if winner_score:
        # Update the Game table
        game = db.query(models.Game).filter(models.Game.gameId == game_id).first()
        game.winner = winner_score.username
        print (winner_score.username)
        game.maxScore = winner_score.score

        # Update the User table
        winner_user = db.query(models.User).filter(models.User.username == winner_score.username).first()
        print(winner_user.username)
        winner_user.wins += 1

        db.commit()
        return {"winner": winner_user.username, "score": winner_score.score}
    else:
        raise HTTPException(status_code=404, detail="No scores found for this game session")

@app.post("/game/submit_score")
async def submit_score(request: Request, db: Session = Depends(get_db)):
    req = await request.json()
    user, gameId, score = req['user'], req['gameId'], req['score']
    # Check if the score entry for the user and game exists
    score_entry = db.query(models.Score).filter(models.Score.username == user, models.Score.gameId == gameId).first()

    if not score_entry:
        raise HTTPException(status_code=404, detail="Score entry not found")

    # Update the score
    score_entry.score = score
    db.commit()
    return {"message": "Score updated successfully"}

app.include_router(router)


@app.get("/game/{game_id}/leaderboard", response_model=List[LeaderboardEntry])
async def get_game_leaderboard(game_id: int, db: Session = Depends(get_db)):
    # Query the Score table for all scores with the given gameId
    scores = db.query(models.Score).filter(models.Score.gameId == game_id).all()

    # Create a list of LeaderboardEntry
    leaderboard = [LeaderboardEntry(username=score.username, score=score.score) for score in scores]

    return leaderboard




@app.post("/clear_database")
async def clear_database(db: Session = Depends(get_db)):
    try:
        # Delete all records from each table
        db.query(models.User).delete()
        db.query(models.Game).delete()
        db.query(models.Score).delete()

        # Commit the changes
        db.commit()

        return {"message": "Database cleared successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
