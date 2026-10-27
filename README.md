# ZimBiz Connect

**Zimbabwe's trusted business network.** Discover businesses, inspect verified information, compare quotations and learn from genuine customer experiences.

## Discover. Verify. Connect.

ZimBiz Connect is not a generic classifieds clone or static directory. It is a trust-first platform where every important business claim has a clear status, evidence type, verification method, date checked, and plain-language public explanation.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM v7
- **Auth:** Custom session-based auth with bcryptjs
- **Validation:** Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database connection string.

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Create database schema:**
   ```bash
   npm run db:push
   ```

5. **Seed the database:**
   ```bash
   npm run db:seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding, use these accounts (password: `Password123`):

| Role | Email |
|------|-------|
| Admin | admin@zimbiz.co.zw |
| Verification Officer | officer@zimbiz.co.zw |
| Customer | customer@zimbiz.co.zw |
| Business Owner | owner1-4@zimbiz.co.zw |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints (register, login, logout)
│   │   ├── categories/    # Category listing
│   │   ├── locations/     # Location listing
│   │   ├── requests/      # Customer request CRUD
│   │   └── quotes/        # Quotation CRUD
│   ├── auth/              # Auth pages (login, register)
│   ├── business/[slug]/   # Public business profile
│   ├── dashboard/         # User dashboard
│   ├── request/           # Request creation and detail
│   └── search/            # Search & discovery
├── components/
│   ├── layout/            # Header, Footer
│   └── ui/                # Reusable UI components
├── lib/
│   ├── auth.ts            # Session management & RBAC
│   ├── prisma.ts          # Prisma client singleton
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
└── generated/
    └── prisma/            # Generated Prisma client (gitignored)
```

## Core Features

### Trust Passport
Every business has a Trust Passport showing verification status for specific claims — not a single "verified" badge. Each verification shows:
- What was checked
- Evidence type and method
- When it was checked
- Who checked it
- Plain-language explanation

### Structured Quotations
Customers create detailed requests. Businesses respond with structured quotations including:
- Line items with quantities and unit prices
- Warranty information
- Timeline estimates
- Payment schedules
- Exclusions and assumptions

### Interaction-Linked Reviews
Reviews follow real interactions (work records, accepted quotes, completed requests). Each review is labeled by evidence type so readers know what's behind it.

### Fresh Information
The platform tracks when phone numbers, locations, hours and services were last reconfirmed. Stale profiles lose ranking priority.

## Pilot Scope

**Categories:** Solar & Electrical, Construction & Boreholes, Automotive, Events & Catering

**Locations:** Harare, Bulawayo and surrounding areas

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## License

Proprietary.  ZimBiz Connect.
