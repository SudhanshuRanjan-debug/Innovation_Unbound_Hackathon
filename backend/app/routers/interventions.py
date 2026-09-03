from fastapi import APIRouter, HTTPException
from app.data import CUSTOMERS, INTERVENTIONS, get_transactions
from app.services.risk_engine import calculate_risk_score
from app.services.forecast_engine import project_cash_flow
from app.services.intervention_engine import evaluate_interventions

router = APIRouter()


@router.get("/{customer_id}/interventions")
def get_interventions(customer_id: str, status: str | None = None):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    # Merge static seed interventions with dynamically evaluated ones
    static = INTERVENTIONS.get(customer_id, [])

    txns     = get_transactions(customer_id)
    risk     = calculate_risk_score(c, txns)
    forecast = project_cash_flow(c["current_balance"], txns)
    dynamic  = evaluate_interventions(c, risk["risk_score"], forecast)

    # Use static ones (richer content) for demo; fallback to dynamic
    combined = static if static else dynamic

    if status:
        combined = [i for i in combined if i["status"] == status]

    return {"success": True, "data": combined}


@router.post("/interventions/{intervention_id}/accept")
def accept_intervention(intervention_id: str):
    # In-memory update — stateless for MVP
    return {
        "success": True,
        "data": {
            "intervention_id": intervention_id,
            "status": "accepted",
            "message": "Intervention accepted. Our team will reach out within 24 hours.",
        },
    }


@router.post("/interventions/{intervention_id}/reject")
def reject_intervention(intervention_id: str):
    return {
        "success": True,
        "data": {
            "intervention_id": intervention_id,
            "status": "rejected",
        },
    }
