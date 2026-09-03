# FinShield — AI Service Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

LLM integration for natural-language financial explanations. The LLM explains pre-calculated values — it does NOT compute them.

---

## 2. Architecture Principle

```
Financial Data
      ↓
Financial / Risk / Forecast Engines
      ↓
Structured Facts  ← LLM receives ONLY this
      ↓
LLM (OpenAI / Anthropic)
      ↓
Human-readable explanation  ← LLM produces ONLY this
```

**The LLM must never:**
- Calculate EMI, risk scores, or ratios independently
- Approve or reject a loan
- Override a recommendation produced by the engines

---

## 3. Supported Context Types

| context_type | What it explains |
|---|---|
| `risk_score` | Why a customer's resilience score is what it is |
| `forecast_summary` | What the cash-flow forecast means in plain terms |
| `intervention` | Why a specific intervention was recommended |
| `loan_comparison` | Why a particular product is the best fit |
| `overdraft_offer` | What the overdraft costs and why it makes sense |
| `general_query` | Customer free-text question about their finances |

---

## 4. Prompt Templates

### 4.1 Risk Score Explanation

```python
RISK_SCORE_PROMPT = """
You are a friendly and concise financial advisor for FinShield, an Indian banking app.
Explain the customer's financial resilience score in simple, reassuring language.
Do NOT invent numbers — only reference those provided below.
Keep the response to 3–4 sentences.

Customer Financial Snapshot:
- Resilience Score: {risk_score} / 100 ({risk_category})
- Change from last month: {score_change:+.1f} points
- Top risk factors: {risk_factors}
- Income: ₹{monthly_income:,.0f}/month
- EMI burden: {emi_to_income_ratio:.0%} of income
- Emergency fund: {emergency_fund_months:.1f} months

Write a friendly explanation of the score and the most important factors.
"""
```

### 4.2 Intervention Recommendation

```python
INTERVENTION_PROMPT = """
You are a supportive financial advisor.
Explain this recommendation to the customer in 2–3 sentences.
Be empathetic, practical, and avoid jargon.
Do NOT suggest taking a loan unless the recommendation_type is 'loan_comparison'.

Recommendation:
- Type: {recommendation_type}
- Title: {title}
- Reason: {reason_code}
- Expected improvement: {impact_summary}
- Current risk score: {current_risk_score} → Projected: {projected_risk_score}

Write a personalised explanation.
"""
```

### 4.3 Loan Comparison Summary

```python
LOAN_COMPARISON_PROMPT = """
You are a financial advisor helping a customer choose the right loan.
Explain why the best-fit loan was selected over the others.
Do NOT recommend taking a loan — that decision was made upstream.
Focus on the trade-offs in 3–4 sentences.

Best-fit product:
- Lender: {lender_name}
- EMI: ₹{emi:,.0f}/month
- Total cost: ₹{total_cost:,.0f}
- Composite score: {composite_score}/100

Why it ranks #1: {recommendation_reason}

Alternatives considered: {alternative_summary}

Explain the choice clearly.
"""
```

### 4.4 Forecast Summary

```python
FORECAST_PROMPT = """
You are a financial advisor explaining a 90-day cash-flow forecast.
Be specific about the dates and amounts provided. Do not invent any numbers.
Keep response to 3–4 sentences.

Forecast Highlights:
- Current balance: ₹{current_balance:,.0f}
- Lowest projected balance: ₹{minimum_balance:,.0f} on {minimum_balance_date}
- Next salary expected: {next_salary_date} (₹{expected_salary:,.0f})
- Low-balance alerts: {low_balance_count} dates flagged

Explain what the forecast means and whether there is a concern.
"""
```

---

## 5. LLM Client Implementation

```python
# services/ai_service/llm_client.py
import asyncio
from openai import AsyncOpenAI
from app.config.settings import settings
from app.utils.logging import logger

class LLMClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.LLM_MODEL  # e.g. "gpt-4o-mini"
        self.temperature = settings.LLM_TEMPERATURE  # 0.3
        self.max_tokens = settings.LLM_MAX_TOKENS    # 500
        self.timeout = 30  # seconds

    async def complete(self, prompt: str) -> str:
        """Send prompt to LLM with retry and timeout."""
        for attempt in range(3):
            try:
                response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=self.temperature,
                        max_tokens=self.max_tokens,
                    ),
                    timeout=self.timeout
                )
                return response.choices[0].message.content.strip()

            except asyncio.TimeoutError:
                logger.warning("llm_timeout", attempt=attempt)
                if attempt == 2:
                    raise
                await asyncio.sleep(2 ** attempt)  # 1s, 2s, 4s backoff

            except Exception as e:
                logger.error("llm_error", error=str(e), attempt=attempt)
                if attempt == 2:
                    raise
                await asyncio.sleep(1)
```

