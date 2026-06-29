-- Migration V3: Add an immediate exam

DO $$
BEGIN

    -- Insert Exam 5
    INSERT INTO exams (id, title, description, duration_minutes, available_from, available_until, max_attempts, total_marks, published, status, scheduled_start_time, module_id, group_id, created_by_id, created_at, updated_at) VALUES
    (5, 'Examen Flash - Maintenant', 'Un examen rapide de test disponible immédiatement pour le groupe M2 IL.', 30, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '1 day', 1, 5, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '1 hour', 5, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Insert Question 1
    INSERT INTO questions (id, statement, type, points, explanation, exam_id, question_bank_id, created_at, updated_at) VALUES
    (32, 'Le système fonctionne-t-il correctement ?', 'SINGLE_CHOICE', 5, 'Question de test pour valider que le système est opérationnel.', 5, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Insert Choices
    INSERT INTO choices (id, label, is_correct, question_id) VALUES
    (112, 'Oui', TRUE, 32),
    (113, 'Non', FALSE, 32);

    -- Reset Sequences
    PERFORM setval('exams_id_seq', COALESCE((SELECT MAX(id) FROM exams), 1));
    PERFORM setval('questions_id_seq', COALESCE((SELECT MAX(id) FROM questions), 1));
    PERFORM setval('choices_id_seq', COALESCE((SELECT MAX(id) FROM choices), 1));

END $$;
