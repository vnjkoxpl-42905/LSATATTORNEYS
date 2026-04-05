-- Add onboarding fields to the students table so we can store
-- target score, test date, and primary weakness per user.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS target_score   int,
  ADD COLUMN IF NOT EXISTS test_date      date,
  ADD COLUMN IF NOT EXISTS primary_weakness text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
