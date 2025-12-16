# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from .schemas import UserUpdate, ItemUpdate
from .models import Item
from .security import hash_password, verify_password

# Users
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, updates: UserUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        if field == "password":
            value = hash_password(value)
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

# Authentication helper
def authenticate_user(db: Session, username_or_email: str, password: str):
    user = db.query(models.User).filter(models.User.email == username_or_email).first()
    if not user:
        user = db.query(models.User).filter(models.User.username == username_or_email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# Items
def create_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, updates: ItemUpdate):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item

def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()

def get_items_by_user(db: Session, user_id: int):
    return db.query(models.Item).filter(models.Item.owner_id == user_id).all()

# Search/filter
def search_items(db: Session, q: str = None, min_price: float = None, max_price: float = None,
                 owner_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Item)
    if q:
        like = f"%{q}%"
        query = query.filter((models.Item.name.ilike(like)) | (models.Item.description.ilike(like)))
    if min_price is not None:
        query = query.filter(models.Item.price_estimate >= min_price)
    if max_price is not None:
        query = query.filter(models.Item.price_estimate <= max_price)
    if owner_id:
        query = query.filter(models.Item.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()

# Trades
def create_trade(db: Session, proposer_id: int, responder_id: int, proposer_item_id: int, responder_item_id: int):
    trade = models.Trade(
        proposer_id=proposer_id,
        responder_id=responder_id,
        proposer_item_id=proposer_item_id,
        responder_item_id=responder_item_id,
        status=models.TradeStatus.pending
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade

def get_trades_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Trade).filter(
        (models.Trade.proposer_id == user_id) | (models.Trade.responder_id == user_id)
    ).offset(skip).limit(limit).all()

def update_trade_status(db: Session, trade_id: int, new_status: models.TradeStatus):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id).first()
    if not trade:
        return None
    trade.status = new_status
    db.commit()
    db.refresh(trade)
    return trade

def buy_item(db: Session, buyer_id: int, item_id: int):
    buyer = get_user_by_id(db, buyer_id)
    item = db.query(Item).filter(Item.id == item_id).first()

    if not buyer or not item:
        return None, "User or item not found."
    if not item.is_available:
        return None, "Item not available."
    if buyer.balance < item.price_estimate:
        return None, "Insufficient funds."

    seller = get_user_by_id(db, item.owner_id)

    # Transfer funds
    buyer.balance -= item.price_estimate
    seller.balance += item.price_estimate

    # Transfer ownership
    item.owner_id = buyer.id
    item.is_available = False

    db.commit()
    db.refresh(buyer)
    db.refresh(seller)
    db.refresh(item)

    return item, "Purchase successful!"