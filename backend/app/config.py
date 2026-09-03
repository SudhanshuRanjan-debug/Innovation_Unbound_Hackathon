from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Risk weights (must sum to 1.0)
    RISK_WEIGHT_INCOME_STABILITY: float = 0.20
    RISK_WEIGHT_LIQUIDITY: float = 0.25
    RISK_WEIGHT_DEBT_BURDEN: float = 0.25
    RISK_WEIGHT_PAYMENT_BEHAVIOR: float = 0.15
    RISK_WEIGHT_CREDIT_UTILIZATION: float = 0.15

    # Thresholds
    MIN_SAFE_BALANCE: float = 5000.0
    FORECAST_DAYS: int = 90
    RISK_TRIGGER_SCORE: float = 60.0

    # Overdraft
    OVERDRAFT_MAX_AMOUNT: float = 50000.0
    OVERDRAFT_MIN_INCOME: float = 20000.0
    OVERDRAFT_DAILY_RATE: float = 0.0005
    OVERDRAFT_PROCESSING_FEE: float = 100.0

    # Loan comparison weights (must sum to 1.0)
    LOAN_WEIGHT_TOTAL_COST: float = 0.30
    LOAN_WEIGHT_AFFORDABILITY: float = 0.25
    LOAN_WEIGHT_RESILIENCE: float = 0.20
    LOAN_WEIGHT_TENURE: float = 0.10
    LOAN_WEIGHT_FEES: float = 0.05
    LOAN_WEIGHT_FLEXIBILITY: float = 0.10

    class Config:
        env_file = ".env"
        extra = "allow"

@lru_cache
def get_settings() -> Settings:
    return Settings()
