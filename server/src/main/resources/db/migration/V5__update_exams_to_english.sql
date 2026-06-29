-- Migration V5: Update exams 1, 2, and 3 to use module 5 (Anglais)

UPDATE exams SET module_id = 5 WHERE id IN (1, 2, 3);
