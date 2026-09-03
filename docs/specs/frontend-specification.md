# FinShield — Frontend Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

This document specifies frontend requirements, component architecture, UI/UX patterns, and page specifications.

---

## 2. Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Query (TanStack Query) + Context API
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios

---

## 3. Page Specifications

### 3.1 Customer Pages

#### Dashboard (`/dashboard`)
**Purpose:** Primary landing page showing financial health overview

**Components:**
- ResilienceScoreCard — Current score with gauge
- CashFlowForecastChart — 90-day projection
- InterventionsWidget — Active recommendations
- RecentTransactions — Last 10 transactions
- QuickActions — Navigate to key features

**API Calls:**
- GET /risk/score
- GET /forecast?days=90
- GET /interventions?status=pending
- GET /transactions?limit=10

#### Financial Health (`/health`)
**Purpose:** Detailed risk score analysis

**Components:**
- ScoreGauge — Large visual score
- RiskFactorBreakdown — All 5 factors with explanations
- ScoreHistory — Trend chart
- AIExplanation — Natural language insights
- ImprovementSuggestions — Actionable tips

**API Calls:**
- GET /risk/score
- GET /risk/history?days=180

#### Cash Flow Forecast (`/forecast`)
**Purpose:** Visualize future cash position

**Components:**
- TimelineChart — Daily balance projection
- AlertsPanel — Low balance warnings
- IncomeExpenseBreakdown — Categorical view
- ConfidenceIndicator — Prediction reliability

**API Calls:**
- GET /forecast?days=90

#### Loan Comparison (`/loans/compare`)
**Purpose:** Compare loan options

**Components:**
- ComparisonForm — Amount, tenure, purpose
- ProductComparisonTable — Side-by-side view
- BestFitHighlight — Recommended product
- DetailedBreakdown — EMI schedule, cost analysis
- ImpactVisualization — Effect on financial health

**API Calls:**
- POST /loans/compare

#### What-If Simulator (`/simulator`)
**Purpose:** Model loan scenarios

**Components:**
- SimulatorForm — Interactive sliders
- RealtimeCalculations — Live EMI display
- BeforeAfterComparison — Current vs projected
- ImpactMetrics — Risk score, surplus changes

**API Calls:**
- POST /simulator/loan

### 3.2 Officer Pages

#### Officer Dashboard (`/officer/dashboard`)
**Purpose:** Portfolio overview

**Components:**
- PortfolioSummary — Total customers, risk distribution
- AtRiskCustomers — Priority list
- RecentAlerts — Intervention triggers
- CustomerSearch — Find and filter

**API Calls:**
- GET /officer/customers
- GET /officer/customers?risk_category=critical

#### Customer Detail (`/officer/customers/[id]`)
**Purpose:** Deep dive into customer financials

**Components:**
- CustomerProfile — Personal details
- FinancialSummary — Key metrics
- RiskAssessment — Current score and factors
- InterventionHistory — Past recommendations
- ActionButtons — Contact, review, approve

**API Calls:**
- GET /officer/customers/{id}/details
- GET /risk/score (for customer)
- GET /interventions (for customer)

---

## 4. Component Specifications

### 4.1 ResilienceScoreCard

```typescript
interface ResilienceScoreCardProps {
  score: number;
  category: 'critical' | 'at_risk' | 'watch' | 'healthy';
  previousScore?: number;
  trend?: 'improving' | 'stable' | 'declining';
  loading?: boolean;
}

// Styling:
// - Use color based on category
// - Animate score changes
// - Show trend indicator with arrow
// - Responsive: full-width on mobile
```

### 4.2 CashFlowChart

```typescript
interface CashFlowChartProps {
  projections: Array<{
    date: string;
    projectedBalance: number;
    inflows: number;
    outflows: number;
  }>;
  currentBalance: number;
  minimumSafeBalance: number;
  alerts: Array<{
    date: string;
    balance: number;
    reason: string;
  }>;
}

// Chart Type: Area Chart
// X-Axis: Dates
// Y-Axis: Balance in ₹
// Colors:
// - Green area: Above safe balance
// - Yellow area: Below safe balance
// - Red markers: Critical dates
```

### 4.3 LoanComparisonTable

