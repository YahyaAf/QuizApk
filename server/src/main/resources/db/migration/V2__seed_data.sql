-- Migration V2: Reseed Expert Data

DO $$
BEGIN
    -- Seeding only if the environment requires it, or we force it.
    -- We will truncate the tables to replace with expert data.
    TRUNCATE TABLE results, answer_choices, answers, submissions, choices, questions, exams, user_badges, badges, users, student_groups, modules RESTART IDENTITY CASCADE;

    -- 1. Insert Modules
    INSERT INTO modules (id, name, description, created_at, updated_at) VALUES
    (1, 'Génie Logiciel & Architecture', 'Conception et architecture logicielle, patrons de conception, et Microservices.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Data Science & Machine Learning', 'Apprentissage automatique, réseaux de neurones, et analyse de données massives.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Cloud Computing & DevOps', 'Déploiement continu, Docker, Kubernetes, et infrastructures cloud.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Cybersécurité', 'Sécurité des systèmes et réseaux, cryptographie et hacking éthique.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'Développement Web Full-Stack', 'Création d''applications web modernes avec React et Spring Boot.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 2. Insert Student Groups
    INSERT INTO student_groups (id, name, description, created_at, updated_at) VALUES
    (1, 'Master Ingénierie Logicielle (M2 IL)', 'Étudiants en dernière année spécialisés en développement.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Master Data & IA (M2)', 'Étudiants spécialisés en Intelligence Artificielle.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Licence Informatique (L3)', 'Étudiants en fin de cycle licence.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 3. Insert Badges (Include color column)
    INSERT INTO badges (id, name, description, icon_url, color, created_at, updated_at) VALUES
    (1, 'Top 1', 'Premier(e) du classement général', 'Trophy', '#F7AD19', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Top 2', 'Deuxième du classement général', 'Medal', '#9CA3AF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Top 3', 'Troisième du classement général', 'Medal', '#D97706', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Score Parfait', 'Score de 100% à tous les examens passés', 'Crown', '#16A34A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'Bonne Moyenne', 'Moyenne générale supérieure à 60%', 'TrendingUp', '#92400E', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'Expert Spring Boot', 'Démontre une maîtrise exceptionnelle de Spring Boot.', 'Star', '#16A34A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'Génie de l''IA', 'Capacité remarquable en apprentissage automatique.', 'Brain', '#8B5CF6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 4. Insert Users
    -- Hash: $2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2  (password: password123)
    INSERT INTO users (id, email, password, first_name, last_name, role, blocked, group_id, created_at, updated_at) VALUES
    -- Admin
    (1, 'admin@expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Ahmed', 'Directeur', 'ROLE_ADMIN', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Teachers
    (2, 'karim.lahlou@expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Karim', 'Lahlou', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'nadia.benali@expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Nadia', 'Benali', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'youssef.haddad@expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Youssef', 'Haddad', 'ROLE_TEACHER', FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Students (M2 IL - Group 1)
    (5, 'yassine.m@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Yassine', 'Mansouri', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'salma.c@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Salma', 'Chraibi', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'omar.b@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Omar', 'Berrada', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 'imane.k@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Imane', 'Kettani', 'ROLE_STUDENT', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Students (M2 IA - Group 2)
    (9, 'amine.k@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Amine', 'Kabbaj', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 'hind.t@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Hind', 'Tazi', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, 'mehdi.b@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Mehdi', 'Bennani', 'ROLE_STUDENT', FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Students (L3 Info - Group 3)
    (12, 'sara.a@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Sara', 'Alaoui', 'ROLE_STUDENT', FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (13, 'khalid.e@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Khalid', 'El Fassi', 'ROLE_STUDENT', FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (14, 'noura.m@etudiant.expert.ma', '$2b$10$PhTVyZnOpZsi.uZ5lNLwM.kf6U.pqnkLlZ/hiYOmGRqfkVLIV/tQ2', 'Noura', 'Mourad', 'ROLE_STUDENT', FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Insert User Badges
    INSERT INTO user_badges (user_id, badge_id) VALUES
    (5, 1), (5, 4), (5, 5), (5, 6), -- Yassine: Top 1, Perfect Score, Good Average, Expert Spring
    (6, 2), (6, 5),                 -- Salma: Top 2, Good Average
    (10, 3), (10, 5), (10, 7);      -- Hind: Top 3, Good Average, Genie IA

    -- 5. Insert Exams
    INSERT INTO exams (id, title, description, duration_minutes, available_from, available_until, max_attempts, total_marks, published, status, scheduled_start_time, module_id, group_id, created_by_id, created_at, updated_at) VALUES
    -- Exam 1: Microservices (Prof: Karim Lahlou) - Group 1
    (1, 'Architecture Microservices & Spring Cloud', 'Cet examen évalue votre compréhension approfondie des architectures distribuées, de la résilience (Circuit Breaker) et du déploiement continu des microservices.', 60, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days', 1, 20, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '15 days', 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Exam 2: Machine Learning (Prof: Nadia Benali) - Group 2
    (2, 'Deep Learning & Réseaux de Neurones', 'Évaluation sur les CNN, RNN, l''optimisation des hyperparamètres et la prévention de l''overfitting.', 90, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '20 days', 1, 20, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '5 days', 2, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Exam 3: Cybersecurity (Prof: Youssef Haddad) - Group 1
    (3, 'Sécurité Applicative et Hacking Éthique', 'Principes de cryptographie, OWASP Top 10, et sécurisation des API REST (OAuth2, JWT).', 60, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '10 days', 1, 15, TRUE, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '2 days', 4, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 6. Insert Questions
    -- Microservices Exam (Exam 1)
    INSERT INTO questions (id, statement, type, points, explanation, exam_id, question_bank_id, created_at, updated_at) VALUES
    (1, 'Dans une architecture microservices, quel est le rôle principal d''un "API Gateway" (ex: Spring Cloud Gateway) ?', 'SINGLE_CHOICE', 5, 'L''API Gateway sert de point d''entrée unique, gérant le routage, l''authentification, et le load balancing.', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Le pattern "Circuit Breaker" (ex: Resilience4j) permet de :', 'SINGLE_CHOICE', 5, 'Il empêche les appels répétitifs à un service défaillant, évitant ainsi un effet domino sur le système.', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Quels sont les avantages d''utiliser Kafka comme bus de messages par rapport aux appels REST synchrones ? (Plusieurs réponses possibles)', 'MULTIPLE_CHOICE', 5, 'Kafka permet le découplage, l''asynchronisme, et une grande tolérance aux pannes.', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Un microservice doit idéalement partager sa base de données avec d''autres microservices pour faciliter les jointures.', 'TRUE_FALSE', 5, 'Faux. Le principe "Database per Service" stipule que chaque microservice doit avoir sa propre base de données pour garantir un couplage faible.', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Machine Learning Exam (Exam 2)
    (5, 'Dans un réseau de neurones convolutif (CNN), à quoi sert une couche de "Pooling" (ex: MaxPooling) ?', 'SINGLE_CHOICE', 5, 'Le Pooling réduit la dimension spatiale des données, diminuant la charge de calcul et contrôlant l''overfitting.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'Quelle fonction d''activation est privilégiée pour la couche de sortie d''une classification multi-classes ?', 'SINGLE_CHOICE', 5, 'Le Softmax convertit les scores en probabilités sommables à 1.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'La "Régularisation L2" ajoute une pénalité égale à la valeur absolue de la magnitude des poids.', 'TRUE_FALSE', 5, 'Faux. C''est la régularisation L1 qui utilise la valeur absolue. L2 utilise le carré.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 'Sélectionnez les algorithmes d''apprentissage non-supervisé :', 'MULTIPLE_CHOICE', 5, 'K-Means et PCA ne nécessitent pas de labels.', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Cybersecurity Exam (Exam 3)
    (9, 'Quelle attaque OWASP Top 10 consiste à injecter des scripts malveillants exécutés par le navigateur de la victime ?', 'SINGLE_CHOICE', 5, 'Le XSS (Cross-Site Scripting) cible le navigateur client.', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 'L''utilisation exclusive de HTTPS protège complètement contre les attaques XSS et SQL Injection.', 'TRUE_FALSE', 5, 'Faux. HTTPS chiffre le transport, mais ne valide pas les entrées applicatives.', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, 'Dans le standard OAuth2, quel est le rôle du "Authorization Server" ?', 'SINGLE_CHOICE', 5, 'Il authentifie l''utilisateur et émet des Access Tokens.', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 7. Insert Choices
    INSERT INTO choices (id, label, is_correct, question_id) VALUES
    -- Q1 Choices (API Gateway)
    (1, 'Stocker les données de tous les microservices de manière centralisée.', FALSE, 1),
    (2, 'Agir comme un point d''entrée unique, gérant le routage, la sécurité et le Rate Limiting.', TRUE, 1),
    (3, 'Remplacer le système de contrôle de version (Git).', FALSE, 1),
    -- Q2 Choices (Circuit Breaker)
    (4, 'Chiffrer les données en transit.', FALSE, 2),
    (5, 'Arrêter l''envoi de requêtes vers un service défaillant pour protéger le système global.', TRUE, 5),
    (6, 'Accélérer les requêtes SQL lentes.', FALSE, 2),
    -- Q3 Choices (Kafka - Multiple)
    (7, 'Fort découplage entre les producteurs et les consommateurs.', TRUE, 3),
    (8, 'Temps de réponse garanti de 1 milliseconde pour les transactions ACID inter-services.', FALSE, 3),
    (9, 'Tolérance aux pannes et résilience en cas de crash d''un consommateur.', TRUE, 3),
    -- Q4 Choices (DB per service)
    (10, 'Vrai', FALSE, 4),
    (11, 'Faux', TRUE, 4),

    -- Q5 Choices (Pooling)
    (12, 'À augmenter le nombre de paramètres pour un apprentissage plus fin.', FALSE, 5),
    (13, 'À réduire la dimension spatiale pour accélérer le calcul et réduire l''overfitting.', TRUE, 5),
    (14, 'À ajouter de la couleur aux images.', FALSE, 5),
    -- Q6 Choices (Activation)
    (15, 'ReLU', FALSE, 6),
    (16, 'Sigmoid', FALSE, 6),
    (17, 'Softmax', TRUE, 6),
    -- Q7 Choices (L2)
    (18, 'Vrai', FALSE, 7),
    (19, 'Faux', TRUE, 7),
    -- Q8 Choices (Non-supervised)
    (20, 'K-Means', TRUE, 8),
    (21, 'Régression Logistique', FALSE, 8),
    (22, 'Analyse en Composantes Principales (PCA)', TRUE, 8),
    (23, 'Random Forest Classifier', FALSE, 8),

    -- Q9 Choices (XSS)
    (24, 'SQL Injection', FALSE, 9),
    (25, 'Cross-Site Scripting (XSS)', TRUE, 9),
    (26, 'Cross-Site Request Forgery (CSRF)', FALSE, 9),
    -- Q10 Choices (HTTPS)
    (27, 'Vrai', FALSE, 10),
    (28, 'Faux', TRUE, 10),
    -- Q11 Choices (OAuth2)
    (29, 'Héberger les ressources protégées (ex: les données utilisateur).', FALSE, 11),
    (30, 'Authentifier l''utilisateur et émettre les jetons d''accès.', TRUE, 11),
    (31, 'Fournir une interface utilisateur pour la connexion.', FALSE, 11);

    -- 8. Insert Submissions
    INSERT INTO submissions (id, student_id, exam_id, start_time, submit_time, created_at, updated_at) VALUES
    -- Exam 1: Microservices
    (1, 5, 1, CURRENT_TIMESTAMP - INTERVAL '2 days 10:00:00', CURRENT_TIMESTAMP - INTERVAL '2 days 09:15:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Yassine: 20/20
    (2, 6, 1, CURRENT_TIMESTAMP - INTERVAL '2 days 10:05:00', CURRENT_TIMESTAMP - INTERVAL '2 days 09:10:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Salma: 15/20
    (3, 7, 1, CURRENT_TIMESTAMP - INTERVAL '1 days 14:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 13:20:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Omar: 10/20
    (4, 8, 1, CURRENT_TIMESTAMP - INTERVAL '1 days 09:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 08:10:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Imane: 20/20

    -- Exam 2: Machine Learning
    (5, 9, 2, CURRENT_TIMESTAMP - INTERVAL '3 days 08:00:00', CURRENT_TIMESTAMP - INTERVAL '3 days 07:15:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Amine: 15/20
    (6, 10, 2, CURRENT_TIMESTAMP - INTERVAL '3 days 08:10:00', CURRENT_TIMESTAMP - INTERVAL '3 days 06:50:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Hind: 20/20
    (7, 11, 2, CURRENT_TIMESTAMP - INTERVAL '2 days 15:00:00', CURRENT_TIMESTAMP - INTERVAL '2 days 14:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Mehdi: 10/20

    -- Exam 3: Cybersecurity
    (8, 5, 3, CURRENT_TIMESTAMP - INTERVAL '1 days 10:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 09:30:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Yassine: 15/15
    (9, 6, 3, CURRENT_TIMESTAMP - INTERVAL '1 days 11:00:00', CURRENT_TIMESTAMP - INTERVAL '1 days 10:25:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- Salma: 15/15

    -- 9. Insert Answers
    INSERT INTO answers (id, submission_id, question_id, text_answer, teacher_score, teacher_feedback) VALUES
    -- Yassine (Exam 1)
    (1, 1, 1, NULL, NULL, NULL), (2, 1, 2, NULL, NULL, NULL), (3, 1, 3, NULL, NULL, NULL), (4, 1, 4, NULL, NULL, NULL),
    -- Salma (Exam 1)
    (5, 2, 1, NULL, NULL, NULL), (6, 2, 2, NULL, NULL, NULL), (7, 2, 3, NULL, NULL, NULL), (8, 2, 4, NULL, NULL, NULL),
    -- Omar (Exam 1)
    (9, 3, 1, NULL, NULL, NULL), (10, 3, 2, NULL, NULL, NULL), (11, 3, 3, NULL, NULL, NULL), (12, 3, 4, NULL, NULL, NULL),
    -- Imane (Exam 1)
    (13, 4, 1, NULL, NULL, NULL), (14, 4, 2, NULL, NULL, NULL), (15, 4, 3, NULL, NULL, NULL), (16, 4, 4, NULL, NULL, NULL),
    
    -- Amine (Exam 2)
    (17, 5, 5, NULL, NULL, NULL), (18, 5, 6, NULL, NULL, NULL), (19, 5, 7, NULL, NULL, NULL), (20, 5, 8, NULL, NULL, NULL),
    -- Hind (Exam 2)
    (21, 6, 5, NULL, NULL, NULL), (22, 6, 6, NULL, NULL, NULL), (23, 6, 7, NULL, NULL, NULL), (24, 6, 8, NULL, NULL, NULL),
    -- Mehdi (Exam 2)
    (25, 7, 5, NULL, NULL, NULL), (26, 7, 6, NULL, NULL, NULL), (27, 7, 7, NULL, NULL, NULL), (28, 7, 8, NULL, NULL, NULL),

    -- Yassine (Exam 3)
    (29, 8, 9, NULL, NULL, NULL), (30, 8, 10, NULL, NULL, NULL), (31, 8, 11, NULL, NULL, NULL),
    -- Salma (Exam 3)
    (32, 9, 9, NULL, NULL, NULL), (33, 9, 10, NULL, NULL, NULL), (34, 9, 11, NULL, NULL, NULL);

    -- 10. Insert Answer Choices
    INSERT INTO answer_choices (answer_id, choice_id) VALUES
    -- Yassine Exam 1 (20/20)
    (1, 2), (2, 5), (3, 7), (3, 9), (4, 11),
    -- Salma Exam 1 (15/20 - wrong on Q3)
    (5, 2), (6, 5), (7, 7), (7, 8), (8, 11),
    -- Omar Exam 1 (10/20 - wrong on Q1 and Q3)
    (9, 1), (10, 5), (11, 8), (12, 11),
    -- Imane Exam 1 (20/20)
    (13, 2), (14, 5), (15, 7), (15, 9), (16, 11),

    -- Amine Exam 2 (15/20 - wrong on Q8)
    (17, 13), (18, 17), (19, 19), (20, 20),
    -- Hind Exam 2 (20/20)
    (21, 13), (22, 17), (23, 19), (24, 20), (24, 22),
    -- Mehdi Exam 2 (10/20 - wrong on Q6 and Q7)
    (25, 13), (26, 15), (27, 18), (28, 20), (28, 22),

    -- Yassine Exam 3 (15/15)
    (29, 25), (30, 28), (31, 30),
    -- Salma Exam 3 (15/15)
    (32, 25), (33, 28), (34, 30);

    -- 11. Insert Results
    INSERT INTO results (id, submission_id, score, total_questions, correct_answers, wrong_answers, percentage, passed, pending_manual_grade, manually_graded, created_at, updated_at) VALUES
    -- Exam 1
    (1, 1, 20.0, 4, 4, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Yassine
    (2, 2, 15.0, 4, 3, 1, 75.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Salma
    (3, 3, 10.0, 4, 2, 2, 50.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Omar
    (4, 4, 20.0, 4, 4, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Imane

    -- Exam 2
    (5, 5, 15.0, 4, 3, 1, 75.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Amine
    (6, 6, 20.0, 4, 4, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Hind
    (7, 7, 10.0, 4, 2, 2, 50.0, FALSE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Mehdi

    -- Exam 3
    (8, 8, 15.0, 3, 3, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Yassine
    (9, 9, 15.0, 3, 3, 0, 100.0, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- Salma

    -- 12. Reset Sequences
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
