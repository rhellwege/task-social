# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import enum

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_estimate: Optional[float] = None
    is_available: Optional[bool] = True

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_estimate: Optional[float] = None
    is_available: Optional[bool] = None

class Item(ItemBase):
    id: int
    owner_id: int

    model_config = {"from_attributes": True}  # pydantic v2

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    balance: Optional[float] = None

class User(UserBase):
    id: int
    balance: float
    items: List[Item] = []

    model_config = {"from_attributes": True}

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None

# Trades
class TradeStatusStr(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"

class TradeCreate(BaseModel):
    proposer_item_id: int
    responder_item_id: int

class Trade(BaseModel):
    id: int
    proposer_id: int
    proposer_item_id: int
    responder_id: int
    responder_item_id: int
    status: TradeStatusStr
    created_at: datetime

    model_config = {"from_attributes": True}