```typescript
interface LoanComparisonTableProps {
  products: Array<{
    lender: string;
    productName: string;
    interestRate: number;
    emi: number;
    totalCost: number;
    rank: number;
    isBestFit: boolean;
    scores: {
      compositeScore: number;
      // ... other scores
    };
  }>;
  sortBy: string;
  onSort: (column: string) => void;
}

// Features:
// - Sortable columns
// - Highlight best fit row
// - Expandable details
// - Responsive: Horizontal scroll on mobile
```

---

## 5. Styling Guidelines

### 5.1 Typography

```css
/* Headings */
h1: text-3xl font-bold (32px)
h2: text-2xl font-semibold (24px)
h3: text-xl font-semibold (20px)
h4: text-lg font-medium (18px)

/* Body */
body: text-base (16px)
small: text-sm (14px)
caption: text-xs (12px)

/* Font Family */
font-family: Inter, system-ui, sans-serif
```

### 5.2 Spacing

```css
/* Spacing Scale (Tailwind) */
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)

/* Card Padding */
Mobile: p-4 (16px)
Desktop: p-6 (24px)

/* Section Gaps */
gap-4 (16px) — Between cards
gap-6 (24px) — Between sections
```

### 5.3 Colors (Tailwind Classes)

```typescript
const colorClasses = {
  risk: {
    critical: 'bg-red-50 text-red-700 border-red-200',
    atRisk: 'bg-amber-50 text-amber-700 border-amber-200',
    watch: 'bg-blue-50 text-blue-700 border-blue-200',
    healthy: 'bg-green-50 text-green-700 border-green-200',
  },
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }
};
```

---

## 6. Responsive Design

### 6.1 Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};
```

### 6.2 Layout Patterns

**Dashboard Layout:**
- Mobile: Single column, stacked cards
- Tablet: 2-column grid
- Desktop: 3-column grid with sidebar

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

---

## 7. State Management

### 7.1 Global State (Context)

```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ThemeContext
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### 7.2 Server State (React Query)

```typescript
// Example: Risk Score Query
const { data, isLoading, error } = useQuery({
  queryKey: ['riskScore'],
  queryFn: () => api.getRiskScore(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## 8. Form Handling

### 8.1 Form Validation with Zod

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loanComparisonSchema = z.object({
  amount: z.number()
    .min(10000, 'Minimum amount is ₹10,000')
    .max(5000000, 'Maximum amount is ₹50,00,000'),
  tenure: z.number()
    .min(6, 'Minimum tenure is 6 months')
    .max(120, 'Maximum tenure is 120 months'),
  loanType: z.enum(['personal', 'home', 'auto', 'education']),
});

type LoanComparisonForm = z.infer<typeof loanComparisonSchema>;

function LoanComparisonForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoanComparisonForm>({
    resolver: zodResolver(loanComparisonSchema),
  });

  const onSubmit = (data: LoanComparisonForm) => {
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 9. Error Handling

### 9.1 Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 9.2 API Error Display

```typescript
function ErrorAlert({ error }: { error: ApiError }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || 'An unexpected error occurred'}
      </AlertDescription>
    </Alert>
  );
}
```

---

## 10. Performance Optimization

### 10.1 Code Splitting

```typescript
// Lazy load heavy components
const LoanComparison = lazy(() => import('@/components/LoanComparison'));
const CashFlowChart = lazy(() => import('@/components/CashFlowChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LoanComparison />
    </Suspense>
  );
}
```

### 10.2 Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);
```

---

## 11. Accessibility

### 11.1 ARIA Labels

```tsx
<button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  <X className="h-4 w-4" />
</button>
```

### 11.2 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible

---

## 12. Testing

### 12.1 Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ResilienceScoreCard } from './ResilienceScoreCard';

test('displays risk score correctly', () => {
  render(<ResilienceScoreCard score={68.5} category="watch" />);
  expect(screen.getByText('68.5')).toBeInTheDocument();
  expect(screen.getByText('Watch')).toBeInTheDocument();
});
```

### 12.2 E2E Tests

```typescript
test('loan comparison flow', async ({ page }) => {
  await page.goto('/loans/compare');
  await page.fill('input[name="amount"]', '200000');
  await page.selectOption('select[name="tenure"]', '24');
  await page.click('button:has-text("Compare")');
  await expect(page.locator('.best-fit-badge')).toBeVisible();
});
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: design.md, project-structure.md
