# FinShield — Backend Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Backend service architecture, API design patterns, and implementation guidelines.

---

## 2. Technology Stack

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic V2
- **Database:** PostgreSQL via Supabase
- **Testing:** pytest
- **Data Processing:** Pandas, NumPy
- **ML:** scikit-learn

---

## 3. Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config/
│   │   ├── settings.py         # Environment configuration
│   │   └── constants.py        # Business constants
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic schemas
│   ├── api/v1/                 # API routes
│   ├── services/               # Business logic
│   ├── repository/             # Data access layer
│   ├── ml/                     # ML models
│   └── utils/                  # Utilities
├── tests/
└── requirements.txt
```

---

## 4. Application Configuration

```python
# config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    
    # API
    API_VERSION: str = "v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Authentication
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    JWT_SECRET: str
    
    # Risk Engine
    RISK_WEIGHT_INCOME_STABILITY: float = 0.20
    RISK_WEIGHT_LIQUIDITY: float = 0.25
    RISK_WEIGHT_DEBT_BURDEN: float = 0.25
    RISK_WEIGHT_PAYMENT_BEHAVIOR: float = 0.15
    RISK_WEIGHT_CREDIT_UTILIZATION: float = 0.15
    
    # LLM
    OPENAI_API_KEY: str
    LLM_TEMPERATURE: float = 0.3
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 5. API Layer Design

### 5.1 Route Organization

```python
# api/v1/router.py
from fastapi import APIRouter

api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(loans.router, prefix="/loans", tags=["loans"])
```

### 5.2 Endpoint Pattern

```python
# api/v1/risk.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/score", response_model=RiskScoreResponse)
async def get_risk_score(
    customer_id: str = Depends(get_current_customer_id),
    db: Session = Depends(get_db)
):
    """Get current risk score for customer."""
    risk_service = RiskService(db)
    risk_score = await risk_service.calculate_risk_score(customer_id)
    return RiskScoreResponse(
        success=True,
        data=risk_score,
        timestamp=datetime.now()
    )
```

---

## 6. Service Layer Design

### 6.1 Service Pattern

```python
# services/risk_engine/scorer.py
class RiskScoringService:
    def __init__(self, db: Session):
        self.db = db
        self.customer_repo = CustomerRepository(db)
        self.transaction_repo = TransactionRepository(db)
        self.loan_repo = LoanRepository(db)
    
    async def calculate_risk_score(self, customer_id: str) -> RiskScore:
        # Fetch data
        customer = await self.customer_repo.get_by_id(customer_id)
        transactions = await self.transaction_repo.get_last_6_months(customer_id)
        loans = await self.loan_repo.get_active_loans(customer_id)
        
        # Calculate factors
        income_stability = self._calculate_income_stability(transactions)
        liquidity = self._calculate_liquidity(customer, transactions)
        debt_burden = self._calculate_debt_burden(customer, loans)
        payment_behavior = self._calculate_payment_behavior(loans)
        credit_utilization = self._calculate_credit_utilization(customer, loans)
        
        # Calculate composite score
        weights = self._get_weights()
        composite_score = (
            income_stability * weights['income_stability'] +
            liquidity * weights['liquidity'] +
            debt_burden * weights['debt_burden'] +
            payment_behavior * weights['payment_behavior'] +
            credit_utilization * weights['credit_utilization']
        )
        
        # Determine category
        category = self._determine_category(composite_score)
        
        # Generate explanations
        risk_factors = self._generate_risk_factors(
            income_stability, liquidity, debt_burden,
            payment_behavior, credit_utilization
        )
        
        # Save assessment
        assessment = await self._save_assessment(
            customer_id, composite_score, category, risk_factors
        )
        
        return assessment
```

---

## 7. Repository Pattern

```python
# repository/base.py
from typing import Generic, TypeVar, Type
from sqlalchemy.orm import Session
from sqlalchemy import select

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    async def get_by_id(self, id: str) -> ModelType | None:
        stmt = select(self.model).where(self.model.id == id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

# repository/customer.py
class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, db: Session):
        super().__init__(Customer, db)
    
    async def get_by_user_id(self, user_id: str) -> Customer | None:
        stmt = select(Customer).where(Customer.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
```

---

## 8. Schema Definitions

```python
# schemas/risk.py
from pydantic import BaseModel, Field

class RiskFactorSchema(BaseModel):
    factor: str
    impact: str  # high, medium, low
    description: str

class RiskScoreSchema(BaseModel):
    assessment_date: datetime
    risk_score: float = Field(..., ge=0, le=100)
    risk_category: str
    factors: dict[str, float]
    weights: dict[str, float]
    risk_factors: list[RiskFactorSchema]
    previous_score: float | None = None
    score_change: float | None = None
    trend: str | None = None

class RiskScoreResponse(BaseModel):
    success: bool = True
    data: RiskScoreSchema
    timestamp: datetime
```

---

## 9. Error Handling

```python
# utils/exceptions.py
class FinShieldException(Exception):
    """Base exception for FinShield."""
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(message)

class ValidationError(FinShieldException):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")

class NotFoundError(FinShieldException):
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} with id {id} not found", "NOT_FOUND")

# Exception handler
@app.exception_handler(FinShieldException)
async def finshield_exception_handler(request: Request, exc: FinShieldException):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            },
            "timestamp": datetime.now().isoformat()
        }
    )
```

---

## 10. Authentication Middleware

```python
# api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Validate JWT token and extract user ID."""
    token = credentials.credentials
    
    try:
        # Validate with Supabase
        user = supabase.auth.get_user(token)
        return user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def get_current_customer_id(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    """Get customer ID from user ID."""
    customer = await CustomerRepository(db).get_by_user_id(user_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer.id
```

---

## 11. Database Session Management

```python
# models/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=10,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

---

## 12. Logging Configuration

```python
# utils/logging.py
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage
logger.info(
    "risk_score_calculated",
    customer_id=customer_id,
    score=68.5,
    duration_ms=234
)
```

---

## 13. Testing Patterns

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession)
    async with AsyncSessionLocal() as session:
        yield session

# tests/services/test_risk_engine.py
@pytest.mark.asyncio
async def test_calculate_risk_score(db_session):
    # Arrange
    customer = create_test_customer()
    db_session.add(customer)
    await db_session.commit()
    
    risk_service = RiskScoringService(db_session)
    
    # Act
    risk_score = await risk_service.calculate_risk_score(customer.id)
    
    # Assert
    assert 0 <= risk_score.risk_score <= 100
    assert risk_score.risk_category in ['critical', 'at_risk', 'watch', 'healthy']
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
