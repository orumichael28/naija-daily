-- 20261025000000_init_schema.sql
-- Naija Daily Core Schema

-- 1. PUZZLES TABLE
create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  game text not null check (game in ('wordle', 'connections', 'crossword', 'wordsearch')),
  puzzle_date date not null,
  payload jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_game_puzzle_date unique (game, puzzle_date)
);

create index if not exists idx_puzzles_game_date on public.puzzles (game, puzzle_date);
create index if not exists idx_puzzles_status on public.puzzles (status);

-- 2. WORDS TABLE
create table if not exists public.words (
  word text primary key,
  source text not null check (source in ('english', 'naija', 'answer', 'approved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_words_source on public.words (source);

-- 3. REJECTED GUESSES TABLE
create table if not exists public.rejected_guesses (
  word text primary key,
  count int not null default 1,
  last_seen timestamptz not null default now()
);

create index if not exists idx_rejected_guesses_count on public.rejected_guesses (count desc);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.puzzles enable row level security;
alter table public.words enable row level security;
alter table public.rejected_guesses enable row level security;

-- Puzzles:
-- Public clients cannot select, insert, update, or delete directly from the puzzles table.
-- All puzzle interactions occur via server endpoints with the service role key or validated Lagos date.
-- No public policy is granted on puzzles. (Deny all for anon/authenticated clients by default).

-- Words:
-- Allow public clients to read verified words for guess validation if needed,
-- but mutations only allowed via service role.
create policy "Allow public read access to words"
  on public.words
  for select
  to public
  using (true);

-- Rejected guesses:
-- Public clients cannot read or modify rejected_guesses directly.
-- Logged strictly via server-side API routes using the service role key.

