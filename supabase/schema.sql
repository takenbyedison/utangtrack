create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.borrowers (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.users(id) on delete cascade,
  borrower_id uuid not null references public.borrowers(id) on delete cascade,
  principal numeric(12, 2) not null check (principal > 0),
  balance numeric(12, 2) not null check (balance >= 0),
  due_date date not null,
  purpose text not null,
  status text not null check (
    status in (
      'pending confirmation',
      'confirmed',
      'disputed',
      'active',
      'overdue',
      'partially paid',
      'paid'
    )
  ),
  borrower_response text check (borrower_response in ('confirmed', 'disputed')),
  dispute_reason text,
  confirmation_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  lender_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at date not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  lender_id uuid not null references public.users(id) on delete cascade,
  channel text not null default 'mock' check (channel = 'mock'),
  message text not null,
  sent_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.borrowers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;
alter table public.reminders enable row level security;

create policy "Users can read themselves"
on public.users for select
using (auth.uid() = id);

create policy "Users can insert themselves"
on public.users for insert
with check (auth.uid() = id);

create policy "Users can update themselves"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Lenders manage own borrowers"
on public.borrowers for all
using (auth.uid() = lender_id)
with check (auth.uid() = lender_id);

create policy "Lenders manage own loans"
on public.loans for all
using (auth.uid() = lender_id)
with check (auth.uid() = lender_id);

create policy "Lenders manage own payments"
on public.payments for all
using (auth.uid() = lender_id)
with check (auth.uid() = lender_id);

create policy "Lenders manage own reminders"
on public.reminders for all
using (auth.uid() = lender_id)
with check (auth.uid() = lender_id);

create index borrowers_lender_id_idx on public.borrowers(lender_id);
create index loans_lender_id_idx on public.loans(lender_id);
create index loans_confirmation_token_idx on public.loans(confirmation_token);
create index payments_loan_id_idx on public.payments(loan_id);
create index reminders_loan_id_idx on public.reminders(loan_id);

create or replace function public.get_loan_confirmation(invite_token uuid)
returns table (
  loan_id uuid,
  borrower_name text,
  purpose text,
  principal numeric,
  due_date date,
  status text,
  borrower_response text,
  dispute_reason text
)
language sql
security definer
set search_path = public
as $$
  select
    loans.id as loan_id,
    borrowers.full_name as borrower_name,
    loans.purpose,
    loans.principal,
    loans.due_date,
    loans.status,
    loans.borrower_response,
    loans.dispute_reason
  from public.loans
  join public.borrowers on borrowers.id = loans.borrower_id
  where loans.confirmation_token = invite_token
  limit 1;
$$;

create or replace function public.submit_loan_confirmation(
  invite_token uuid,
  response_value text,
  dispute_reason_value text default null
)
returns table (
  loan_id uuid,
  status text,
  borrower_response text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if response_value not in ('confirmed', 'disputed') then
    raise exception 'Invalid borrower response';
  end if;

  return query
  update public.loans
  set
    borrower_response = response_value,
    status = response_value,
    dispute_reason = case
      when response_value = 'disputed' then nullif(dispute_reason_value, '')
      else null
    end
  where confirmation_token = invite_token
  returning loans.id, loans.status, loans.borrower_response;
end;
$$;

grant execute on function public.get_loan_confirmation(uuid) to anon, authenticated;
grant execute on function public.submit_loan_confirmation(uuid, text, text) to anon, authenticated;
