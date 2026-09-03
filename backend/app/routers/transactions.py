from fastapi import APIRouter, HTTPException
from app.data import CUSTOMERS, get_transactions

router = APIRouter()


@router.get("/{customer_id}/transactions")
def list_transactions(
    customer_id: str,
    limit: int = 50,
    offset: int = 0,
    category: str | None = None,
):
    if customer_id not in CUSTOMERS:
        raise HTTPException(404, "Customer not found")

    txns = get_transactions(customer_id)

    if category:
        txns = [t for t in txns if t["category"] == category]

    total = len(txns)
    page  = txns[offset : offset + limit]

    return {
        "success": True,
        "data": {
            "transactions": page,
            "total_count":  total,
            "limit":        limit,
            "offset":       offset,
        },
    }
