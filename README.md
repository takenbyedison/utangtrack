# UtangTrack

Beginner-friendly MVP for private peer-to-peer loan tracking in the Philippines.

## What this MVP includes

- Landing page
- Register/login placeholder
- Private lender dashboard
- Borrower profile form
- Loan record form
- Loan detail page
- Add payment form
- Borrower confirmation/dispute page
- Mock reminder records only
- Supabase schema with row-level security for lender-owned records

## Safety boundaries

UtangTrack is not a public debtor database, blacklist, public credit score, or searchable credit history. Loan records are private to the lender, and borrowers can confirm or dispute invited loan records.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase project URL and anon key to `.env.local`.

4. Run the database SQL in `supabase/schema.sql`.

5. Start the app:

```bash
npm run dev
```
