-- Migration V4: Fix PUBLISHED status in exams

UPDATE exams SET status = 'IN_PROGRESS' WHERE status = 'PUBLISHED';
