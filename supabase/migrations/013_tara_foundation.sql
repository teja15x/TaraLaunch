-- Tara foundation schema for lifecycle memory, experiences, evidence, journey, and actions.

create schema if not exists tara;

create table if not exists tara.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists tara.life_stages (
  id bigserial primary key,
  code text unique not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists tara.profiles (
  id uuid primary key references tara.users(id) on delete cascade,
  display_name text,
  age int,
  life_stage_id bigint references tara.life_stages(id),
  location text,
  education text,
  preferred_language text not null default 'en',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists tara.goals (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  title text not null,
  detail text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.constraints (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  category text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.memories (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  category text not null,
  memory_key text not null,
  memory_value text not null,
  confidence text not null default 'early-signal',
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, memory_key)
);

create table if not exists tara.conversations (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.messages (
  id bigserial primary key,
  conversation_id bigint not null references tara.conversations(id) on delete cascade,
  user_id uuid not null references tara.users(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists tara.experiences (
  id text primary key,
  version int not null,
  title text not null,
  domain text not null,
  career text,
  difficulty text not null,
  objective text not null,
  scenario text not null,
  state jsonb not null default '{}'::jsonb,
  choices jsonb not null default '[]'::jsonb,
  consequences jsonb not null default '[]'::jsonb,
  observable_behaviours jsonb not null default '[]'::jsonb,
  reflection_questions jsonb not null default '[]'::jsonb,
  evidence_rules jsonb not null default '[]'::jsonb,
  next_experiments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tara.experience_attempts (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  experience_id text not null references tara.experiences(id) on delete restrict,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.experience_states (
  id bigserial primary key,
  attempt_id bigint not null references tara.experience_attempts(id) on delete cascade,
  user_id uuid not null references tara.users(id) on delete cascade,
  step_id text not null,
  world_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tara.observations (
  id bigserial primary key,
  attempt_id bigint references tara.experience_attempts(id) on delete set null,
  user_id uuid not null references tara.users(id) on delete cascade,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists tara.evidence (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  observation text not null,
  evidence text not null,
  interpretation text not null,
  confidence text not null,
  unknown text,
  next_experiment text,
  created_at timestamptz not null default now()
);

create table if not exists tara.hypotheses (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  statement text not null,
  confidence text not null,
  unknown text,
  next_test text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.reflections (
  id bigserial primary key,
  attempt_id bigint references tara.experience_attempts(id) on delete set null,
  user_id uuid not null references tara.users(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists tara.decisions (
  id bigserial primary key,
  attempt_id bigint not null references tara.experience_attempts(id) on delete cascade,
  user_id uuid not null references tara.users(id) on delete cascade,
  step_id text not null,
  choice_id text not null,
  known_context text,
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists tara.decision_outcomes (
  id bigserial primary key,
  decision_id bigint not null references tara.decisions(id) on delete cascade,
  user_id uuid not null references tara.users(id) on delete cascade,
  consequence text not null,
  missed_signal text,
  learned text,
  created_at timestamptz not null default now()
);

create table if not exists tara.careers (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  tasks jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  work_environment text,
  education_routes jsonb not null default '[]'::jsonb,
  cost_notes text,
  location_notes text,
  compensation_notes text,
  market_outlook text,
  entry_paths jsonb not null default '[]'::jsonb,
  portfolio_requirements jsonb not null default '[]'::jsonb,
  misconceptions jsonb not null default '[]'::jsonb,
  is_verified_market_data boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tara.skills (
  id bigserial primary key,
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists tara.education_paths (
  id bigserial primary key,
  career_id bigint references tara.careers(id) on delete cascade,
  title text not null,
  route_type text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists tara.opportunities (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  career_id bigint references tara.careers(id) on delete set null,
  title text not null,
  source text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists tara.professionals (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  name text,
  role text,
  organization text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists tara.experiments (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  title text not null,
  reason text,
  status text not null default 'todo',
  result text,
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.projects (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  title text not null,
  summary text,
  evidence_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.next_actions (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  title text not null,
  reason text,
  status text not null default 'todo',
  deadline date,
  result text,
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.career_passports (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  career_id bigint references tara.careers(id) on delete set null,
  signal_strength text,
  evidence_summary text,
  unknown_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.future_self_entries (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  prediction_window text not null,
  entry_text text not null,
  review_due_at date,
  reviewed_at timestamptz,
  outcome_text text,
  created_at timestamptz not null default now()
);

create table if not exists tara.parent_shares (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  parent_reference text,
  share_goals boolean not null default false,
  share_reasoning boolean not null default false,
  share_evidence boolean not null default false,
  share_alternatives boolean not null default false,
  share_risks boolean not null default false,
  share_plan boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tara.consents (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tara.safety_events (
  id bigserial primary key,
  user_id uuid not null references tara.users(id) on delete cascade,
  severity text not null,
  category text not null,
  event_detail text not null,
  action_taken text,
  created_at timestamptz not null default now()
);

create table if not exists tara.analytics_events (
  id bigserial primary key,
  user_id uuid references tara.users(id) on delete set null,
  event_name text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tara_goals_user_id on tara.goals(user_id);
create index if not exists idx_tara_memories_user_id on tara.memories(user_id);
create index if not exists idx_tara_conversations_user_id on tara.conversations(user_id);
create index if not exists idx_tara_messages_conversation_id on tara.messages(conversation_id);
create index if not exists idx_tara_experience_attempts_user_id on tara.experience_attempts(user_id);
create index if not exists idx_tara_observations_user_id on tara.observations(user_id);
create index if not exists idx_tara_evidence_user_id on tara.evidence(user_id);
create index if not exists idx_tara_hypotheses_user_id on tara.hypotheses(user_id);
create index if not exists idx_tara_next_actions_user_id on tara.next_actions(user_id);
create index if not exists idx_tara_analytics_events_user_id on tara.analytics_events(user_id);
create index if not exists idx_tara_analytics_events_event_name on tara.analytics_events(event_name);

alter table tara.profiles enable row level security;
alter table tara.goals enable row level security;
alter table tara.constraints enable row level security;
alter table tara.memories enable row level security;
alter table tara.conversations enable row level security;
alter table tara.messages enable row level security;
alter table tara.experience_attempts enable row level security;
alter table tara.experience_states enable row level security;
alter table tara.observations enable row level security;
alter table tara.evidence enable row level security;
alter table tara.hypotheses enable row level security;
alter table tara.reflections enable row level security;
alter table tara.decisions enable row level security;
alter table tara.decision_outcomes enable row level security;
alter table tara.opportunities enable row level security;
alter table tara.professionals enable row level security;
alter table tara.experiments enable row level security;
alter table tara.projects enable row level security;
alter table tara.next_actions enable row level security;
alter table tara.career_passports enable row level security;
alter table tara.future_self_entries enable row level security;
alter table tara.parent_shares enable row level security;
alter table tara.consents enable row level security;
alter table tara.safety_events enable row level security;
alter table tara.analytics_events enable row level security;

create policy tara_profiles_owner on tara.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy tara_goals_owner on tara.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_constraints_owner on tara.constraints for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_memories_owner on tara.memories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_conversations_owner on tara.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_messages_owner on tara.messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_experience_attempts_owner on tara.experience_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_experience_states_owner on tara.experience_states for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_observations_owner on tara.observations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_evidence_owner on tara.evidence for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_hypotheses_owner on tara.hypotheses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_reflections_owner on tara.reflections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_decisions_owner on tara.decisions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_decision_outcomes_owner on tara.decision_outcomes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_opportunities_owner on tara.opportunities for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_professionals_owner on tara.professionals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_experiments_owner on tara.experiments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_projects_owner on tara.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_next_actions_owner on tara.next_actions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_career_passports_owner on tara.career_passports for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_future_self_entries_owner on tara.future_self_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_parent_shares_owner on tara.parent_shares for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_consents_owner on tara.consents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_safety_events_owner on tara.safety_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tara_analytics_events_owner on tara.analytics_events for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

insert into tara.life_stages(code, label)
values
  ('school', 'School student'),
  ('college', 'College student'),
  ('graduate', 'Recent graduate'),
  ('working', 'Working professional'),
  ('switcher', 'Career switcher'),
  ('entrepreneur', 'Entrepreneur'),
  ('unspecified', 'Unspecified')
on conflict (code) do nothing;
