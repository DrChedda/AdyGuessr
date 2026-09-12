-- Run this once in the Supabase SQL Editor.
-- Adds the two newest classic location questions.

insert into public.game_questions (id, mode, question, answers, correct_answer, target) values
  (
    'location-016',
    'locations',
    'Where was this image taken?',
    '["Level-0.5", "Level-0.35", "Level-0.7", "Level-0", "Level-558"]'::jsonb,
    'Level-0.7',
    null
  ),
  (
    'location-017',
    'locations',
    'Where was this image taken?',
    '["Level-1.1", "Dream Mall", "Level-124", "Level-94", "Level-1"]'::jsonb,
    'Level-1.1',
    null
  )
on conflict (id) do update set
  mode = excluded.mode,
  question = excluded.question,
  answers = excluded.answers,
  correct_answer = excluded.correct_answer,
  target = excluded.target;
