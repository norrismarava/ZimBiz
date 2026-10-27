# ZimBiz Connect — System Overview

How the platform works, who uses it, and how it's meant to make money.

## What it is

A trust-first business marketplace for Zimbabwe. Customers discover
businesses, verify their claims, request quotations, and review completed
work. Businesses build a portable reputation ("trust passport") instead of
relying on word-of-mouth alone.

## Roles

| Role | What they do |
|------|--------------|
| `CUSTOMER` | Search, post requests, compare quotes, message, review |
| `BUSINESS_OWNER` | Own/manage business profiles, respond to requests, send quotes |
| `INDIVIDUAL_PROVIDER` | Informal/solo providers (same flows, lighter verification) |
| `VERIFICATION_OFFICER` | Reviews verification submissions, approves/rejects |
| `MODERATOR` | Moderates reviews, reports, disputes |
| `ADMIN` | Full access: roles, categories, verification types, feature flags |

Roles + granular permissions are rows in `Role`/`Permission`/`UserRole`
(seeded: admin@, officer@, customer@ — password `Password123`).

## Core workflows

### 1. Auth
- Email + password → bcrypt hash → session row + `zb_session` cookie (30 days).
- Implemented: `src/lib/auth.ts`, `/api/auth/{login,register,logout}`,
  middleware reads session in `layout.tsx`.

### 2. Business lifecycle
`DRAFT → PENDING_REVIEW → PUBLISHED` (+ `REJECTED/PAUSED/ARCHIVED/REMOVED`).
- Owner registers → creates `Business` (name, category, location, contacts,
  `logoUrl`/`coverImageUrl`) → publishes.
- `profileFreshness` (`FreshnessLabel`) decays over time unless the owner
  reconfirms — the "may be outdated" honesty signal.
- Implemented: `/business/[slug]`, `/search`, dashboard shell.

### 3. Verification ("trust passport")
- `VerificationType` rows define what can be proven (business registration,
  ZIMRA tax clearance, physical site visit — seeded).
- Owner submits `VerificationCase` + `VerificationEvidence` → officer reviews
  → `VerificationDecision` → business gets `verificationStatus`:
  `NOT_SUBMITTED → PENDING → VERIFIED` (+ REJECTED).
- `TrustPassportItem` = public, plain-language record of each check.
- UI exists: `/verification`; officer flow partially implemented.

### 4. Request → Quote → Work → Review  (the money loop)
1. Customer posts `CustomerRequest` (category, location, budget,
   category-specific `RequestAnswer` fields via `CategoryFieldDefinition`).
2. Platform matches providers → `RequestMatch` (by category + location).
3. Providers send `Quote` (+ `QuoteLine` items, `QuoteRevision`s).
4. Customer compares → accepts a quote.
5. Work tracked via `WorkRecord` + `WorkMilestone` (+ `Payment` for deposits).
6. `ReviewEligibility` gates reviews to real engagements → `Review` +
   `ReviewDimension` (quality, price, communication, timeliness) +
   `ReviewResponse` (owner reply) + moderation via `ReviewFlag`/
   `ReviewModerationDecision`.
- API exists: `/api/requests`, `/api/quotes`. Pages: `/request`,
  `/request/new`, `/request/[id]`, `/dashboard`.
- Side-channels: `Conversation`/`Message`/`MessageAttachment`,
  `OutcomeConfirmation` (both parties confirm completion),
  `Dispute`, `Report`.

### 5. Moderation & integrity
`ModerationCase`/`ModerationAction` queue, `DuplicateCandidate` (dedupe),
`BusinessClaim` (claim an unclaimed listing), `AuditLog` on admin actions,
`SupportTicket`.

## Data model map (78 tables)

- **Identity**: User, UserProfile, UserRole, Role, Permission, Session,
  ConsentRecord, DataExportRequest, AccountDeletionRequest
- **Directory**: Business, BusinessBranch, BusinessContact, BusinessMember,
  BusinessHours, Address, Location, Region, Country, Category,
  CategoryFieldDefinition, PortfolioItem
- **Offers**: Service, Product, ProviderProfile, ServiceArea
- **Trust**: VerificationType/Requirement/Case/Evidence/Decision,
  TrustPassportItem, FreshnessLabel
- **Demand**: CustomerRequest, RequestAnswer, RequestMatch, Quote,
  QuoteLine, QuoteRevision
- **Delivery**: WorkRecord, WorkMilestone, Payment, Refund, Invoice,
  Subscription, SubscriptionPlan
- **Reputation**: Review + dimensions/eligibility/flags/response,
  ModerationCase/Action, Dispute, Report, Follow, Favourite, SavedSearch
- **Growth**: Promotion, Campaign, CampaignMetric, Lead, LeadAssignment,
  LeadNote, Notification(Preference), FeatureFlag

## Revenue model (designed, schema-ready)

| Lever | How it earns | Schema | Implemented? |
|-------|--------------|--------|--------------|
| **Subscriptions** | Monthly/annual plans for businesses (better placement, more quotes, analytics) | `SubscriptionPlan`, `Subscription`, `Invoice`, `Payment` | ❌ Schema only — no checkout, plan UI, or entitlement checks yet |
| **Featured/Promoted listings** | Pay to surface in search/category | `Promotion`, `Campaign`, `CampaignMetric` | ❌ Schema only |
| **Lead fees** | Charge providers per accepted request/contact | `Lead`, `LeadAssignment`, `LeadNote` | ❌ Schema only |
| **Transaction fee** | % on `Payment`/milestones if payments go through the platform | `Payment`, `Refund` | ❌ Not built (off-platform payments today) |

**Subscriptions status (as of 2026-10-27):** the tables exist and are
migrated, but nothing reads or writes them — no API routes, no dashboard
billing page, no payment-gateway integration (Paynow/Ecocash/Stripe would
be the ZW-fit options). The `/pricing` page is static marketing copy.
Recommended first move: pick Paynow for ZW payments, gate one premium
feature (e.g. promoted placement or unlimited quotes), wire a `Subscription`
row on successful payment callback, and check it in the search/quote code.

## Suggested rollout order for revenue

1. **Keep it free to list** (supply matters most now).
2. **Verification credibility = free** (it's the product's promise).
3. First paid lever: **featured placement** or **provider subscription**
   (providers already pay for leads elsewhere; customers shouldn't pay).
4. Lead fees once request→quote volume justifies it.
5. Transaction fees only if in-platform payments launch.

## Ops / infra

- **DB**: Neon Postgres (`DATABASE_URL`), Prisma 7 + `@prisma/adapter-neon`
  (over 443 — local network blocks 5432; see `AGENTS.md`).
- **Host**: Render — build `npm install && npx prisma migrate deploy && npm run build`,
  start `npm run start`. Migrations in `prisma/migrations/`, applied via
  `migrate deploy` on Render or `npm run db:apply <name>` locally over 443.
- **Seed**: `npm run db:seed` (jiti) — roles, categories (18, with images),
  locations, verification types, 36 demo businesses.
- **Media**: category/business images live in `public/images/` (downloaded
  assets, no external hotlink dependency).
