# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from . import models, schemas, crud, database, security
from .database import engine
from datetime import timedelta

from fastapi.middleware.cors import CORSMiddleware

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SwapStop API")

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth helpers
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"user_id": user.id, "username": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------------
# Users
# ----------------------
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/me", response_model=schemas.User)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, updates: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated = crud.update_user(db, user_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.delete("/users/{user_id}", status_code=200)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # only allow users to delete their own account (or extend for admin)
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    deleted = crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

# ----------------------
# Items
# ----------------------
@app.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot create item for another user")
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_item(db, item, user_id)

@app.get("/users/{user_id}/items/", response_model=List[schemas.Item])
def read_user_items(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_items_by_user(db, user_id)

@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, skip=skip, limit=limit)

@app.get("/items/search", response_model=List[schemas.Item])
def search_items(q: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, owner_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.search_items(db, q=q, min_price=min_price, max_price=max_price, owner_id=owner_id, skip=skip, limit=limit)

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, updates: schemas.ItemUpdate, db: Session = Depends(get_db)):
    updated = crud.update_item(db, item_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@app.delete("/items/{item_id}", response_model=schemas.Item)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's item")
    db.delete(item)
    db.commit()
    return item

# ----------------------
# Trades / Swaps
# ----------------------
@app.post("/trades/", response_model=schemas.Trade)
def propose_trade(trade_in: schemas.TradeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proposer_item = db.query(models.Item).filter(models.Item.id == trade_in.proposer_item_id).first()
    responder_item = db.query(models.Item).filter(models.Item.id == trade_in.responder_item_id).first()
    if not proposer_item or not responder_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if proposer_item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own the proposer item")
    responder_id = responder_item.owner_id
    trade = crud.create_trade(db, proposer_id=current_user.id, responder_id=responder_id, proposer_item_id=trade_in.proposer_item_id, responder_item_id=trade_in.responder_item_id)
    return trade

@app.get("/trades/", response_model=List[schemas.Trade])
def list_trades(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user), skip: int = 0, limit: int = 100):
    return crud.get_trades_for_user(db, current_user.id, skip=skip, limit=limit)

@app.post("/trades/{trade_id}/respond", response_model=schemas.Trade)
def respond_trade(trade_id: int, action: schemas.TradeStatusStr, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade.responder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if action == schemas.TradeStatusStr.accepted:
        updated = crud.update_trade_status(db, trade_id, models.TradeStatus.accepted)
        # optional: transfer ownership here if desired
    elif action == schemas.TradeStatusStr.rejected:
        updated = crud.update_trade_status(db, trade_id, models.TradeStatus.rejected)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    return updated

# ---------------- BUY ITEMS ----------------
# TODO: add payment w/ stripe or paypal
@app.post("/buy/{buyer_id}/{item_id}", response_model=schemas.Item)
def buy_item(buyer_id: int, item_id: int, db: Session = Depends(get_db)):
    item, msg = crud.buy_item(db, buyer_id, item_id)
    if not item:
        raise HTTPException(status_code=400, detail=msg)
    return item