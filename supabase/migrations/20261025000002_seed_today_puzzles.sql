-- Seed today's published puzzles for Wordle and Connections (2026-10-25)

-- Wordle: "lagos" (Center of Excellence and Nigeria's commercial hub)
insert into public.puzzles (game, puzzle_date, payload, status)
values (
  'wordle',
  '2026-10-25',
  '{
    "date": "2026-10-25",
    "answer": "lagos",
    "hint": "Center of Excellence and Nigeria''s commercial heart"
  }'::jsonb,
  'published'
)
on conflict (game, puzzle_date) do update set
  payload = excluded.payload,
  status = excluded.status,
  updated_at = now();

-- Connections: 4 groups of 4 themed Nigerian culture categories
insert into public.puzzles (game, puzzle_date, payload, status)
values (
  'connections',
  '2026-10-25',
  '{
    "date": "2026-10-25",
    "groups": [
      {
        "id": 1,
        "label": "Naija Street Foods",
        "color": "yellow",
        "difficulty": 1,
        "words": ["SUYA", "AKARA", "PUFF-PUFF", "BOLI"]
      },
      {
        "id": 2,
        "label": "Nollywood Icons",
        "color": "green",
        "difficulty": 2,
        "words": ["GENEVIEVE", "OMOTOLA", "PETE", "RAMSEY"]
      },
      {
        "id": 3,
        "label": "Lagos Mainland Spots",
        "color": "blue",
        "difficulty": 3,
        "words": ["YABA", "IKEJA", "SURULERE", "MARYLAND"]
      },
      {
        "id": 4,
        "label": "Things You Chop in Naija",
        "color": "purple",
        "difficulty": 4,
        "words": ["FOOD", "KNUCKLE", "LIFE", "MONEY"]
      }
    ]
  }'::jsonb,
  'published'
)
on conflict (game, puzzle_date) do update set
  payload = excluded.payload,
  status = excluded.status,
  updated_at = now();

