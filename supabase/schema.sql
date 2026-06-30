-- Cozmo CRM schema — reconstructed from lib/db/database.types.ts.
-- Creates the `cozmo` schema + 7 tables with the columns/types/FKs the app and
-- automation expect. Safe to re-run (IF NOT EXISTS / idempotent where possible).

create schema if not exists cozmo;

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ── accounts ────────────────────────────────────────────────────────────────
create table if not exists cozmo.accounts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  segment       text not null,
  website       text,
  domain        text,
  blurb         text,
  fit_reason    text,
  hq_city       text,
  hq_state      text,
  rank          integer,
  featured      boolean not null default false,
  mapped_page   text,
  source_url    text,
  enriched_json jsonb
);

-- ── campaigns ───────────────────────────────────────────────────────────────
create table if not exists cozmo.campaigns (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  segment    text not null,
  channel    text not null default 'email',
  status     text not null default 'draft'
);

-- ── contacts ────────────────────────────────────────────────────────────────
create table if not exists cozmo.contacts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_id uuid not null references cozmo.accounts(id) on delete cascade,
  name       text,
  title      text,
  email      text,
  phone      text,
  linkedin   text,
  confidence text
);

-- ── sequence_steps ──────────────────────────────────────────────────────────
create table if not exists cozmo.sequence_steps (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  campaign_id      uuid not null references cozmo.campaigns(id) on delete cascade,
  step_no          integer not null,
  delay_days       integer not null default 0,
  subject_template text,
  body_template    text
);

-- ── messages ────────────────────────────────────────────────────────────────
create table if not exists cozmo.messages (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  account_id   uuid not null references cozmo.accounts(id) on delete cascade,
  contact_id   uuid references cozmo.contacts(id) on delete set null,
  campaign_id  uuid references cozmo.campaigns(id) on delete set null,
  channel      text not null default 'email',
  step_no      integer not null default 1,
  subject      text,
  body         text,
  status       text not null default 'draft',
  send_mode    text not null default 'draft',
  provider_id  text,
  scheduled_at timestamptz,
  sent_at      timestamptz
);

-- ── calls ───────────────────────────────────────────────────────────────────
create table if not exists cozmo.calls (
  id                         uuid primary key default gen_random_uuid(),
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  account_id                 uuid references cozmo.accounts(id) on delete set null,
  contact_id                 uuid references cozmo.contacts(id) on delete set null,
  to_number                  text,
  trigger                    text not null default 'manual',
  status                     text not null default 'queued',
  outcome                    text,
  duration_s                 integer,
  demo_booked                boolean not null default false,
  recording_url              text,
  transcript                 text,
  elevenlabs_conversation_id text
);

-- ── activity ────────────────────────────────────────────────────────────────
create table if not exists cozmo.activity (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_id uuid references cozmo.accounts(id) on delete cascade,
  type       text not null,
  summary    text,
  meta_json  jsonb
);

-- ── helpful indexes ─────────────────────────────────────────────────────────
create index if not exists idx_contacts_account   on cozmo.contacts(account_id);
create index if not exists idx_messages_account    on cozmo.messages(account_id);
create index if not exists idx_messages_campaign   on cozmo.messages(campaign_id);
create index if not exists idx_calls_account       on cozmo.calls(account_id);
create index if not exists idx_activity_account    on cozmo.activity(account_id);
create index if not exists idx_seqsteps_campaign   on cozmo.sequence_steps(campaign_id);

-- ── expose cozmo to PostgREST + grant the API roles ─────────────────────────
grant usage on schema cozmo to anon, authenticated, service_role;
grant all on all tables in schema cozmo to anon, authenticated, service_role;
grant all on all sequences in schema cozmo to anon, authenticated, service_role;
alter default privileges in schema cozmo
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema cozmo
  grant all on sequences to anon, authenticated, service_role;
