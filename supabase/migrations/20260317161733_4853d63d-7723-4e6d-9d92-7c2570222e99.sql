
create table public.cart_recovery_conversations (
  id uuid default gen_random_uuid() primary key,
  cart_id text not null,
  phone text not null,
  customer_name text,
  cart_data jsonb,
  status text default 'aguardando_resposta',
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cart_recovery_conversations enable row level security;

create policy "Authenticated users can select cart_recovery_conversations"
on public.cart_recovery_conversations for select to authenticated using (true);

create policy "Authenticated users can insert cart_recovery_conversations"
on public.cart_recovery_conversations for insert to authenticated with check (true);

create policy "Authenticated users can update cart_recovery_conversations"
on public.cart_recovery_conversations for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete cart_recovery_conversations"
on public.cart_recovery_conversations for delete to authenticated using (true);
