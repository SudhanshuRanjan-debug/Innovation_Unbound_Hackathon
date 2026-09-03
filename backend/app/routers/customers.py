from fastapi import APIRouter, HTTPException
from app.data import CUSTOMERS, ACCOUNTS

router = APIRouter()


@router.get("/{customer_id}")
def get_customer(customer_id: str):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")
    return {"success": True, "data": c}


@router.get("/{customer_id}/accounts")
def get_accounts(customer_id: str):
    if customer_id not in CUSTOMERS:
        raise HTTPException(404, "Customer not found")
    return {"success": True, "data": ACCOUNTS.get(customer_id, [])}
