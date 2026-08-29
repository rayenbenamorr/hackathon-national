# SERVICE BRIEF — Intelligent Treasury OS

**Ministry:** Finance
**Service id:** `treasury`
**Base path:** `/api/treasury`

## What this ministry is for

Make the budget a live object other ministries can query and react to — so a drought, an outage or an epidemic has a visible fiscal consequence the same day, not the following year.

## The three modules

### 1. Real-Time Treasury Twin

Live position of every budget line.

`src/modules/real-time-treasury-twin.ts`

### 2. AI Public Budget Optimizer

Reallocation proposals under an explicit constraint.

`src/modules/ai-public-budget-optimizer.ts`

### 3. Smart Aid Wallet

Targeted, traceable aid disbursement.

`src/modules/smart-aid-wallet.ts`

## What it owns

Authoritative for: `FinancialProgramRef`, `BudgetLineRef`, `AidWalletRef`.

Its own database namespace is `.data/treasury.json`, holding the
`budgetLines` collection (48 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                          |
| ------------ | --------------------------------------------------------------------------------------- |
| AI           | budget reallocation under constraint · fiscal anomaly detection · shock cost estimation |
| IoT          | —                                                                                       |
| Digital twin | budget line twin · programme twin                                                       |

## Connectivity

21 partner ministries. See `RELATIONS.md`.