---

## 6. Explainer Service

```python
# services/ai_service/explainer.py
from cachetools import TTLCache
from app.services.ai_service.llm_client import LLMClient
from app.services.ai_service.prompts import build_prompt
from app.services.ai_service.fallback import generate_fallback

CACHE_TTL = 3600  # 1 hour
CACHE_SIZE = 2000

class ExplainerService:
    def __init__(self):
        self.llm = LLMClient()
        self.cache = TTLCache(maxsize=CACHE_SIZE, ttl=CACHE_TTL)

    async def explain(self, context_type: str, context_data: dict) -> str:
        # Deterministic cache key from context
        cache_key = f"{context_type}:{hash(frozenset(str(context_data).items()))}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        try:
            prompt = build_prompt(context_type, context_data)
            explanation = await self.llm.complete(prompt)
            self.cache[cache_key] = explanation
            return explanation

        except Exception as e:
            logger.warning("ai_explain_failed", context_type=context_type, error=str(e))
            # Fallback to structured template — system still works
            return generate_fallback(context_type, context_data)
```

---

## 7. Fallback Explanations

The system must work when the LLM API is unavailable.

```python
# services/ai_service/fallback.py
FALLBACK_TEMPLATES = {
    'risk_score': (
        "Your financial resilience score is {risk_score}/100, placing you in the '{risk_category}' category. "
        "The main contributing factors are: {risk_factors_summary}. "
        "Reviewing the recommendations below can help improve your score."
    ),
    'forecast_summary': (
        "Your projected minimum balance over the next 90 days is ₹{minimum_balance:,.0f} on {minimum_balance_date}. "
        "There are {low_balance_count} dates where your balance may fall below the safe threshold."
    ),
    'intervention': (
        "We recommend: {title}. "
        "Acting on this could improve your resilience score by approximately {impact_summary}."
    ),
    'loan_comparison': (
        "{lender_name} is the best-fit option based on a composite score of {composite_score}/100, "
        "balancing total cost, EMI affordability, and impact on your financial health."
    ),
}

def generate_fallback(context_type: str, context_data: dict) -> str:
    template = FALLBACK_TEMPLATES.get(
        context_type,
        "Based on your financial data, please review the detailed breakdown above."
    )
    try:
        return template.format(**context_data)
    except KeyError:
        return "Please review the detailed information above."
```

---

## 8. API Endpoint

### POST /api/v1/ai/explain

**Request:**
```json
{
  "context_type": "risk_score",
  "context_data": {
    "risk_score": 68.5,
    "risk_category": "watch",
    "score_change": -3.5,
    "monthly_income": 50000,
    "emi_to_income_ratio": 0.30,
    "emergency_fund_months": 3.1,
    "risk_factors": ["high debt burden", "low liquidity"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "Your resilience score of 68.5 puts you in the 'Watch' zone — not a crisis, but worth paying attention to. The main factors dragging your score down are your current debt-to-income ratio and a smaller-than-ideal emergency fund. The good news is that targeted actions like reducing discretionary spending could move you into 'Healthy' within a few months.",
    "generated_at": "2026-09-03T16:30:00Z",
    "is_fallback": false
  }
}
```

---

## 9. Security and Compliance

- **No PII in prompts:** Never include customer name, PAN, Aadhaar, account numbers
- **Use aggregated figures only:** Monthly income, ratios, scores — not raw transactions
- **Log all LLM calls:** context_type, latency, is_fallback (but NOT the prompt content)
- **LLM cannot initiate actions:** Explanation only, no side effects

---

## 10. Acceptance Criteria

- [ ] LLM explanations are generated for all six context types
- [ ] System returns a fallback explanation within 100ms when LLM is unavailable
- [ ] No PII reaches the LLM API
- [ ] LLM responses are cached and not re-fetched for identical inputs within TTL
- [ ] Temperature is 0.3 or lower to ensure consistent, factual tone
- [ ] All prompts instruct the LLM NOT to recalculate financial values

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: recommendation-engine-spec.md, requirements.md (FR-008)
