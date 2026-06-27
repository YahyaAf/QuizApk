-- Migration V4: Reseed Expert Data

DO $$
BEGIN
    -- Seeding only if the environment requires it, or we force it.
    -- We will truncate the tables to replace with expert data.
    TRUNCATE TABLE results, answer_choices, answers, submissions, choices, questions, exams, user_badges, badges, users, student_groups, modules RESTART IDENTITY CASCADE;

    -- 1. Insert Modules
    INSERT INTO modules (id, name, description, created_at, updated_at) VALUES
    (1, 'Génie Logiciel & Architecture', 'Conception et architecture logicielle, patrons de conception (Design Patterns), et Microservices.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Data Science & Machine Learning', 'Apprentissage automatique, réseaux de neurones, et analyse de données massives.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Cloud Computing & DevOps', 'Déploiement continu, Docker, Kubernetes, et infrastructures AWS/GCP.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 2. Insert Student Groups
    INSERT INTO student_groups (id, name, description, created_at, updated_at) VALUES
    (1, 'Master Ingénierie Logicielle (M2)', 'Étudiants en dernière année spécialisés en développement et architecture.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Master Data & IA (M2)', 'Étudiants spécialisés en Intelligence Artificielle.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Licence Informatique (L3)', 'Étudiants en fin de cycle licence.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 3. Insert Badges
    INSERT INTO badges (id, name, description, icon_url, created_at, updated_at) VALUES
    (1, 'Expert Architecte', 'Obtenu avec un score parfait en Architecture Logicielle.', 'Award', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Data Scientist Pro', 'Excellence démontrée en IA.', 'Brain', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Vitesse Éclair', 'A terminé un examen en un temps record avec plus de 90%.', 'Zap', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 4. Insert Users (Real Names, Expert Context)
    -- All passwords are set to 'password' (or whatever the hash from V2 is).
    -- Hash: $2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS
    INSERT INTO users (id, email, password, first_name, last_name, role, blocked, group_id, created_at, updated_at) VALUES
    -- Admin
    (1, 'admin@expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Directeur', 'Pédagogique', 'ROLE_ADMIN', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Teachers
    (2, 'karim.lahlou@expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Karim', 'Lahlou', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'nadia.benali@expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Nadia', 'Benali', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Students (Mix of Groups)
    (4, 'yassine.mansouri@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Yassine', 'Mansouri', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'salma.chraibi@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Salma', 'Chraibi', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'amine.kabbaj@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Amine', 'Kabbaj', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'hind.tazi@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Hind', 'Tazi', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 'omar.berrada@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Omar', 'Berrada', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9, 'sara.alaoui@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Sara', 'Alaoui', 'ROLE_STUDENT', FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 'mehdi.bennani@etudiant.expert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Mehdi', 'Bennani', 'ROLE_STUDENT', FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 5. Insert Exams
    INSERT INTO exams (id, title, description, duration_minutes, available_from, available_until, max_attempts, total_marks, published, status, scheduled_start_time, module_id, group_id, created_by_id, created_at, updated_at) VALUES
    -- Exam 1: Microservices (Prof: Karim Lahlou)
    (1, 'Architecture Microservices avec Spring Boot', 'Évaluation approfondie sur la conception, le déploiement et la communication des microservices (Eureka, Feign, Gateway).', 45, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days', 1, 10, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '15 days', 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Exam 2: Machine Learning (Prof: Nadia Benali)
    (2, 'Machine Learning Fondamentaux', 'Concepts de base, Overfitting, Régression Linéaire et Logistique.', 60, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '20 days', 1, 10, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '5 days', 2, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 6. Insert Questions
    -- Microservices Exam (Exam 1)
    INSERT INTO questions (id, statement, type, points, explanation, exam_id, question_bank_id, created_at, updated_at) VALUES
    (1, 'Dans une architecture microservices, quel est le principal avantage de l''utilisation d''un Service Discovery comme Netflix Eureka ?', 'MULTIPLE_CHOICE', 5, 'Eureka permet aux microservices de s''enregistrer et de se découvrir dynamiquement sans configurer d''adresses IP statiques.', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Spring Cloud Gateway permet uniquement de faire du routage statique et ne peut pas appliquer de filtres sur les requêtes.', 'TRUE_FALSE', 5, 'Faux. Spring Cloud Gateway permet le routage dynamique et propose de nombreux filtres (ex: Rate Limiting, Authentification).', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Machine Learning Exam (Exam 2)
    (3, 'L''overfitting (surapprentissage) se produit lorsque le modèle :', 'SINGLE_CHOICE', 5, 'L''overfitting arrive quand le modèle mémorise le bruit des données d''entraînement et perd sa capacité de généralisation.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'La fonction d''activation Sigmoid est principalement utilisée pour :', 'SINGLE_CHOICE', 5, 'Elle mappe les valeurs entre 0 et 1, ce qui la rend idéale pour la régression logistique et la classification binaire.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 7. Insert Choices
    INSERT INTO choices (id, label, is_correct, question_id) VALUES
    -- Q1 Choices
    (1, 'Il réduit la latence du réseau à zéro.', FALSE, 1),
    (2, 'Il permet la découverte dynamique des instances de services sans adresses IP codées en dur.', TRUE, 1),
    (3, 'Il chiffre automatiquement toutes les communications inter-services.', FALSE, 1),
    (4, 'Il remplace la base de données relationnelle.', FALSE, 1),
    -- Q2 Choices
    (5, 'Vrai', FALSE, 2),
    (6, 'Faux', TRUE, 2),
    -- Q3 Choices
    (7, 'Est trop simple et ne capture pas la complexité des données.', FALSE, 3),
    (8, 'Apprend par cœur les données d''entraînement, y compris le bruit, et échoue sur de nouvelles données.', TRUE, 3),
    (9, 'Est entraîné avec trop peu de données.', FALSE, 3),
    -- Q4 Choices
    (10, 'La prédiction de valeurs continues (Régression linéaire)', FALSE, 4),
    (11, 'La classification binaire (valeurs entre 0 et 1)', TRUE, 4),
    (12, 'Le clustering non supervisé', FALSE, 4);

    -- 8. Insert Submissions (Simulating real passed exams with specific timings)
    INSERT INTO submissions (id, student_id, exam_id, start_time, submit_time, created_at, updated_at) VALUES
    -- EXAM 1: Microservices
    -- Yassine (id 4): Perfect score, very fast (Duration: 5 minutes)
    (1, 4, 1, CURRENT_TIMESTAMP - INTERVAL '1 days 02:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 01:55:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Salma (id 5): Perfect score, slower (Duration: 15 minutes) -> Will be ranked #2!
    (2, 5, 1, CURRENT_TIMESTAMP - INTERVAL '2 days 03:00:00', CURRENT_TIMESTAMP - INTERVAL '2 days 02:45:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Omar (id 8): Average score, fast (Duration: 8 minutes)
    (3, 8, 1, CURRENT_TIMESTAMP - INTERVAL '1 days 04:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 03:52:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- EXAM 2: Machine Learning
    -- Amine (id 6): Perfect score (Duration: 10 minutes)
    (4, 6, 2, CURRENT_TIMESTAMP - INTERVAL '1 days 05:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 04:50:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Hind (id 7): Perfect score, super fast (Duration: 4 minutes) -> Ranked #1!
    (5, 7, 2, CURRENT_TIMESTAMP - INTERVAL '3 days 10:00:00', CURRENT_TIMESTAMP - INTERVAL '3 days 09:56:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 9. Insert Answers
    INSERT INTO answers (id, submission_id, question_id, text_answer, teacher_score, teacher_feedback) VALUES
    -- Sub 1 (Yassine - Microservices 100%)
    (1, 1, 1, NULL, NULL, NULL), (2, 1, 2, NULL, NULL, NULL),
    -- Sub 2 (Salma - Microservices 100%)
    (3, 2, 1, NULL, NULL, NULL), (4, 2, 2, NULL, NULL, NULL),
    -- Sub 3 (Omar - Microservices 50%)
    (5, 3, 1, NULL, NULL, NULL), (6, 3, 2, NULL, NULL, NULL),
    
    -- Sub 4 (Amine - ML 100%)
    (7, 4, 3, NULL, NULL, NULL), (8, 4, 4, NULL, NULL, NULL),
    -- Sub 5 (Hind - ML 100%)
    (9, 5, 3, NULL, NULL, NULL), (10, 5, 4, NULL, NULL, NULL);

    -- 10. Insert Answer Choices
    INSERT INTO answer_choices (answer_id, choice_id) VALUES
    -- Yassine (100%)
    (1, 2), (2, 6),
    -- Salma (100%)
    (3, 2), (4, 6),
    -- Omar (50% - got Q1 right, Q2 wrong)
    (5, 2), (6, 5),
    
    -- Amine (100%)
    (7, 8), (8, 11),
    -- Hind (100%)
    (9, 8), (10, 11);

    -- 11. Insert Results (Crucial for Leaderboard)
    INSERT INTO results (id, submission_id, score, total_questions, correct_answers, wrong_answers, percentage, passed, pending_manual_grade, manually_graded, created_at, updated_at) VALUES
    -- Yassine: 10/10 (100%)
    (1, 1, 10.0, 2, 2, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Salma: 10/10 (100%)
    (2, 2, 10.0, 2, 2, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Omar: 5/10 (50%)
    (3, 3, 5.0, 2, 1, 1, 50.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Amine: 10/10 (100%)
    (4, 4, 10.0, 2, 2, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Hind: 10/10 (100%)
    (5, 5, 10.0, 2, 2, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 12. Reset Sequences safely using COALESCE
    PERFORM setval('badges_id_seq', COALESCE((SELECT MAX(id) FROM badges), 1));
    PERFORM setval('student_groups_id_seq', COALESCE((SELECT MAX(id) FROM student_groups), 1));
    PERFORM setval('modules_id_seq', COALESCE((SELECT MAX(id) FROM modules), 1));
    PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
    PERFORM setval('exams_id_seq', COALESCE((SELECT MAX(id) FROM exams), 1));
    PERFORM setval('questions_id_seq', COALESCE((SELECT MAX(id) FROM questions), 1));
    PERFORM setval('choices_id_seq', COALESCE((SELECT MAX(id) FROM choices), 1));
    PERFORM setval('submissions_id_seq', COALESCE((SELECT MAX(id) FROM submissions), 1));
    PERFORM setval('answers_id_seq', COALESCE((SELECT MAX(id) FROM answers), 1));
    PERFORM setval('results_id_seq', COALESCE((SELECT MAX(id) FROM results), 1));

END $$;
