-- V2: Seed complete test data for Quiz Platform

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users) THEN
        -- 1. Insert Badges
        INSERT INTO badges (id, name, description, created_at, updated_at) VALUES
        (1, 'Champion', 'Excellent score aux examens', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 'Progression', 'Meilleure amélioration du mois', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'Rapide', 'Termine toujours en premier', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 2. Insert Student Groups
        INSERT INTO student_groups (id, name, description, created_at, updated_at) VALUES
        (2, 'Génie Informatique - G1', 'Groupe 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'Génie Informatique - G2', 'Groupe 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 3. Insert Modules
        INSERT INTO modules (id, name, description, created_at, updated_at) VALUES
        (2, 'Développement Web', 'React & Spring Boot', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'Data Science', 'Python & Machine Learning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 4. Insert Users (Password: password123)
        INSERT INTO users (id, email, password, first_name, last_name, role, blocked, group_id, created_at, updated_at) VALUES
        (1, 'admin@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Admin', 'System', 'ROLE_ADMIN', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 'teacher@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Professeur', 'Principal', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'prof2@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Professeur', 'Secondaire', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (4, 'student@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Étudiant', 'Test', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 'student1@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 1', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (6, 'student2@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 2', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (7, 'student3@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 3', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (8, 'student4@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 4', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (9, 'student5@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 5', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (10, 'student6@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 6', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (11, 'student7@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 7', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (12, 'student8@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 8', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (13, 'student9@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 9', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (14, 'student10@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 10', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (15, 'student11@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 11', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (16, 'student12@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 12', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (17, 'student13@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 13', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (18, 'student14@PlatformExpert.ma', '$2b$10$Z4VOuOuopmIxt3v7vzy6l.ZCP0jOHyFOKnWQmCXSlxP0ys1kTunDS', 'Élève', 'Numéro 14', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 5. User Badges
        INSERT INTO user_badges (user_id, badge_id) VALUES
        (4, 1),
        (4, 2)
        ON CONFLICT DO NOTHING;

        -- 6. Insert Exams
        INSERT INTO exams (id, title, description, duration_minutes, available_from, available_until, max_attempts, total_marks, published, status, scheduled_start_time, module_id, group_id, created_by_id, created_at, updated_at) VALUES
        (1, 'Examen Final Web', 'Examen complet sur React', 60, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', 1, 10, TRUE, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days', 2, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 'Quiz Spring Boot', 'Test rapide Spring', 30, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP + INTERVAL '23 hours 30 minutes', 1, 6, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 2, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'Examen Data Science', 'Bases de l''IA', 120, CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '6 days', 1, 0, TRUE, 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '5 days', 3, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (4, 'Bases de la Programmation Java', 'Validez vos connaissances en Java : variables, héritage, chaînes de caractères et POO.', 20, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '10 days', 1, 28, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '1 day', 2, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 7. Insert Questions
        INSERT INTO questions (id, statement, type, points, explanation, exam_id, question_bank_id, created_at, updated_at) VALUES
        -- pastExam (id 1)
        (1, 'Quelle est la bonne réponse pour la question 1 de l''examen Examen Final Web ?', 'MULTIPLE_CHOICE', 2, NULL, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 'Quelle est la bonne réponse pour la question 2 de l''examen Examen Final Web ?', 'MULTIPLE_CHOICE', 2, NULL, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 'Quelle est la bonne réponse pour la question 3 de l''examen Examen Final Web ?', 'MULTIPLE_CHOICE', 2, NULL, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (4, 'Quelle est la bonne réponse pour la question 4 de l''examen Examen Final Web ?', 'MULTIPLE_CHOICE', 2, NULL, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 'Quelle est la bonne réponse pour la question 5 de l''examen Examen Final Web ?', 'MULTIPLE_CHOICE', 2, NULL, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        -- ongoingExam (id 2)
        (6, 'Quelle est la bonne réponse pour la question 1 de l''examen Quiz Spring Boot ?', 'MULTIPLE_CHOICE', 2, NULL, 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (7, 'Quelle est la bonne réponse pour la question 2 de l''examen Quiz Spring Boot ?', 'MULTIPLE_CHOICE', 2, NULL, 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (8, 'Quelle est la bonne réponse pour la question 3 de l''examen Quiz Spring Boot ?', 'MULTIPLE_CHOICE', 2, NULL, 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        -- javaExam (id 4)
        (9, 'Quelle est la taille en mémoire d''un type de données primitif ''double'' en Java ?', 'SINGLE_CHOICE', 5, 'En Java, un double est un nombre à virgule flottante double précision 64 bits IEEE 754, qui occupe 8 octets.', 4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (10, 'Les chaînes de caractères (Strings) en Java sont mutables, ce qui signifie que leur contenu peut être modifié après instanciation.', 'TRUE_FALSE', 3, 'Les chaînes sont immuables en Java. Toute opération qui modifie une chaîne renvoie une nouvelle instance de String.', 4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (11, 'Quels modificateurs d''accès peuvent être utilisés pour déclarer des classes et des membres de classe en Java ? (Sélectionnez tout ce qui s''applique)', 'MULTIPLE_CHOICE', 10, 'Les modificateurs d''accès Java sont public, protected, private, et package-private (pas de modificateur). ''internal'' est un modificateur Kotlin/C#.', 4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (12, 'Expliquez brièvement la différence entre la surcharge (Overloading) et la redéfinition (Overriding) de méthode en Java.', 'TEXT', 10, 'La surcharge se produit au sein de la même classe (même nom, arguments différents). La redéfinition se produit dans une sous-classe (même signature, comportement redéfini).', 4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 8. Insert Choices
        INSERT INTO choices (id, label, is_correct, question_id) VALUES
        -- Q1 (id 1)
        (1, 'Option A (Incorrecte)', FALSE, 1),
        (2, 'Option B (Correcte)', TRUE, 1),
        (3, 'Option C (Incorrecte)', FALSE, 1),
        (4, 'Option D (Incorrecte)', FALSE, 1),
        -- Q2 (id 2)
        (5, 'Option A (Incorrecte)', FALSE, 2),
        (6, 'Option B (Correcte)', TRUE, 2),
        (7, 'Option C (Incorrecte)', FALSE, 2),
        (8, 'Option D (Incorrecte)', FALSE, 2),
        -- Q3 (id 3)
        (9, 'Option A (Incorrecte)', FALSE, 3),
        (10, 'Option B (Correcte)', TRUE, 3),
        (11, 'Option C (Incorrecte)', FALSE, 3),
        (12, 'Option D (Incorrecte)', FALSE, 3),
        -- Q4 (id 4)
        (13, 'Option A (Incorrecte)', FALSE, 4),
        (14, 'Option B (Correcte)', TRUE, 4),
        (15, 'Option C (Incorrecte)', FALSE, 4),
        (16, 'Option D (Incorrecte)', FALSE, 4),
        -- Q5 (id 5)
        (17, 'Option A (Incorrecte)', FALSE, 5),
        (18, 'Option B (Correcte)', TRUE, 5),
        (19, 'Option C (Incorrecte)', FALSE, 5),
        (20, 'Option D (Incorrecte)', FALSE, 5),
        -- Q6 (id 6)
        (21, 'Option A (Incorrecte)', FALSE, 6),
        (22, 'Option B (Correcte)', TRUE, 6),
        (23, 'Option C (Incorrecte)', FALSE, 6),
        (24, 'Option D (Incorrecte)', FALSE, 6),
        -- Q7 (id 7)
        (25, 'Option A (Incorrecte)', FALSE, 7),
        (26, 'Option B (Correcte)', TRUE, 7),
        (27, 'Option C (Incorrecte)', FALSE, 7),
        (28, 'Option D (Incorrecte)', FALSE, 7),
        -- Q8 (id 8)
        (29, 'Option A (Incorrecte)', FALSE, 8),
        (30, 'Option B (Correcte)', TRUE, 8),
        (31, 'Option C (Incorrecte)', FALSE, 8),
        (32, 'Option D (Incorrecte)', FALSE, 8),
        -- Q9 (id 9)
        (33, '2 octets', FALSE, 9),
        (34, '4 octets', FALSE, 9),
        (35, '8 octets', TRUE, 9),
        (36, '16 octets', FALSE, 9),
        -- Q10 (id 10)
        (37, 'Vrai', FALSE, 10),
        (38, 'Faux', TRUE, 10),
        -- Q11 (id 11)
        (39, 'public', TRUE, 11),
        (40, 'internal', FALSE, 11),
        (41, 'protected', TRUE, 11),
        (42, 'friend', FALSE, 11)
        ON CONFLICT (id) DO NOTHING;

        -- 9. Insert Submissions
        INSERT INTO submissions (id, student_id, exam_id, start_time, submit_time, created_at, updated_at) VALUES
        (1, 4, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 5, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 6, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (4, 7, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 8, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (6, 9, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (7, 10, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (8, 11, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (9, 12, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (10, 13, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (11, 14, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (12, 15, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (13, 16, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (14, 17, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (15, 18, 1, CURRENT_TIMESTAMP - INTERVAL '10 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '10 days 21 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 10. Insert Answers
        INSERT INTO answers (id, submission_id, question_id, text_answer, teacher_score, teacher_feedback) VALUES
        -- S1 (Student 4): all correct (choice_id is Q * 4 - 2: 2, 6, 10, 14, 18)
        (1, 1, 1, NULL, NULL, NULL), (2, 1, 2, NULL, NULL, NULL), (3, 1, 3, NULL, NULL, NULL), (4, 1, 4, NULL, NULL, NULL), (5, 1, 5, NULL, NULL, NULL),
        -- S2 (Student 5): Q1-Q4 correct, Q5 wrong (choices: 2, 6, 10, 14, 17)
        (6, 2, 1, NULL, NULL, NULL), (7, 2, 2, NULL, NULL, NULL), (8, 2, 3, NULL, NULL, NULL), (9, 2, 4, NULL, NULL, NULL), (10, 2, 5, NULL, NULL, NULL),
        -- S3 (Student 6): Q1-Q3 correct, Q4-Q5 wrong (choices: 2, 6, 10, 13, 17)
        (11, 3, 1, NULL, NULL, NULL), (12, 3, 2, NULL, NULL, NULL), (13, 3, 3, NULL, NULL, NULL), (14, 3, 4, NULL, NULL, NULL), (15, 3, 5, NULL, NULL, NULL),
        -- S4 (Student 7): Q1-Q2 correct, Q3-Q5 wrong (choices: 2, 6, 9, 13, 17)
        (16, 4, 1, NULL, NULL, NULL), (17, 4, 2, NULL, NULL, NULL), (18, 4, 3, NULL, NULL, NULL), (19, 4, 4, NULL, NULL, NULL), (20, 4, 5, NULL, NULL, NULL),
        -- S5 (Student 8): all correct (choices: 2, 6, 10, 14, 18)
        (21, 5, 1, NULL, NULL, NULL), (22, 5, 2, NULL, NULL, NULL), (23, 5, 3, NULL, NULL, NULL), (24, 5, 4, NULL, NULL, NULL), (25, 5, 5, NULL, NULL, NULL),
        -- S6 (Student 9): Q1-Q4 correct, Q5 wrong (choices: 2, 6, 10, 14, 17)
        (26, 6, 1, NULL, NULL, NULL), (27, 6, 2, NULL, NULL, NULL), (28, 6, 3, NULL, NULL, NULL), (29, 6, 4, NULL, NULL, NULL), (30, 6, 5, NULL, NULL, NULL),
        -- S7 (Student 10): Q1-Q3 correct, Q4-Q5 wrong (choices: 2, 6, 10, 13, 17)
        (31, 7, 1, NULL, NULL, NULL), (32, 7, 2, NULL, NULL, NULL), (33, 7, 3, NULL, NULL, NULL), (34, 7, 4, NULL, NULL, NULL), (35, 7, 5, NULL, NULL, NULL),
        -- S8 (Student 11): Q1-Q2 correct, Q3-Q5 wrong (choices: 2, 6, 9, 13, 17)
        (36, 8, 1, NULL, NULL, NULL), (37, 8, 2, NULL, NULL, NULL), (38, 8, 3, NULL, NULL, NULL), (39, 8, 4, NULL, NULL, NULL), (40, 8, 5, NULL, NULL, NULL),
        -- S9 (Student 12): all correct (choices: 2, 6, 10, 14, 18)
        (41, 9, 1, NULL, NULL, NULL), (42, 9, 2, NULL, NULL, NULL), (43, 9, 3, NULL, NULL, NULL), (44, 9, 4, NULL, NULL, NULL), (45, 9, 5, NULL, NULL, NULL),
        -- S10 (Student 13): Q1-Q4 correct, Q5 wrong (choices: 2, 6, 10, 14, 17)
        (46, 10, 1, NULL, NULL, NULL), (47, 10, 2, NULL, NULL, NULL), (48, 10, 3, NULL, NULL, NULL), (49, 10, 4, NULL, NULL, NULL), (50, 10, 5, NULL, NULL, NULL),
        -- S11 (Student 14): Q1-Q3 correct, Q4-Q5 wrong (choices: 2, 6, 10, 13, 17)
        (51, 11, 1, NULL, NULL, NULL), (52, 11, 2, NULL, NULL, NULL), (53, 11, 3, NULL, NULL, NULL), (54, 11, 4, NULL, NULL, NULL), (55, 11, 5, NULL, NULL, NULL),
        -- S12 (Student 15): Q1-Q2 correct, Q3-Q5 wrong (choices: 2, 6, 9, 13, 17)
        (56, 12, 1, NULL, NULL, NULL), (57, 12, 2, NULL, NULL, NULL), (58, 12, 3, NULL, NULL, NULL), (59, 12, 4, NULL, NULL, NULL), (60, 12, 5, NULL, NULL, NULL),
        -- S13 (Student 16): all correct (choices: 2, 6, 10, 14, 18)
        (61, 13, 1, NULL, NULL, NULL), (62, 13, 2, NULL, NULL, NULL), (63, 13, 3, NULL, NULL, NULL), (64, 13, 4, NULL, NULL, NULL), (65, 13, 5, NULL, NULL, NULL),
        -- S14 (Student 17): Q1-Q4 correct, Q5 wrong (choices: 2, 6, 10, 14, 17)
        (66, 14, 1, NULL, NULL, NULL), (67, 14, 2, NULL, NULL, NULL), (68, 14, 3, NULL, NULL, NULL), (69, 14, 4, NULL, NULL, NULL), (70, 14, 5, NULL, NULL, NULL),
        -- S15 (Student 18): Q1-Q3 correct, Q4-Q5 wrong (choices: 2, 6, 10, 13, 17)
        (71, 15, 1, NULL, NULL, NULL), (72, 15, 2, NULL, NULL, NULL), (73, 15, 3, NULL, NULL, NULL), (74, 15, 4, NULL, NULL, NULL), (75, 15, 5, NULL, NULL, NULL)
        ON CONFLICT (id) DO NOTHING;

        -- 11. Insert Answer Choices
        INSERT INTO answer_choices (answer_id, choice_id) VALUES
        -- S1
        (1, 2), (2, 6), (3, 10), (4, 14), (5, 18),
        -- S2
        (6, 2), (7, 6), (8, 10), (9, 14), (10, 17),
        -- S3
        (11, 2), (12, 6), (13, 10), (14, 13), (15, 17),
        -- S4
        (16, 2), (17, 6), (18, 9), (19, 13), (20, 17),
        -- S5
        (21, 2), (22, 6), (23, 10), (24, 14), (25, 18),
        -- S6
        (26, 2), (27, 6), (28, 10), (29, 14), (30, 17),
        -- S7
        (31, 2), (32, 6), (33, 10), (34, 13), (35, 17),
        -- S8
        (36, 2), (37, 6), (38, 9), (39, 13), (40, 17),
        -- S9
        (41, 2), (42, 6), (43, 10), (44, 14), (45, 18),
        -- S10
        (46, 2), (47, 6), (48, 10), (49, 14), (50, 17),
        -- S11
        (51, 2), (52, 6), (53, 10), (54, 13), (55, 17),
        -- S12
        (56, 2), (57, 6), (58, 9), (59, 13), (60, 17),
        -- S13
        (61, 2), (62, 6), (63, 10), (64, 14), (65, 18),
        -- S14
        (66, 2), (67, 6), (68, 10), (69, 14), (70, 17),
        -- S15
        (71, 2), (72, 6), (73, 10), (74, 13), (75, 17)
        ON CONFLICT DO NOTHING;

        -- 12. Insert Results
        INSERT INTO results (id, submission_id, score, total_questions, correct_answers, wrong_answers, percentage, passed, pending_manual_grade, manually_graded, created_at, updated_at) VALUES
        (1, 1, 10.0, 5, 5, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (2, 2, 8.0, 5, 4, 1, 80.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (3, 3, 6.0, 5, 3, 2, 60.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (4, 4, 4.0, 5, 2, 3, 40.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 5, 10.0, 5, 5, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (6, 6, 8.0, 5, 4, 1, 80.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (7, 7, 6.0, 5, 3, 2, 60.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (8, 8, 4.0, 5, 2, 3, 40.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (9, 9, 10.0, 5, 5, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (10, 10, 8.0, 5, 4, 1, 80.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (11, 11, 6.0, 5, 3, 2, 60.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (12, 12, 4.0, 5, 2, 3, 40.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (13, 13, 10.0, 5, 5, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (14, 14, 8.0, 5, 4, 1, 80.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (15, 15, 6.0, 5, 3, 2, 60.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;

        -- 13. Sync primary key sequences in PostgreSQL to prevent ID conflicts on future user-inserted rows
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
    END IF;
END $$;
